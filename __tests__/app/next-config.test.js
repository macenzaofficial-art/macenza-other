// @vitest-environment node
import { describe, expect, it } from 'vitest';
import config from '../../next.config.mjs';

describe('migrated Next.js configuration', () => {
  it('applies the existing security headers to every route', async () => {
    const entries = await config.headers();
    const allRoutes = entries.find(entry => entry.source === '/(.*)');
    expect(allRoutes).toBeDefined();
    expect(Object.fromEntries(allRoutes.headers.map(({ key, value }) => [key, value]))).toEqual({
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    });
  });

  it('limits remote image hosts to HTTPS Sanity and Supabase storage', () => {
    expect(config.images.remotePatterns).toEqual([
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ]);
  });
});
