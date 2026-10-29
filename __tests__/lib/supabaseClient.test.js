// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, client } = vi.hoisted(() => ({ createClient: vi.fn(), client: {} }));
vi.mock('@supabase/supabase-js', () => ({ createClient }));

beforeEach(() => {
  vi.resetModules();
  createClient.mockReset().mockReturnValue(client);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', undefined);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', undefined);
});

afterEach(() => vi.unstubAllEnvs());

describe('Supabase configuration', () => {
  it.each([
    [undefined, undefined],
    ['', 'anon-key'],
    [' \t\n', 'anon-key'],
    ['https://test.supabase.co', undefined],
    ['https://test.supabase.co', ''],
    ['https://test.supabase.co', ' \t\n'],
  ])('does not construct a client for URL %j and key %j', async (url, key) => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', url);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', key);
    const module = await import('../../lib/supabaseClient');
    expect(module.isSupabaseConfigured).toBe(false);
    expect(module.supabase).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('constructs and exports a single client with the public credentials', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-anon-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'unused-service-key');
    const module = await import('../../lib/supabaseClient');
    expect(module.isSupabaseConfigured).toBe(true);
    expect(module.supabase).toBe(client);
    expect(createClient).toHaveBeenCalledExactlyOnceWith('https://test.supabase.co', 'public-anon-key');
    expect((await import('../../lib/supabaseClient')).supabase).toBe(client);
    expect(createClient).toHaveBeenCalledTimes(1);
  });

  it('does not fall back to legacy Vite credentials', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://legacy.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'legacy-key');
    expect((await import('../../lib/supabaseClient')).supabase).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });
});
