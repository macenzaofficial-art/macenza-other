// Node 24+: node --experimental-test-module-mocks --test tests/server-pages.test.js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { after, beforeEach, describe, it } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { transformSync } from 'next/dist/build/swc/index.js';
import { fallbackJobs, generalApplicationJob } from '../data/fallbackJobs.js';

const rootUrl = new URL('../', import.meta.url);
const aliases = {
  '@/lib/sanityClient': 'lib/sanityClient.js',
  '@/lib/supabaseClient': 'lib/supabaseClient.js',
  '@/lib/slugUtils': 'lib/slugUtils.js',
  '@/data/fallbackJobs': 'data/fallbackJobs.js',
  '@/components/pages/Blog': 'components/pages/Blog.jsx',
  '@/components/pages/BlogPost': 'components/pages/BlogPost.jsx',
  '@/components/pages/Careers': 'components/pages/Careers.jsx',
  '@/components/pages/JobDetails': 'components/pages/JobDetails.jsx',
};
const compiledFiles = new Set([
  'app/blog/page.jsx', 'app/blog/[slug]/page.jsx',
  'app/careers/page.jsx', 'app/careers/[id]/page.jsx', 'components/SEO.jsx',
].map((path) => fileURLToPath(new URL(path, rootUrl))));

// Compile only the units under test with the project's own JSX compiler.
// Client views are replaced at their module boundary so no DOM or app server is needed.
const loader = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (aliases[specifier]) return nextResolve(new URL(aliases[specifier], rootUrl).href, context);
    return nextResolve(specifier === 'next/navigation' ? 'next/navigation.js' : specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith('file:') && compiledFiles.has(fileURLToPath(url))) {
      const { code } = transformSync(readFileSync(new URL(url), 'utf8'), {
        filename: fileURLToPath(url),
        jsc: {
          target: 'es2022',
          parser: { syntax: 'ecmascript', jsx: true },
          transform: { react: { runtime: 'automatic' } },
        },
        module: { type: 'es6' },
      });
      return { format: 'module', source: code, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
after(() => loader.deregister());

const views = Object.fromEntries(['Blog', 'BlogPost', 'Careers', 'JobDetails'].map((name) => [name, () => null]));
let fetchPosts;
let imageBuilder;
let urlFor;
let notFound;
let notFoundError;
let databaseResult;
let query;
let database;
let moduleId = 0;

beforeEach((t) => {
  fetchPosts = t.mock.fn(async () => []);
  imageBuilder = {
    width: t.mock.fn(() => imageBuilder),
    height: t.mock.fn(() => imageBuilder),
    url: t.mock.fn(() => 'https://cdn.sanity.io/test-image.jpg'),
  };
  urlFor = t.mock.fn(() => imageBuilder);
  notFoundError = new Error('NEXT_HTTP_ERROR_FALLBACK;404');
  notFound = t.mock.fn(() => { throw notFoundError; });
  databaseResult = { data: [], error: null };
  query = {
    select: t.mock.fn(() => query),
    eq: t.mock.fn(() => query),
    order: t.mock.fn(async () => databaseResult),
    then(resolve, reject) { return Promise.resolve(databaseResult).then(resolve, reject); },
  };
  database = { from: t.mock.fn(() => query) };
  t.mock.module(new URL('lib/sanityClient.js', rootUrl), {
    exports: { sanityClient: { fetch: fetchPosts }, urlFor },
  });
  t.mock.module('next/navigation.js', { exports: { notFound } });
  for (const [name, component] of Object.entries(views)) {
    t.mock.module(new URL(`components/pages/${name}.jsx`, rootUrl), { exports: { default: component } });
  }
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network request'); });
  t.mock.method(console, 'error', () => {});
  t.mock.method(console, 'warn', () => {});
});

function loadPage(path, t, supabase = database) {
  t.mock.module(new URL('lib/supabaseClient.js', rootUrl), { exports: { supabase } });
  return import(new URL(`${path}?test=${++moduleId}`, rootUrl));
}

function articleParams(slug) {
  return { params: Promise.resolve({ slug }) };
}

function jobParams(id) {
  return { params: Promise.resolve({ id }) };
}

describe('blog index server page', { concurrency: false }, () => {
  it('passes published posts into the client view and retains five-minute revalidation', async (t) => {
    const posts = [{ _id: 'post-1', title: 'Article' }];
    fetchPosts.mock.mockImplementation(async () => posts);
    const page = await loadPage('app/blog/page.jsx', t);
    const element = await page.default();
    assert.equal(element.type, views.Blog);
    assert.equal(element.props.initialPosts, posts);
    assert.equal(page.revalidate, 300);
    assert.equal(page.metadata.alternates.canonical, 'https://www.macenza.com/blog');
    assert.equal(fetchPosts.mock.callCount(), 1);
    assert.match(fetchPosts.mock.calls[0].arguments[0], /order\(publishedAt desc\)/);
    assert.match(fetchPosts.mock.calls[0].arguments[0], /"body":\s*body\[0\.\.\.1\]/);
  });

  for (const data of [[], null, undefined]) {
    it(`passes an empty array to the client view for ${JSON.stringify(data)}`, async (t) => {
      fetchPosts.mock.mockImplementation(async () => data);
      const page = await loadPage('app/blog/page.jsx', t);
      assert.deepEqual((await page.default()).props.initialPosts, []);
    });
  }

  it('allows the client to recover when server-side fetching fails', async (t) => {
    fetchPosts.mock.mockImplementation(async () => { throw new Error('Sanity offline'); });
    const page = await loadPage('app/blog/page.jsx', t);
    assert.deepEqual((await page.default()).props.initialPosts, []);
    assert.equal(notFound.mock.callCount(), 0);
  });
});

describe('blog article server page', { concurrency: false }, () => {
  for (const [label, post, slug] of [
    ['Sanity slug', { _id: 'one', title: 'Other title', slug: { current: 'Canonical URL' } }, 'canonical-url'],
    ['legacy string slug', { _id: 'one', title: 'Other title', slug: 'Canonical URL' }, 'canonical-url'],
    ['title alias', { _id: 'one', title: 'Original Title', slug: { current: 'canonical' } }, 'original-title'],
    ['document ID', { _id: 'document.ID_1', title: 'Other title' }, 'document.ID_1'],
    ['encoded title', { _id: 'one', title: 'An Article' }, 'An%20Article'],
    ['title fallback without a slug', { _id: 'one', title: 'An Article' }, 'an-article'],
  ]) {
    it(`resolves a post by ${label}`, async (t) => {
      fetchPosts.mock.mockImplementation(async () => [post]);
      const page = await loadPage('app/blog/[slug]/page.jsx', t);
      const element = await page.default(articleParams(slug));
      assert.equal(element.type, views.BlogPost);
      assert.equal(element.props.initialPost, post);
      assert.deepEqual(element.props.initialRelatedPosts, []);
      assert.equal(notFound.mock.callCount(), 0);
      assert.equal(page.revalidate, 300);
    });
  }

  it('prefers a canonical slug over another article with a matching title alias', async (t) => {
    const alias = { _id: 'alias', title: 'Target Article', slug: { current: 'other-url' } };
    const canonical = { _id: 'canonical', title: 'New Title', slug: { current: 'target-article' } };
    fetchPosts.mock.mockImplementation(async () => [alias, canonical]);
    const page = await loadPage('app/blog/[slug]/page.jsx', t);
    assert.equal((await page.default(articleParams('target-article'))).props.initialPost, canonical);
  });

  it('excludes the selected article from related posts and limits them to three in fetch order', async (t) => {
    const post = { _id: 'selected', title: 'Selected' };
    const others = [1, 2, 3, 4].map((id) => ({ _id: `other-${id}`, title: `Other ${id}` }));
    const posts = Object.freeze([others[0], post, others[1], { ...post }, ...others.slice(2)]);
    fetchPosts.mock.mockImplementation(async () => posts);
    const page = await loadPage('app/blog/[slug]/page.jsx', t);
    const element = await page.default(articleParams('selected'));
    assert.deepEqual(element.props.initialRelatedPosts, others.slice(0, 3));
    assert.equal(posts.length, 6);
  });

  for (const posts of [[], null, [{ _id: 'different', title: 'Different' }]]) {
    it(`uses Next's 404 boundary for an absent article in ${JSON.stringify(posts)}`, async (t) => {
      fetchPosts.mock.mockImplementation(async () => posts);
      const page = await loadPage('app/blog/[slug]/page.jsx', t);
      await assert.rejects(page.default(articleParams('missing')), (error) => error === notFoundError);
      assert.equal(notFound.mock.callCount(), 1);
    });
  }

  it('keeps provider failures recoverable instead of declaring the article missing', async (t) => {
    fetchPosts.mock.mockImplementation(async () => { throw new Error('Sanity offline'); });
    const page = await loadPage('app/blog/[slug]/page.jsx', t);
    const element = await page.default(articleParams('article'));
    assert.equal(element.props.initialPost, null);
    assert.deepEqual(element.props.initialRelatedPosts, []);
    assert.equal(notFound.mock.callCount(), 0);
  });

  it('handles a malformed URL encoding without crashing the page', async (t) => {
    fetchPosts.mock.mockImplementation(async () => [{ _id: 'one', title: 'Article' }]);
    const page = await loadPage('app/blog/[slug]/page.jsx', t);
    assert.equal((await page.default(articleParams('%E0%A4%A'))).props.initialPost, null);
    assert.equal(notFound.mock.callCount(), 0);
  });

  it('builds canonical and Open Graph metadata from all text spans in the first text block', async (t) => {
    const post = {
      _id: 'one', title: 'Article', slug: { current: 'Canonical URL' },
      mainImage: { asset: { _ref: 'image-ref' } }, authorName: 'Ada',
      publishedAt: '2026-08-11T12:00:00Z',
      body: [{ _type: 'image' }, {
        _type: 'block', children: [{ text: ' First ' }, {}, { text: 'paragraph ' }, { text: 'x'.repeat(200) }],
      }],
    };
    fetchPosts.mock.mockImplementation(async () => [post]);
    const page = await loadPage('app/blog/[slug]/page.jsx', t);
    const metadata = await page.generateMetadata(articleParams('canonical-url'));
    const excerpt = `First paragraph ${'x'.repeat(200)}`.slice(0, 160);

    assert.deepEqual(metadata.title, { absolute: 'Article | Macenza Blog' });
    assert.equal(metadata.description, excerpt);
    assert.equal(metadata.alternates.canonical, 'https://www.macenza.com/blog/canonical-url');
    assert.deepEqual(metadata.openGraph, {
      title: 'Article | Macenza', description: excerpt, type: 'article',
      publishedTime: post.publishedAt, authors: ['Ada'],
      images: [{ url: 'https://cdn.sanity.io/test-image.jpg' }],
    });
    assert.deepEqual(urlFor.mock.calls[0].arguments, [post.mainImage]);
    assert.deepEqual(imageBuilder.width.mock.calls[0].arguments, [1200]);
    assert.deepEqual(imageBuilder.height.mock.calls[0].arguments, [630]);
  });

  for (const body of [undefined, [], [{ _type: 'image' }], [{ _type: 'block', children: [] }]]) {
    it(`uses fallback metadata for an article with body ${JSON.stringify(body)}`, async (t) => {
      fetchPosts.mock.mockImplementation(async () => [{ _id: 'one', title: 'Article', body }]);
      const page = await loadPage('app/blog/[slug]/page.jsx', t);
      const metadata = await page.generateMetadata(articleParams('article'));
      assert.equal(metadata.description, 'Read Article on Macenza Blog.');
      assert.deepEqual(metadata.openGraph.authors, ['Macenza Engineering']);
      assert.deepEqual(metadata.openGraph.images, []);
      assert.equal(urlFor.mock.callCount(), 0);
    });
  }

  it('preserves metadata when image URL construction fails', async (t) => {
    fetchPosts.mock.mockImplementation(async () => [{ _id: 'one', title: 'Article', mainImage: {} }]);
    urlFor.mock.mockImplementation(() => { throw new Error('Invalid image reference'); });
    const page = await loadPage('app/blog/[slug]/page.jsx', t);
    const metadata = await page.generateMetadata(articleParams('article'));
    assert.deepEqual(metadata.openGraph.images, []);
    assert.equal(metadata.title.absolute, 'Article | Macenza Blog');
  });

  it('returns missing-article metadata without throwing the 404 boundary', async (t) => {
    const page = await loadPage('app/blog/[slug]/page.jsx', t);
    assert.deepEqual(await page.generateMetadata({ params: Promise.resolve({}) }), {
      title: { absolute: 'Article Not Found | Macenza Blog' },
      description: 'The requested article could not be found.',
    });
    assert.equal(notFound.mock.callCount(), 0);
  });
});

describe('careers index server page', { concurrency: false }, () => {
  it('fetches active jobs in newest-first order and passes them into the client view', async (t) => {
    databaseResult = { data: [{ id: 'job-1', title: 'Engineer' }], error: null };
    const page = await loadPage('app/careers/page.jsx', t);
    const element = await page.default();
    assert.equal(element.type, views.Careers);
    assert.deepEqual(element.props, { initialJobs: databaseResult.data, isFallback: false });
    assert.equal(page.dynamic, 'force-dynamic');
    assert.deepEqual(database.from.mock.calls[0].arguments, ['jobs']);
    assert.deepEqual(query.select.mock.calls[0].arguments, ['*']);
    assert.deepEqual(query.eq.mock.calls[0].arguments, ['status', 'Active']);
    assert.deepEqual(query.order.mock.calls[0].arguments, ['created_at', { ascending: false }]);
  });

  it('uses fallback jobs when Supabase is unconfigured', async (t) => {
    const page = await loadPage('app/careers/page.jsx', t, null);
    assert.deepEqual((await page.default()).props, { initialJobs: fallbackJobs, isFallback: true });
    assert.equal(database.from.mock.callCount(), 0);
  });

  for (const result of [{ data: [], error: null }, { data: null, error: null }, { data: null, error: new Error('Offline') }]) {
    it(`uses fallback jobs for ${result.error ? 'a provider error' : JSON.stringify(result.data)}`, async (t) => {
      databaseResult = result;
      const page = await loadPage('app/careers/page.jsx', t);
      assert.deepEqual((await page.default()).props, { initialJobs: fallbackJobs, isFallback: true });
    });
  }
});

describe('job detail server page', { concurrency: false }, () => {
  for (const id of ['general', 'general-application', '%20general-application%20']) {
    it(`resolves the general application alias ${id} without querying Supabase`, async (t) => {
      const page = await loadPage('app/careers/[id]/page.jsx', t);
      const element = await page.default(jobParams(id));
      assert.equal(element.type, views.JobDetails);
      assert.equal(element.props.initialJob, generalApplicationJob);
      assert.equal(database.from.mock.callCount(), 0);
      assert.equal(page.dynamic, 'force-dynamic');
    });
  }

  for (const [label, job, id] of [
    ['title slug', { id: 42, title: 'Backend Engineer' }, 'backend-engineer'],
    ['numeric database ID', { id: 42, title: 'Backend Engineer' }, '42'],
    ['alternate ID', { id: 'job-42', _id: 'legacy-42', title: 'Backend Engineer' }, 'legacy-42'],
    ['URL-encoded ID', { id: 'job with spaces', title: 'Backend Engineer' }, 'job%20with%20spaces'],
  ]) {
    it(`looks up an active job by ${label}`, async (t) => {
      databaseResult = { data: [job], error: null };
      const page = await loadPage('app/careers/[id]/page.jsx', t);
      assert.equal((await page.default(jobParams(id))).props.initialJob, job);
      assert.deepEqual(query.eq.mock.calls[0].arguments, ['status', 'Active']);
      assert.equal(notFound.mock.callCount(), 0);
    });
  }

  it('uses the matching fallback job when Supabase is unconfigured', async (t) => {
    const page = await loadPage('app/careers/[id]/page.jsx', t, null);
    assert.equal((await page.default(jobParams(fallbackJobs[0].id))).props.initialJob, fallbackJobs[0]);
  });

  it('uses fallback jobs when the provider reports a lookup error', async (t) => {
    databaseResult = { data: null, error: new Error('Offline') };
    const page = await loadPage('app/careers/[id]/page.jsx', t);
    assert.equal((await page.default(jobParams(fallbackJobs[0].id))).props.initialJob, fallbackJobs[0]);
  });

  it('does not resurrect a fallback job missing from a successful active-jobs query', async (t) => {
    const page = await loadPage('app/careers/[id]/page.jsx', t);
    await assert.rejects(page.default(jobParams(fallbackJobs[0].id)), (error) => error === notFoundError);
    assert.equal(notFound.mock.callCount(), 1);
  });

  for (const id of ['', 'missing-role']) {
    it(`uses Next's 404 boundary for an unknown ID ${JSON.stringify(id)}`, async (t) => {
      const page = await loadPage('app/careers/[id]/page.jsx', t, null);
      await assert.rejects(page.default(jobParams(id)), (error) => error === notFoundError);
    });
  }

  for (const length of [159, 160, 161]) {
    it(`handles the 160-character metadata description boundary at length ${length}`, async (t) => {
      const description = 'x'.repeat(length);
      databaseResult = { data: [{ id: 'job-1', title: 'Engineer', description }], error: null };
      const page = await loadPage('app/careers/[id]/page.jsx', t);
      const metadata = await page.generateMetadata(jobParams('engineer'));
      const expected = length > 160 ? `${description.slice(0, 157)}...` : description;
      assert.deepEqual(metadata.title, { absolute: 'Engineer | Careers at Macenza' });
      assert.equal(metadata.description, expected);
      assert.equal(metadata.alternates.canonical, 'https://www.macenza.com/careers/engineer');
      assert.deepEqual(metadata.openGraph, {
        title: 'Engineer | Careers at Macenza', description: expected,
        type: 'website', url: 'https://www.macenza.com/careers/engineer',
      });
    });
  }

  it('supplies a default description for a job without one', async (t) => {
    databaseResult = { data: [{ id: 'job-1', title: 'Engineer' }], error: null };
    const page = await loadPage('app/careers/[id]/page.jsx', t);
    const metadata = await page.generateMetadata(jobParams('job-1'));
    assert.equal(metadata.description, 'View full role responsibilities, tech stack specifications, and submit your application at Macenza.');
    assert.equal(metadata.alternates.canonical, 'https://www.macenza.com/careers/job-1');
  });

  it('returns missing-job metadata without throwing the 404 boundary', async (t) => {
    const page = await loadPage('app/careers/[id]/page.jsx', t);
    assert.deepEqual(await page.generateMetadata(jobParams('closed-role')), {
      title: { absolute: 'Job Posting Not Found | Careers at Macenza' },
      description: 'The requested job application page could not be found or has expired.',
      alternates: { canonical: 'https://www.macenza.com/careers/closed-role' },
    });
    assert.equal(notFound.mock.callCount(), 0);
  });
});

describe('structured-data SEO rendering', { concurrency: false }, () => {
  async function renderSchema(schema) {
    const { default: SEO } = await import(new URL(`components/SEO.jsx?test=${++moduleId}`, rootUrl));
    return renderToStaticMarkup(SEO({ schema }));
  }

  for (const schema of [undefined, null, false, []]) {
    it(`renders no script for ${JSON.stringify(schema)}`, async () => {
      assert.equal(await renderSchema(schema), '');
    });
  }

  it('serializes a single schema as JSON-LD', async () => {
    const schema = { '@context': 'https://schema.org', '@type': 'Organization', name: 'Macenza' };
    const html = await renderSchema(schema);
    assert.match(html, /^<script type="application\/ld\+json">/);
    assert.deepEqual(JSON.parse(html.match(/<script[^>]*>(.*?)<\/script>/s)[1]), schema);
  });

  it('renders each schema in its own JSON-LD script', async () => {
    const schemas = [{ '@type': 'Organization' }, { '@type': 'WebSite' }];
    const html = await renderSchema(schemas);
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
    assert.equal(scripts.length, 2);
    assert.deepEqual(scripts.map((match) => JSON.parse(match[1])), schemas);
  });

  it('escapes script-closing content while preserving the original JSON value', async () => {
    const schema = { '@type': 'Article', headline: '</script><script>alert("x")</script>', description: 'A < B & C' };
    const html = await renderSchema(schema);
    assert.equal([...html.matchAll(/<script/g)].length, 1);
    assert.equal([...html.matchAll(/<\/script>/g)].length, 1);
    assert.ok(html.includes('\\u003c/script>'));
    assert.deepEqual(JSON.parse(html.match(/<script[^>]*>(.*?)<\/script>/s)[1]), schema);
  });
});
