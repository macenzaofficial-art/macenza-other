// Node 24+: node --experimental-test-module-mocks --test tests/submission-routes.test.js
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { after, afterEach, beforeEach, describe, it } from 'node:test';

// Next's bundler accepts this extensionless import; native Node ESM needs .js.
const resolver = registerHooks({
  resolve(specifier, context, nextResolve) {
    return nextResolve(specifier === 'next/server' ? 'next/server.js' : specifier, context);
  },
});
after(() => resolver.deregister());

const envKeys = [
  'HCAPTCHA_SECRET_KEY', 'RECAPTCHA_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];
let originalEnv;
let createClient;
let from;
let insert;
let fetchMock;
let moduleId = 0;

beforeEach((t) => {
  originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  for (const key of envKeys) delete process.env[key];
  process.env.HCAPTCHA_SECRET_KEY = 'synthetic-hcaptcha-secret';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'synthetic-anon-key';

  insert = t.mock.fn(async () => ({ error: null }));
  from = t.mock.fn(() => ({ insert }));
  createClient = t.mock.fn(() => ({ from }));
  t.mock.module('@supabase/supabase-js', { exports: { createClient } });
  fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ success: true }));
  t.mock.method(console, 'error', () => {});
});

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

const routes = [
  {
    name: 'submit-contact',
    table: 'contact_submissions',
    validBody: { name: 'Ada Lovelace', email: 'ada@example.com', captchaToken: 'synthetic-token' },
    requiredFields: ['name', 'email'],
    successMessage: 'Message sent successfully!',
    fallbackError: 'Error processing your message.',
  },
  {
    name: 'submit-application',
    table: 'applications',
    validBody: {
      candidateName: 'Ada Lovelace', email: 'ada@example.com', phone: '+1 555 0100',
      location: 'Remote', experience: '0', resumeUrl: 'https://example.com/resume.pdf',
      captchaToken: 'synthetic-token',
    },
    requiredFields: ['candidateName', 'email', 'phone', 'location', 'experience', 'resumeUrl'],
    successMessage: 'Application submitted successfully!',
    fallbackError: 'Error processing your application.',
  },
];

async function loadHandler(routeName) {
  // Avoid leaking the route's cached Supabase client across independent tests.
  const url = new URL(`../app/api/${routeName}/route.js?test=${++moduleId}`, import.meta.url);
  return (await import(url)).POST;
}

function request(body) {
  return new Request('https://example.com/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function assertResponse(response, status, body) {
  assert.equal(response.status, status);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), body);
}

function assertNoDatabaseAccess() {
  assert.equal(createClient.mock.callCount(), 0);
  assert.equal(from.mock.callCount(), 0);
  assert.equal(insert.mock.callCount(), 0);
}

