// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchPosts } = vi.hoisted(() => ({ fetchPosts: vi.fn() }));
vi.mock('@/lib/sanityClient', () => ({ sanityClient: { fetch: fetchPosts } }));
import { GET } from '../../app/api/blog-posts/route';

beforeEach(() => {
  fetchPosts.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('GET /api/blog-posts', () => {
  it('returns article bodies and author data as JSON', async () => {
    const posts = [{ _id: 'post-1', title: 'Article', body: [{ _type: 'block' }], authorName: 'Author' }];
    fetchPosts.mockResolvedValue(posts);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual(posts);
    expect(fetchPosts).toHaveBeenCalledTimes(1);
    const [query] = fetchPosts.mock.calls[0];
    expect(query).toContain('*[_type == "post"]');
    expect(query).toContain('order(publishedAt desc)');
    expect(query).toMatch(/\bbody\s*,/);
    expect(query).toContain('"authorName": author->name');
    expect(query).toContain('"categories": categories[]->title');
  });

  it.each([null, undefined, []].map(value => [value]))('returns an empty list for %j', async (posts) => {
    fetchPosts.mockResolvedValue(posts);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it.each(['development', 'production'])('does not disclose provider errors in %s', async (environment) => {
    vi.stubEnv('NODE_ENV', environment);
    try {
      fetchPosts.mockRejectedValue(new Error('Private provider diagnostics'));
      const response = await GET();
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: 'Failed to fetch posts' });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
