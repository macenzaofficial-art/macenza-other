// Node 24+: node --experimental-test-module-mocks --test tests/blog-posts.test.js
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { after, beforeEach, describe, it } from 'node:test';

const sanityUrl = new URL('../lib/sanityClient.js', import.meta.url);
const resolver = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'next/server') return nextResolve('next/server.js', context);
    if (specifier === '@/lib/sanityClient') return nextResolve(sanityUrl.href, context);
    return nextResolve(specifier, context);
  },
});
after(() => resolver.deregister());

let fetchPosts;
let moduleId = 0;

beforeEach((t) => {
  fetchPosts = t.mock.fn(async () => []);
  t.mock.module(sanityUrl, { exports: { sanityClient: { fetch: fetchPosts } } });
  // Unexpected network access must fail locally, without reaching a provider.
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network request'); });
  t.mock.method(console, 'error', () => {});
});

async function getPosts() {
  const url = new URL(`../app/api/blog-posts/route.js?test=${++moduleId}`, import.meta.url);
  return (await import(url)).GET();
}

describe('GET /api/blog-posts', { concurrency: false }, () => {
  it('returns the fetched posts without discarding body, author, or category data', async () => {
    const posts = [{
      _id: 'post-1', title: 'First article', slug: { current: 'first-article' },
      mainImage: { asset: { _ref: 'image-ref' } }, publishedAt: '2026-08-11T12:00:00Z',
      body: [{ _type: 'block', children: [{ text: 'Full article' }] }],
      authorName: 'Ada', authorImage: { asset: { _ref: 'author-ref' } },
      authorBio: 'Engineer', categories: ['Engineering'],
    }, { _id: 'post-2', title: 'Older article' }];
    fetchPosts.mock.mockImplementation(async () => posts);

    const response = await getPosts();

    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await response.json(), posts);
    assert.equal(fetchPosts.mock.callCount(), 1);
    const [query] = fetchPosts.mock.calls[0].arguments;
    assert.match(query, /\*\[_type == "post"\]\s*\|\s*order\(publishedAt desc\)/);
    for (const field of ['_id', 'title', 'slug', 'mainImage', 'publishedAt', 'body']) {
      assert.match(query, new RegExp(`\\b${field}\\b`));
    }
    assert.match(query, /"authorName":\s*author->name/);
    assert.match(query, /"authorImage":\s*author->image/);
    assert.match(query, /"authorBio":\s*author->bio/);
    assert.match(query, /"categories":\s*categories\[\]->title/);
  });

  for (const result of [[], null, undefined]) {
    it(`returns an empty JSON array for ${JSON.stringify(result)}`, async () => {
      fetchPosts.mock.mockImplementation(async () => result);
      const response = await getPosts();
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), []);
    });
  }

  it('returns a stable error response when Sanity fails', async () => {
    fetchPosts.mock.mockImplementation(async () => { throw new Error('Internal provider details'); });
    const response = await getPosts();
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { error: 'Failed to fetch posts' });
    assert.equal(fetchPosts.mock.callCount(), 1);
  });
});
