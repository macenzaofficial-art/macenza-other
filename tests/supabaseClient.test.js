// Node 24+: node --experimental-test-module-mocks --test tests/supabaseClient.test.js
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

const envKeys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
let originalEnv;
let createClient;
let client;
let moduleId = 0;

beforeEach((t) => {
  originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  for (const key of envKeys) delete process.env[key];
  client = { from: t.mock.fn() };
  createClient = t.mock.fn(() => client);
  t.mock.module('@supabase/supabase-js', { exports: { createClient } });
});

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function loadClient() {
  // Configuration is evaluated at import time; each case needs a fresh module.
  return import(new URL(`../lib/supabaseClient.js?test=${++moduleId}`, import.meta.url));
}

describe('Supabase client configuration', { concurrency: false }, () => {
  for (const [label, url, key] of [
    ['both settings missing', undefined, undefined],
    ['URL missing', undefined, 'synthetic-anon-key'],
    ['key missing', 'https://example.supabase.co', undefined],
    ['URL empty', '', 'synthetic-anon-key'],
    ['key empty', 'https://example.supabase.co', ''],
    ['URL whitespace', ' \t\n ', 'synthetic-anon-key'],
    ['key whitespace', 'https://example.supabase.co', ' \t\n '],
    ['both settings whitespace', ' ', ' '],
  ]) {
    it(`disables the client when ${label}`, async () => {
      if (url !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = url;
      if (key !== undefined) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = key;

      const result = await loadClient();

      assert.equal(result.isSupabaseConfigured, false);
      assert.equal(result.supabase, null);
      assert.equal(createClient.mock.callCount(), 0);
    });
  }

  it('creates and exports the client with both public settings', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'synthetic-anon-key';

    const result = await loadClient();

    assert.equal(result.isSupabaseConfigured, true);
    assert.equal(result.supabase, client);
    assert.equal(createClient.mock.callCount(), 1);
    assert.deepEqual(createClient.mock.calls[0].arguments, [
      'https://example.supabase.co', 'synthetic-anon-key',
    ]);
  });
});