for (const route of routes) {
  describe(`POST /api/${route.name}`, { concurrency: false }, () => {
    it('persists a verified submission and returns a JSON success response', async () => {
      const POST = await loadHandler(route.name);

      await assertResponse(await POST(request(route.validBody)), 200, {
        success: true, message: route.successMessage,
      });

      assert.equal(createClient.mock.callCount(), 1);
      assert.deepEqual(createClient.mock.calls[0].arguments, [
        'https://example.supabase.co', 'synthetic-anon-key',
      ]);
      assert.equal(from.mock.callCount(), 1);
      assert.deepEqual(from.mock.calls[0].arguments, [route.table]);
      assert.equal(insert.mock.callCount(), 1);
      assert.equal(fetchMock.mock.callCount(), 1);
      const [url, options] = fetchMock.mock.calls[0].arguments;
      assert.equal(url, 'https://api.hcaptcha.com/siteverify');
      assert.equal(options.method, 'POST');
      assert.equal(options.headers['Content-Type'], 'application/x-www-form-urlencoded');
      assert.ok(options.body instanceof URLSearchParams);
      assert.deepEqual([...options.body.entries()], [
        ['secret', 'synthetic-hcaptcha-secret'], ['response', 'synthetic-token'],
      ]);
    });

    for (const field of route.requiredFields) {
      for (const invalid of [undefined, null, '', ' \t\n ', 0, false, [], {}]) {
        it(`rejects ${field} = ${JSON.stringify(invalid)} before external calls`, async () => {
          const POST = await loadHandler(route.name);
          const body = { ...route.validBody, [field]: invalid };
          // Use an absent property as well as explicit invalid values.
          if (invalid === undefined) delete body[field];

          await assertResponse(await POST(request(body)), 400, {
            error: `Missing or invalid required field: ${field}`,
          });
          assert.equal(fetchMock.mock.callCount(), 0);
          assertNoDatabaseAccess();
        });
      }
    }

    for (const body of [null, [], 'unexpected body', 42]) {
      it(`rejects a non-object JSON body: ${JSON.stringify(body)}`, async () => {
        const POST = await loadHandler(route.name);
        await assertResponse(await POST(request(body)), 400, {
          error: `Missing or invalid required field: ${route.requiredFields[0]}`,
        });
        assert.equal(fetchMock.mock.callCount(), 0);
        assertNoDatabaseAccess();
      });
    }

    it('requires a CAPTCHA token before verification or persistence', async () => {
      const POST = await loadHandler(route.name);
      const { captchaToken, ...body } = route.validBody;
      assert.ok(captchaToken);
      await assertResponse(await POST(request(body)), 400, {
        error: 'Captcha verification token is required.',
      });
      assert.equal(fetchMock.mock.callCount(), 0);
      assertNoDatabaseAccess();
    });

    it('accepts the legacy token and secret configuration', async () => {
      delete process.env.HCAPTCHA_SECRET_KEY;
      process.env.RECAPTCHA_SECRET_KEY = 'synthetic-legacy-secret';
      const POST = await loadHandler(route.name);
      const body = { ...route.validBody, captchaToken: '', recaptchaToken: 'synthetic-legacy-token' };

      assert.equal((await POST(request(body))).status, 200);
      const options = fetchMock.mock.calls[0].arguments[1];
      assert.equal(options.body.get('secret'), 'synthetic-legacy-secret');
      assert.equal(options.body.get('response'), 'synthetic-legacy-token');
    });

    it('prefers the current CAPTCHA token and secret over legacy values', async () => {
      process.env.RECAPTCHA_SECRET_KEY = 'synthetic-legacy-secret';
      const POST = await loadHandler(route.name);
      assert.equal((await POST(request({ ...route.validBody, recaptchaToken: 'legacy-token' }))).status, 200);
      const options = fetchMock.mock.calls[0].arguments[1];
      assert.equal(options.body.get('secret'), 'synthetic-hcaptcha-secret');
      assert.equal(options.body.get('response'), 'synthetic-token');
    });

    it('reports missing CAPTCHA configuration without making external calls', async () => {
      delete process.env.HCAPTCHA_SECRET_KEY;
      const POST = await loadHandler(route.name);
      await assertResponse(await POST(request(route.validBody)), 500, {
        error: 'hCaptcha secret key is not configured on the server.',
      });
      assert.equal(fetchMock.mock.callCount(), 0);
      assertNoDatabaseAccess();
    });

    for (const verification of [{ success: false }, {}]) {
      it(`prevents persistence when CAPTCHA verification returns ${JSON.stringify(verification)}`, async () => {
        fetchMock.mock.mockImplementation(async () => Response.json(verification));
        const POST = await loadHandler(route.name);
        await assertResponse(await POST(request(route.validBody)), 400, {
          error: 'Captcha verification failed. Please try again.',
        });
        assert.equal(fetchMock.mock.callCount(), 1);
        assertNoDatabaseAccess();
      });
    }

    it('does not write to the database before CAPTCHA verification completes', { timeout: 10000 }, async (t) => {
      let releaseVerification;
      let markVerificationStarted;
      const verificationStarted = new Promise((resolve) => { markVerificationStarted = resolve; });
      const verificationResponse = new Promise((resolve) => { releaseVerification = resolve; });
      t.after(() => releaseVerification(Response.json({ success: false })));
      fetchMock.mock.mockImplementation(() => {
        markVerificationStarted();
        return verificationResponse;
      });
      const POST = await loadHandler(route.name);
      const responsePromise = POST(request(route.validBody));
      await verificationStarted;
      assertNoDatabaseAccess();
      releaseVerification(Response.json({ success: true }));
      assert.equal((await responsePromise).status, 200);
      assert.equal(insert.mock.callCount(), 1);
    });

    it('handles a CAPTCHA network failure without persisting', async () => {
      fetchMock.mock.mockImplementation(async () => { throw new Error('Verification unavailable'); });
      const POST = await loadHandler(route.name);
      await assertResponse(await POST(request(route.validBody)), 500, { error: 'Verification unavailable' });
      assertNoDatabaseAccess();
    });

    it('handles an unreadable CAPTCHA response without persisting', async () => {
      fetchMock.mock.mockImplementation(async () => ({
        json: async () => { throw new Error('Invalid CAPTCHA response'); },
      }));
      const POST = await loadHandler(route.name);
      await assertResponse(await POST(request(route.validBody)), 500, { error: 'Invalid CAPTCHA response' });
      assertNoDatabaseAccess();
    });

    for (const key of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']) {
      for (const value of [undefined, '', ' \t\n ']) {
        it(`reports ${key} = ${JSON.stringify(value)} after successful CAPTCHA verification`, async () => {
          if (value === undefined) delete process.env[key];
          else process.env[key] = value;
          const POST = await loadHandler(route.name);
          await assertResponse(await POST(request(route.validBody)), 500, {
            error: 'Supabase environment variables are not configured on the server.',
          });
          assert.equal(fetchMock.mock.callCount(), 1);
          assertNoDatabaseAccess();
        });
      }
    }

    it('retries client initialization after missing configuration is repaired', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      const POST = await loadHandler(route.name);
      assert.equal((await POST(request(route.validBody))).status, 500);
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
      assert.equal((await POST(request(route.validBody))).status, 200);
      assert.equal(createClient.mock.callCount(), 1);
      assert.equal(insert.mock.callCount(), 1);
    });

    it('reuses its database client while verifying every submission', async () => {
      const POST = await loadHandler(route.name);
      assert.equal((await POST(request(route.validBody))).status, 200);
      assert.equal((await POST(request(route.validBody))).status, 200);
      assert.equal(createClient.mock.callCount(), 1);
      assert.equal(fetchMock.mock.callCount(), 2);
      assert.equal(insert.mock.callCount(), 2);
    });

    for (const [label, error, expected] of [
      ['database error', new Error('Insert failed'), 'Insert failed'],
      ['database error without message', {}, route.fallbackError],
    ]) {
      it(`returns an error instead of success for a ${label}`, async () => {
        insert.mock.mockImplementation(async () => ({ error }));
        const POST = await loadHandler(route.name);
        await assertResponse(await POST(request(route.validBody)), 500, { error: expected });
        assert.equal(insert.mock.callCount(), 1);
      });
    }

    it('catches a rejected database operation', async () => {
      insert.mock.mockImplementation(async () => { throw new Error('Database offline'); });
      const POST = await loadHandler(route.name);
      await assertResponse(await POST(request(route.validBody)), 500, { error: 'Database offline' });
    });

    it('catches a client initialization failure', async () => {
      createClient.mock.mockImplementation(() => { throw new Error('Client initialization failed'); });
      const POST = await loadHandler(route.name);
      await assertResponse(await POST(request(route.validBody)), 500, { error: 'Client initialization failed' });
      assert.equal(insert.mock.callCount(), 0);
    });

    it('handles malformed JSON without verification or database access', async () => {
      const POST = await loadHandler(route.name);
      const response = await POST(new Request('https://example.com/api/submit', { method: 'POST', body: '{' }));
      assert.equal(response.status, 500);
      assert.equal(typeof (await response.json()).error, 'string');
      assert.equal(fetchMock.mock.callCount(), 0);
      assertNoDatabaseAccess();
    });
  });
}

