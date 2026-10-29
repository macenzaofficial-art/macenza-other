import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import config from '../next.config.mjs';

describe('Next.js security headers', () => {
  it('applies the security policy to every route', async () => {
    const rules = await config.headers();
    const globalRule = rules.find((rule) => rule.source === '/(.*)');
    assert.ok(globalRule, 'security headers must cover all routes');
    const headers = Object.fromEntries(globalRule.headers.map(({ key, value }) => [key.toLowerCase(), value]));

    assert.equal(headers['x-frame-options'], 'DENY');
    assert.equal(headers['x-content-type-options'], 'nosniff');
    assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
    assert.equal(headers['permissions-policy'], 'camera=(), microphone=(), geolocation=()');
    assert.equal(headers['strict-transport-security'], 'max-age=31536000; includeSubDomains; preload');
  });
});
