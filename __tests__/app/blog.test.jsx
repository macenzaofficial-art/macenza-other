// @vitest-environment node
// Unit-test server data flow by awaiting page functions; do not mount async components.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), urlFor: vi.fn(), notFound: vi.fn() }));
vi.mock('@/lib/sanityClient', () => ({ sanityClient: { fetch: mocks.fetch }, urlFor: mocks.urlFor }));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('@/components/pages/Blog', () => ({ default: () => null }));
vi.mock('@/components/pages/BlogPost', () => ({ default: () => null }));

import BlogIndex, { metadata as indexMetadata, revalidate as indexRevalidate } from '../../app/blog/page';
import BlogArticle, { generateMetadata, revalidate } from '../../app/blog/[slug]/page';
import Blog from '../../components/pages/Blog';
import BlogPost from '../../components/pages/BlogPost';

const post = {
  _id: 'document-1', title: 'Building AI Apps', slug: { current: 'editorial-url' },
  publishedAt: '2026-10-01T00:00:00Z', authorName: 'Test Author',
  body: [{ _type: 'block', children: [{ text: 'A useful ' }, { text: 'article.' }] }],
};
const props = (slug) => ({ params: Promise.resolve({ slug }) });

beforeEach(() => {
  mocks.fetch.mockReset().mockResolvedValue([post]);
  mocks.urlFor.mockReset();
  mocks.notFound.mockReset().mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('blog index server data', () => {
  it('supplies initial posts and limits fetched bodies to preview blocks', async () => {
    const element = await BlogIndex();
    expect(element.type).toBe(Blog);
    expect(element.props.initialPosts).toEqual([post]);
    const [query] = mocks.fetch.mock.calls[0];
    expect(query).toContain('order(publishedAt desc)');
    expect(query).toContain('"body": body[0...1]');
    expect(indexRevalidate).toBe(300);
  });

  it.each([null, undefined, []].map(value => [value]))('supplies an empty list for %j', async (data) => {
    mocks.fetch.mockResolvedValue(data);
    expect((await BlogIndex()).props.initialPosts).toEqual([]);
  });

  it('keeps the page renderable after Sanity rejects', async () => {
    mocks.fetch.mockRejectedValue(new Error('Sanity unavailable'));
    expect((await BlogIndex()).props.initialPosts).toEqual([]);
  });

  it('uses an absolute title to avoid duplicating the root title template', () => {
    expect(indexMetadata.title).toEqual({ absolute: 'Insights & Articles | Macenza Blog' });
    expect(indexMetadata.alternates.canonical).toBe('https://www.macenza.com/blog');
    expect(indexMetadata.description).toEqual(expect.any(String));
  });
});

describe('blog article resolution', () => {
  it.each([
    ['editorial-url', post],
    ['EDITORIAL%20URL', post],
    ['document-1', post],
    ['building-ai-apps', post],
    ['legacy-slug', { ...post, slug: 'Legacy Slug' }],
    ['building-ai-apps', { ...post, slug: { current: '!!!' } }],
    ['document-1', { _id: 'document-1', title: '!!!' }],
  ])('resolves %s through the supported slug, title, or ID form', async (slug, document) => {
    mocks.fetch.mockResolvedValue([document]);
    const element = await BlogArticle(props(slug));
    expect(element.type).toBe(BlogPost);
    expect(element.props.initialPost).toEqual(document);
    expect(mocks.notFound).not.toHaveBeenCalled();
    expect(revalidate).toBe(300);
  });

  it.each([
    ['slug', { ...post, slug: { current: 'shared-url' } }],
    ['string slug', { ...post, slug: 'shared-url' }],
    ['document ID', { ...post, _id: 'shared-url', slug: 'different-url' }],
  ])('prefers an exact %s match over an earlier title alias', async (_kind, exact) => {
    const alias = { _id: 'alias', title: 'Shared URL', slug: { current: 'other-url' } };
    mocks.fetch.mockResolvedValue([alias, exact]);
    expect((await BlogArticle(props('shared-url'))).props.initialPost).toEqual(exact);
  });

  it('keeps related posts in provider order, excludes the selected document, and caps them at three', async () => {
    const others = Array.from({ length: 5 }, (_, i) => ({ _id: `related-${i}`, title: `Related ${i}` }));
    mocks.fetch.mockResolvedValue([others[0], post, ...others.slice(1)]);
    expect((await BlogArticle(props('editorial-url'))).props.initialRelatedPosts).toEqual(others.slice(0, 3));
  });

  it.each([null, [], [{ _id: 'different', title: 'Unrelated' }]].map(value => [value]))('returns 404 for a missing article in %j', async (posts) => {
    mocks.fetch.mockResolvedValue(posts);
    await expect(BlogArticle(props('missing'))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
  });

  it('preserves the client fallback on provider failure instead of declaring the article missing', async () => {
    mocks.fetch.mockRejectedValue(new Error('Provider down'));
    const element = await BlogArticle(props('editorial-url'));
    expect(element.props).toEqual({ initialPost: null, initialRelatedPosts: [] });
    expect(mocks.notFound).not.toHaveBeenCalled();
  });
});

describe('article metadata', () => {
  it('uses the stored canonical slug even when reached through the title alias', async () => {
    const metadata = await generateMetadata(props('building-ai-apps'));
    expect(metadata).toMatchObject({
      title: { absolute: 'Building AI Apps | Macenza Blog' },
      description: 'A useful article.',
      alternates: { canonical: 'https://www.macenza.com/blog/editorial-url' },
      openGraph: {
        title: 'Building AI Apps | Macenza', type: 'article', description: 'A useful article.',
        publishedTime: post.publishedAt, authors: ['Test Author'], images: [],
      },
    });
  });

  it('uses the title slug when the explicit canonical slug contains only punctuation', async () => {
    mocks.fetch.mockResolvedValue([{ ...post, slug: { current: '!!!' } }]);
    expect((await generateMetadata(props('document-1'))).alternates.canonical)
      .toBe('https://www.macenza.com/blog/building-ai-apps');
  });

  it('finds the first text block, joins spans, trims, and limits excerpts to 160 characters', async () => {
    mocks.fetch.mockResolvedValue([{
      ...post,
      body: [{ _type: 'image' }, { _type: 'block', children: [{ text: '  Intro ' }, {}, { text: 'x'.repeat(200) }] }],
    }]);
    const metadata = await generateMetadata(props('editorial-url'));
    expect(metadata.description).toBe(`Intro ${'x'.repeat(154)}`);
    expect(metadata.description).toHaveLength(160);
    expect(metadata.openGraph.description).toBe(metadata.description);
  });

  it.each([undefined, [], [{ _type: 'image' }], [{ _type: 'block', children: [] }]].map(value => [value]))(
    'uses the article title when no excerpt is available: %j', async (body) => {
      mocks.fetch.mockResolvedValue([{ ...post, body, authorName: undefined }]);
      const metadata = await generateMetadata(props('editorial-url'));
      expect(metadata.description).toBe('Read Building AI Apps on Macenza Blog.');
      expect(metadata.openGraph.authors).toEqual(['Macenza Engineering']);
    },
  );

  it('builds a social image at 1200 by 630 pixels', async () => {
    const image = { asset: { _ref: 'image-test' } };
    const builder = { width: vi.fn(), height: vi.fn(), url: vi.fn().mockReturnValue('https://cdn.sanity.io/test.jpg') };
    builder.width.mockReturnValue(builder);
    builder.height.mockReturnValue(builder);
    mocks.urlFor.mockReturnValue(builder);
    mocks.fetch.mockResolvedValue([{ ...post, mainImage: image }]);
    const metadata = await generateMetadata(props('editorial-url'));
    expect(mocks.urlFor).toHaveBeenCalledWith(image);
    expect(builder.width).toHaveBeenCalledWith(1200);
    expect(builder.height).toHaveBeenCalledWith(630);
    expect(metadata.openGraph.images).toEqual([{ url: 'https://cdn.sanity.io/test.jpg' }]);
  });

  it('preserves article metadata when the image cannot be built', async () => {
    mocks.urlFor.mockImplementation(() => { throw new Error('Invalid image'); });
    mocks.fetch.mockResolvedValue([{ ...post, mainImage: {} }]);
    const metadata = await generateMetadata(props('editorial-url'));
    expect(metadata.openGraph.images).toEqual([]);
    expect(metadata.title.absolute).toBe('Building AI Apps | Macenza Blog');
  });

  it('returns descriptive missing-article metadata', async () => {
    mocks.fetch.mockResolvedValue([]);
    expect(await generateMetadata(props('missing'))).toEqual({
      title: { absolute: 'Article Not Found | Macenza Blog' },
      description: 'The requested article could not be found.',
    });
  });
});
