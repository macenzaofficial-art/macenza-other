// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/pages/Home', () => ({ default: () => null }));
vi.mock('@/components/pages/About', () => ({ default: () => null }));
vi.mock('@/components/pages/Solutions', () => ({ default: () => null }));
vi.mock('@/components/pages/Technology', () => ({ default: () => null }));
vi.mock('@/components/pages/Contact', () => ({ default: () => null }));
vi.mock('@/components/pages/Policy', () => ({ default: () => null }));
vi.mock('@/components/pages/Terms', () => ({ default: () => null }));
vi.mock('@/components/pages/CookiePolicy', () => ({ default: () => null }));
vi.mock('@/components/pages/Partnership', () => ({ default: () => null }));
vi.mock('@/components/pages/CertificateVerification', () => ({ default: () => null }));
vi.mock('@/components/admin/AdminClientWrapper', () => ({ default: () => null }));
vi.mock('@/components/ClientLayout', () => ({ default: () => null }));
vi.mock('next/font/google', () => {
  const font = () => ({ variable: '--test-font' });
  return { Outfit: font, Syne: font, Playfair_Display: font, Pinyon_Script: font, IBM_Plex_Serif: font };
});

describe('static route metadata', () => {
  it.each([
    ['/', () => import('../../app/page')],
    ['/about', () => import('../../app/about/page')],
    ['/solutions', () => import('../../app/solutions/page')],
    ['/technology', () => import('../../app/technology/page')],
    ['/contact', () => import('../../app/contact/page')],
    ['/privacy', () => import('../../app/privacy/page')],
    ['/terms', () => import('../../app/terms/page')],
    ['/cookie-policy', () => import('../../app/cookie-policy/page')],
    ['/partnership', () => import('../../app/partnership/page')],
    ['/certificateverification', () => import('../../app/certificateverification/page')],
  ])('provides a canonical URL and description for %s', async (path, load) => {
    const { metadata } = await load();
    expect(metadata.alternates.canonical).toBe(`https://www.macenza.com${path === '/' ? '' : path}`);
    expect(metadata.description.trim().length).toBeGreaterThan(0);
    // The root template appends the brand; child titles must not append it again.
    if (typeof metadata.title === 'string') expect(metadata.title).not.toMatch(/\| Macenza$/);
    else expect(metadata.title.absolute).toEqual(expect.any(String));
  });

  it('keeps all admin tabs out of search indexes and uses the admin canonical URL', async () => {
    const { metadata } = await import('../../app/admin/[[...tab]]/page');
    expect(metadata).toMatchObject({
      title: 'Admin Dashboard', description: 'Macenza Admin Portal',
      alternates: { canonical: 'https://www.macenza.com/admin' },
      robots: { index: false, follow: false },
    });
  });

  it('defines the shared title template and social metadata at the root', async () => {
    const { metadata } = await import('../../app/layout');
    expect(metadata.metadataBase.href).toBe('https://www.macenza.com/');
    expect(metadata.title).toEqual({ default: 'Macenza | AI Software Development Company', template: '%s | Macenza' });
    expect(metadata.openGraph).toMatchObject({ type: 'website', siteName: 'Macenza' });
    expect(metadata.twitter.card).toBe('summary_large_image');
  });
});