describe('contact submission field mapping', () => {
  it('trims all string fields before insertion and omits CAPTCHA and unknown fields', async () => {
    const POST = await loadHandler('submit-contact');
    const response = await POST(request({
      name: ' Ada ', email: ' ada@example.com ', phone: ' +1 555 0100 ',
      company: ' Example ', project_type: ' Automation ', budget: ' 1000 ',
      details: ' Build an app ', captchaToken: 'synthetic-token', unexpected: 'ignored',
    }));
    assert.equal(response.status, 200);
    assert.deepEqual(insert.mock.calls[0].arguments, [{
      name: 'Ada', email: 'ada@example.com', phone: '+1 555 0100', company: 'Example',
      project_type: 'Automation', budget: '1000', details: 'Build an app',
    }]);
  });

  for (const value of [undefined, null, '', ' \t ', 42, false, {}, []]) {
    it(`uses safe optional-field defaults for ${JSON.stringify(value)}`, async () => {
      const POST = await loadHandler('submit-contact');
      const response = await POST(request({
        ...routes[0].validBody, phone: value, company: value,
        project_type: value, budget: value, details: value,
      }));
      assert.equal(response.status, 200);
      assert.deepEqual(insert.mock.calls[0].arguments, [{
        name: 'Ada Lovelace', email: 'ada@example.com', phone: '', company: '',
        project_type: 'AI Development', budget: '', details: '',
      }]);
    });
  }
});

