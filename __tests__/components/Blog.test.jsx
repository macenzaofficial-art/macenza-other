// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetchSanity: vi.fn(), error: vi.fn(), slug: 'test-article' }));
vi.mock('@/lib/sanityClient', () => ({ sanityClient: { fetch: mocks.fetchSanity }, urlFor: vi.fn() }));
vi.mock('next/navigation', () => ({ useParams: () => ({ slug: mocks.slug }) }));
vi.mock('next/link', () => ({ default: ({ children, href, ...rest }) => <a href={href} {...rest}>{children}</a> }));
vi.mock('react-toastify', () => ({ toast: { error: mocks.error } }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/BouncyText', () => ({ default: ({ text }) => <span>{text}</span> }));

import Blog from '../../components/pages/Blog';
import BlogPost from '../../components/pages/BlogPost';

const article = {
  _id: 'article-1', title: 'Test Article', slug: { current: 'test-article' },
  publishedAt: '2026-01-02T00:30:00Z', categories: ['Engineering'],
  body: [{ _type: 'block', children: [{ text: 'Article content.' }] }],
};

beforeEach(() => {
  mocks.slug = 'test-article';
  mocks.fetchSanity.mockReset().mockResolvedValue([article]);
  mocks.error.mockReset();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unexpected request')));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('blog index initial data and client fallback', () => {
  it('renders server-provided articles without requesting them again', () => {
    render(<Blog initialPosts={[article]} />);
    expect(screen.getByText('Test Article')).toBeDefined();
    expect(screen.getByRole('link', { name: /Test Article/ }).getAttribute('href')).toBe('/blog/test-article');
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.fetchSanity).not.toHaveBeenCalled();
  });

  it('updates when the server provides a new list of articles', () => {
    const { rerender } = render(<Blog initialPosts={[article]} />);
    rerender(<Blog initialPosts={[{ ...article, _id: 'new', title: 'Updated Article' }]} />);
    expect(screen.getByText('Updated Article')).toBeDefined();
    expect(screen.queryByText('Test Article')).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses the internal API and keeps omitted default props stable across rerenders', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [article] });
    const { rerender } = render(<Blog />);
    await screen.findByText('Test Article');
    rerender(<Blog />);
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/blog-posts');
    expect(mocks.fetchSanity).not.toHaveBeenCalled();
  });

  it.each(['http error', 'empty data', 'null data', 'network error', 'invalid JSON'])(
    'falls back to Sanity after an API %s', async (failure) => {
      if (failure === 'http error') fetch.mockResolvedValue({ ok: false });
      if (failure === 'empty data') fetch.mockResolvedValue({ ok: true, json: async () => [] });
      if (failure === 'null data') fetch.mockResolvedValue({ ok: true, json: async () => null });
      if (failure === 'invalid JSON') fetch.mockResolvedValue({ ok: true, json: async () => { throw new Error('Invalid JSON'); } });
      render(<Blog />);
      await screen.findByText('Test Article');
      expect(mocks.fetchSanity).toHaveBeenCalledTimes(1);
    },
  );

  it('finishes loading with an empty state when neither provider has posts', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [] });
    mocks.fetchSanity.mockResolvedValue(null);
    render(<Blog />);
    await screen.findByText('No Articles Yet');
    expect(screen.queryByText('Loading blog archives...')).toBeNull();
  });

  it('reports provider failures and finishes loading', async () => {
    mocks.fetchSanity.mockRejectedValue(new Error('Sanity unavailable'));
    render(<Blog />);
    await screen.findByText('No Articles Yet');
    expect(mocks.error).toHaveBeenCalledWith('Failed to connect to Sanity blog repository');
  });

  it('formats featured and recent dates in UTC regardless of the local timezone', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles');
    render(<Blog initialPosts={[article, { ...article, _id: 'recent', title: 'Recent Article', slug: 'recent-article' }]} />);
    expect(screen.getAllByText('1/2/2026')).toHaveLength(2);
  });
});

describe('blog article initial data and client fallback', () => {
  it('renders the initial article and related posts without fetching again', () => {
    const related = { ...article, _id: 'related', title: 'Related Article', slug: 'related-article' };
    render(<BlogPost initialPost={article} initialRelatedPosts={[related]} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Test Article' })).toBeDefined();
    expect(screen.getByRole('link', { name: /Related Article/ }).getAttribute('href')).toBe('/blog/related-article');
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.fetchSanity).not.toHaveBeenCalled();
  });

  it('keeps omitted related-post props stable across rerenders', () => {
    const { rerender } = render(<BlogPost initialPost={article} />);
    rerender(<BlogPost initialPost={article} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Test Article' })).toBeDefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('retrieves an article through the internal API without contacting Sanity', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => [article] });
    render(<BlogPost />);
    await screen.findByRole('heading', { level: 1, name: 'Test Article' });
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/blog-posts');
    expect(mocks.fetchSanity).not.toHaveBeenCalled();
  });

  it.each(['http error', 'empty data', 'network error'])('uses Sanity after an API %s', async (failure) => {
    if (failure === 'http error') fetch.mockResolvedValue({ ok: false });
    if (failure === 'empty data') fetch.mockResolvedValue({ ok: true, json: async () => [] });
    render(<BlogPost />);
    await screen.findByRole('heading', { level: 1, name: 'Test Article' });
    expect(mocks.fetchSanity).toHaveBeenCalledTimes(1);
  });

  it('finishes with a missing-article view when the returned list has no matching slug', async () => {
    mocks.slug = 'missing';
    fetch.mockResolvedValue({ ok: true, json: async () => [article] });
    render(<BlogPost />);
    await waitFor(() => expect(screen.getByRole('link', { name: /Back to Blog Archives/ })).toBeDefined());
    expect(mocks.fetchSanity).not.toHaveBeenCalled();
  });

  it('reports provider failures and displays the missing-article view', async () => {
    mocks.fetchSanity.mockRejectedValue(new Error('Sanity unavailable'));
    render(<BlogPost />);
    await screen.findByRole('link', { name: /Back to Blog Archives/ });
    expect(mocks.error).toHaveBeenCalledWith('Failed to connect to Sanity blog repository');
  });

  it('uses UTC for both the article date and related article dates', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles');
    render(<BlogPost initialPost={article} initialRelatedPosts={[{ ...article, _id: 'related', title: 'Related' }]} />);
    expect(screen.getByText('Jan 2, 2026')).toBeDefined();
    expect(screen.getByText('1/2/2026')).toBeDefined();
  });
});
