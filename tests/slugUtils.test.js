import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateSlug, getPostSlug } from '../lib/slugUtils.js';

describe('generateSlug', () => {
  for (const [input, expected] of [
    ['  AI Software Development  ', 'ai-software-development'],
    ['React___and---Next.js', 'react-and-nextjs'],
    ['one\ttwo\nthree', 'one-two-three'],
    ['---_Hello, World!_---', 'hello-world'],
    ['Version 2.0 / C++ & C#', 'version-20-c-c'],
    ['already-a-slug-123', 'already-a-slug-123'],
    [123, '123'],
    ['', ''],
    [' \t\n ', ''],
    ['!@#$%^&*()', ''],
    ['---___', ''],
    [null, ''],
    [undefined, ''],
    [false, ''],
    [0, ''],
  ]) {
    it(`normalizes ${JSON.stringify(input)} to ${JSON.stringify(expected)}`, () => {
      assert.equal(generateSlug(input), expected);
    });
  }

  it('is idempotent for an already normalized title', () => {
    const slug = generateSlug('  React & Next.js___Guide!  ');
    assert.equal(generateSlug(slug), slug);
  });

  it('supports values with a string representation', () => {
    assert.equal(generateSlug({ toString: () => 'A Custom Title' }), 'a-custom-title');
  });
});

describe('getPostSlug', () => {
  for (const [label, post, expected] of [
    ['Sanity slug object', { slug: { current: ' Custom__URL! ' }, title: 'Other title', _id: 'id' }, 'custom-url'],
    ['legacy string slug', { slug: 'Custom URL', title: 'Other title', _id: 'id' }, 'custom-url'],
    ['missing slug', { title: 'Title Only', _id: 'id' }, 'title-only'],
    ['empty Sanity slug', { slug: { current: '' }, title: 'Title Only' }, 'title-only'],
    ['empty string slug', { slug: '', title: 'Title Only' }, 'title-only'],
    ['punctuation-only slug', { slug: { current: '!!!' }, title: 'Title Only' }, 'title-only'],
    ['null slug', { slug: null, title: 'Title Only' }, 'title-only'],
    ['unrecognized slug shape', { slug: { unexpected: 'ignored' }, title: 'Title Only' }, 'title-only'],
    ['ID fallback', { slug: '!!!', title: '???', _id: 'Post.ID_ABC' }, 'Post.ID_ABC'],
    ['missing title', { _id: 'stable-id' }, 'stable-id'],
    ['empty post', {}, ''],
    ['null post', null, ''],
    ['undefined post', undefined, ''],
  ]) {
    it(`resolves ${label}`, () => {
      assert.equal(getPostSlug(post), expected);
    });
  }

  it('keeps an explicit URL stable when the article title changes', () => {
    const post = { slug: { current: 'stable-url' }, title: 'Original title', _id: 'post-id' };
    assert.equal(getPostSlug({ ...post, title: 'Updated title' }), getPostSlug(post));
  });

  it('does not mutate the supplied post or slug', () => {
    const post = Object.freeze({ slug: Object.freeze({ current: ' Stable URL ' }), title: 'Title' });
    assert.equal(getPostSlug(post), 'stable-url');
    assert.equal(post.slug.current, ' Stable URL ');
  });
});