describe('application submission field mapping and resume validation', () => {
  it('maps the application to one database row and omits CAPTCHA and unknown fields', async () => {
    const POST = await loadHandler('submit-application');
    const response = await POST(request({
      ...routes[1].validBody, linkedInUrl: 'https://example.com/linkedin',
      portfolioUrl: 'https://example.com/portfolio', coverLetter: 'My experience',
      jobId: 'job-123', unexpected: 'ignored',
    }));
    assert.equal(response.status, 200);
    assert.deepEqual(insert.mock.calls[0].arguments, [[{
      candidate_name: 'Ada Lovelace', email: 'ada@example.com', phone: '+1 555 0100',
      location: 'Remote', experience: '0', resume_url: 'https://example.com/resume.pdf',
      linkedin_url: 'https://example.com/linkedin', portfolio_url: 'https://example.com/portfolio',
      cover_letter: 'My experience', job_id: 'job-123',
    }]]);
  });

  it('uses empty optional text and a null job ID for a general application', async () => {
    const POST = await loadHandler('submit-application');
    assert.equal((await POST(request(routes[1].validBody))).status, 200);
    const row = insert.mock.calls[0].arguments[0][0];
    assert.equal(row.linkedin_url, '');
    assert.equal(row.portfolio_url, '');
    assert.equal(row.cover_letter, '');
    assert.equal(row.job_id, null);
  });

  for (const resumeUrl of ['https://example.com/resume.pdf', 'http://example.com/resume.pdf', ' https://example.com/resume.pdf ']) {
    it(`accepts an HTTP(S) resume URL: ${JSON.stringify(resumeUrl)}`, async () => {
      const POST = await loadHandler('submit-application');
      assert.equal((await POST(request({ ...routes[1].validBody, resumeUrl }))).status, 200);
      assert.equal(insert.mock.calls[0].arguments[0][0].resume_url, resumeUrl);
    });
  }

  for (const resumeUrl of [
    'not a URL', '/resume.pdf', '//example.com/resume.pdf', 'https://',
    'ftp://example.com/resume.pdf', 'javascript:alert(1)', 'data:application/pdf;base64,AA==',
    'file:///tmp/resume.pdf',
  ]) {
    it(`rejects an unsafe or malformed resume URL: ${resumeUrl}`, async () => {
      const POST = await loadHandler('submit-application');
      await assertResponse(await POST(request({ ...routes[1].validBody, resumeUrl })), 400, {
        error: 'Invalid resume URL. Must be a valid HTTP or HTTPS URL.',
      });
      assert.equal(fetchMock.mock.callCount(), 0);
      assertNoDatabaseAccess();
    });
  }
});
