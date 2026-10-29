// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({ createClient: vi.fn(), from: vi.fn(), insert: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: db.createClient }));

const contact = {
  name: 'Test Sender',
  email: 'sender@example.test',
  captchaToken: 'synthetic-token',
};
const application = {
  candidateName: 'Test Candidate',
  email: 'candidate@example.test',
  phone: '1234567890',
  location: 'Remote',
  experience: '0',
  resumeUrl: 'https://files.example.test/resume.pdf',
  captchaToken: 'synthetic-token',
};
const routes = [
  {
    name: 'contact',
    load: () => import('../../app/api/submit-contact/route'),
    valid: contact,
    fields: ['name', 'email'],
    message: 'Message sent successfully!',
    fallback: 'Error processing your message.',
  },
  {
    name: 'application',
    load: () => import('../../app/api/submit-application/route'),
    valid: application,
    fields: ['candidateName', 'email', 'phone', 'location', 'experience', 'resumeUrl'],
    message: 'Application submitted successfully!',
    fallback: 'Error processing your application.',
  },
];

function request(body) {
  return new Request('https://www.macenza.com/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function expectJson(response, status, body) {
  expect(response.status).toBe(status);
  expect(response.headers.get('content-type')).toContain('application/json');
  expect(await response.json()).toEqual(body);
}

beforeEach(() => {
  vi.resetModules(); // Isolate the lazy, module-level Supabase cache between cases.
  db.createClient.mockReset().mockReturnValue({ from: db.from });
  db.from.mockReset().mockReturnValue({ insert: db.insert });
  db.insert.mockReset().mockResolvedValue({ error: null });
  vi.stubEnv('HCAPTCHA_SECRET_KEY', 'synthetic-secret');
  vi.stubEnv('RECAPTCHA_SECRET_KEY', undefined);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-anon-key');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ success: true }) }));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe.each(routes)('$name POST route', ({ load, valid, fields, message, fallback }) => {
  for (const field of fields) {
    it.each([undefined, null, '', ' \t\n', 42, false, [], {}].map(value => [value]))(
      `rejects invalid ${field}: %j before contacting any service`,
      async (value) => {
        const { POST } = await load();
        await expectJson(await POST(request({ ...valid, [field]: value })), 400, {
          error: `Missing or invalid required field: ${field}`,
        });
        expect(fetch).not.toHaveBeenCalled();
        expect(db.createClient).not.toHaveBeenCalled();
        expect(db.insert).not.toHaveBeenCalled();
      },
    );
  }

  it.each([null, {}, []].map(value => [value]))('rejects an empty or non-object payload: %j', async (body) => {
    const { POST } = await load();
    await expectJson(await POST(request(body)), 400, {
      error: `Missing or invalid required field: ${fields[0]}`,
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('catches malformed JSON without making external calls', async () => {
    const { POST } = await load();
    const response = await POST(new Request('https://www.macenza.com/api/test', { method: 'POST', body: '{' }));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: expect.any(String) });
    expect(fetch).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('requires a captcha token', async () => {
    const { POST } = await load();
    await expectJson(await POST(request({ ...valid, captchaToken: undefined })), 400, {
      error: 'Captcha verification token is required.',
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('requires a configured captcha secret', async () => {
    vi.stubEnv('HCAPTCHA_SECRET_KEY', undefined);
    const { POST } = await load();
    await expectJson(await POST(request(valid)), 500, {
      error: 'hCaptcha secret key is not configured on the server.',
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('verifies the token before inserting and uses URL-encoded hCaptcha parameters', async () => {
    const { POST } = await load();
    await expectJson(await POST(request({ ...valid, captchaToken: 'token +&=' })), 200, { success: true, message });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('https://api.hcaptcha.com/siteverify');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' });
    expect(options.body).toBeInstanceOf(URLSearchParams);
    expect([...options.body.entries()]).toEqual([
      ['secret', 'synthetic-secret'],
      ['response', 'token +&='],
    ]);
    expect(fetch.mock.invocationCallOrder[0]).toBeLessThan(db.insert.mock.invocationCallOrder[0]);
  });

  it('supports legacy token and secret field names', async () => {
    vi.stubEnv('HCAPTCHA_SECRET_KEY', undefined);
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'legacy-secret');
    const { POST } = await load();
    await expectJson(await POST(request({ ...valid, captchaToken: '', recaptchaToken: 'legacy-token' })), 200, {
      success: true, message,
    });
    const options = fetch.mock.calls[0][1];
    expect(options.body.get('secret')).toBe('legacy-secret');
    expect(options.body.get('response')).toBe('legacy-token');
  });

  it('prefers hCaptcha credentials when both forms are supplied', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'unused-secret');
    const { POST } = await load();
    await POST(request({ ...valid, recaptchaToken: 'unused-token' }));
    expect(fetch.mock.calls[0][1].body.get('secret')).toBe('synthetic-secret');
    expect(fetch.mock.calls[0][1].body.get('response')).toBe(valid.captchaToken);
  });

  it.each([{ success: false }, {}])('does not insert after a failed captcha: %j', async (verification) => {
    fetch.mockResolvedValue({ json: async () => verification });
    const { POST } = await load();
    await expectJson(await POST(request(valid)), 400, {
      error: 'Captcha verification failed. Please try again.',
    });
    expect(db.createClient).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it.each(['network', 'json'])('handles a captcha %s failure without writing to the database', async (failure) => {
    const error = new Error('Captcha provider unavailable');
    if (failure === 'network') fetch.mockRejectedValue(error);
    else fetch.mockResolvedValue({ json: vi.fn().mockRejectedValue(error) });
    const { POST } = await load();
    await expectJson(await POST(request(valid)), 500, { error: error.message });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it.each([
    ['NEXT_PUBLIC_SUPABASE_URL', undefined],
    ['NEXT_PUBLIC_SUPABASE_URL', ' \t'],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', undefined],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', ' \t'],
  ])('handles unconfigured %s = %j without constructing a client', async (name, value) => {
    vi.stubEnv(name, value);
    const { POST } = await load();
    await expectJson(await POST(request(valid)), 500, {
      error: 'Supabase environment variables are not configured on the server.',
    });
    expect(db.createClient).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('caches the client across successful requests and uses the anonymous key', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'unused-service-key');
    const { POST } = await load();
    await expectJson(await POST(request(valid)), 200, { success: true, message });
    await expectJson(await POST(request(valid)), 200, { success: true, message });
    expect(db.createClient).toHaveBeenCalledExactlyOnceWith('https://test.supabase.co', 'public-anon-key');
    expect(db.insert).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('can recover when credentials are configured after an earlier failure', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', undefined);
    const { POST } = await load();
    expect((await POST(request(valid))).status).toBe(500);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    await expectJson(await POST(request(valid)), 200, { success: true, message });
    expect(db.createClient).toHaveBeenCalledTimes(1);
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it('does not cache a failed client initialization', async () => {
    db.createClient.mockImplementationOnce(() => { throw new Error('Invalid Supabase URL'); });
    const { POST } = await load();
    await expectJson(await POST(request(valid)), 500, { error: 'Invalid Supabase URL' });
    expect(db.insert).not.toHaveBeenCalled();
    await expectJson(await POST(request(valid)), 200, { success: true, message });
    expect(db.createClient).toHaveBeenCalledTimes(2);
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  it('returns database errors as JSON', async () => {
    db.insert.mockResolvedValue({ error: { message: 'Insert rejected' } });
    const { POST } = await load();
    await expectJson(await POST(request(valid)), 500, { error: 'Insert rejected' });
  });

  it('provides a fallback message for errors without a message', async () => {
    db.insert.mockRejectedValue({ code: 'UNAVAILABLE' });
    const { POST } = await load();
    await expectJson(await POST(request(valid)), 500, { error: fallback });
  });
});

describe('contact payload mapping', () => {
  it('trims string values and writes only database columns', async () => {
    const { POST } = await routes[0].load();
    await POST(request({
      ...contact,
      name: ' Test Sender ', email: ' sender@example.test ', phone: ' 123 ', company: ' Test Co ',
      project_type: ' Web Development ', budget: ' 5000 ', details: ' Build an app ', ignored: 'extra',
    }));
    expect(db.from).toHaveBeenCalledExactlyOnceWith('contact_submissions');
    expect(db.insert).toHaveBeenCalledExactlyOnceWith({
      name: 'Test Sender', email: 'sender@example.test', phone: '123', company: 'Test Co',
      project_type: 'Web Development', budget: '5000', details: 'Build an app',
    });
  });

  it.each([undefined, null, 42, false, {}, [], ' \t'].map(value => [value]))('safely defaults optional values: %j', async (value) => {
    const { POST } = await routes[0].load();
    await POST(request({ ...contact, phone: value, company: value, project_type: value, budget: value, details: value }));
    expect(db.insert).toHaveBeenCalledExactlyOnceWith({
      name: contact.name, email: contact.email, phone: '', company: '',
      project_type: 'AI Development', budget: '', details: '',
    });
  });
});

describe('application payload mapping and resume URLs', () => {
  it.each(['https://files.example.test/resume.pdf', 'http://files.example.test/resume.pdf'])('accepts %s', async (resumeUrl) => {
    const { POST } = await routes[1].load();
    expect((await POST(request({ ...application, resumeUrl }))).status).toBe(200);
    expect(db.insert).toHaveBeenCalledWith([expect.objectContaining({ resume_url: resumeUrl })]);
  });

  it.each([
    'javascript:alert(1)', 'data:application/pdf;base64,AAAA', 'file:///resume.pdf',
    'ftp://files.example.test/resume.pdf', '/resume.pdf', '//files.example.test/resume.pdf', 'not a URL',
  ])('rejects unsafe or relative resume URL %s before captcha verification', async (resumeUrl) => {
    const { POST } = await routes[1].load();
    await expectJson(await POST(request({ ...application, resumeUrl })), 400, {
      error: 'Invalid resume URL. Must be a valid HTTP or HTTPS URL.',
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('maps a job-specific application to the existing database schema', async () => {
    const { POST } = await routes[1].load();
    await POST(request({
      ...application, linkedInUrl: 'https://linkedin.com/in/test', portfolioUrl: 'https://example.test',
      coverLetter: 'Please consider my application.', jobId: 'job-123', ignored: 'extra',
    }));
    expect(db.from).toHaveBeenCalledExactlyOnceWith('applications');
    expect(db.insert).toHaveBeenCalledExactlyOnceWith([{
      candidate_name: application.candidateName, email: application.email, phone: application.phone,
      location: application.location, experience: '0', resume_url: application.resumeUrl,
      linkedin_url: 'https://linkedin.com/in/test', portfolio_url: 'https://example.test',
      cover_letter: 'Please consider my application.', job_id: 'job-123',
    }]);
  });

  it('supports general applications without optional links, cover letter, or job ID', async () => {
    const { POST } = await routes[1].load();
    await POST(request(application));
    expect(db.insert).toHaveBeenCalledWith([expect.objectContaining({
      linkedin_url: '', portfolio_url: '', cover_letter: '', job_id: null,
    })]);
  });
});
