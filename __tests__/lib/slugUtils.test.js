import { describe, expect, it } from 'vitest';
import { generateSlug, getPostSlug } from '../../lib/slugUtils';

describe('generateSlug', () => {
  it.each([
    ['  Build With AI  ', 'build-with-ai'],
    ['Next.js & React: A Guide!', 'nextjs-react-a-guide'],
    ['--one___two \t\n three--', 'one-two-three'],
    ['Already-a-Slug-42', 'already-a-slug-42'],
    ['!!!', ''],
    ['---___', ''],
    [123, '123'],
    [null, ''],
    [undefined, ''],
    ['', ''],
  ])('normalizes %j to %j', (input, expected) => {
    expect(generateSlug(input)).toBe(expected);
  });

  it('is idempotent for generated URLs', () => {
    const slug = generateSlug('  Shipping Next.js__Apps!  ');
    expect(generateSlug(slug)).toBe(slug);
  });
});

describe('getPostSlug', () => {
  it.each([
    [{ slug: { current: ' Editorial URL ' }, title: 'Different Title', _id: 'id' }, 'editorial-url'],
    [{ slug: 'Legacy_String', title: 'Different Title', _id: 'id' }, 'legacy-string'],
    [{ slug: { current: '!!!' }, title: 'Usable Title', _id: 'id' }, 'usable-title'],
    [{ slug: ' -- ', title: 'Usable Title', _id: 'id' }, 'usable-title'],
    [{ slug: { current: '' }, title: 'Usable Title' }, 'usable-title'],
    [{ slug: {}, title: 'Usable Title' }, 'usable-title'],
    [{ slug: 123, title: 'Usable Title' }, 'usable-title'],
    [{ title: 'Title Only' }, 'title-only'],
    [{ slug: '!!!', title: '???', _id: 'sanity.ID-42' }, 'sanity.ID-42'],
    [{ _id: 'only-id' }, 'only-id'],
    [{}, ''],
    [null, ''],
    [undefined, ''],
  ])('resolves %j to %j', (post, expected) => {
    expect(getPostSlug(post)).toBe(expected);
  });

  it('does not mutate Sanity documents', () => {
    const post = Object.freeze({ slug: Object.freeze({ current: ' Original Slug ' }), title: 'Title' });
    expect(getPostSlug(post)).toBe('original-slug');
    expect(post.slug.current).toBe(' Original Slug ');
  });
});
