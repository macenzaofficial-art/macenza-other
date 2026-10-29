// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ supabase: null, from: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn(), push: vi.fn() }));
vi.mock('@/lib/supabaseClient', () => ({ get supabase() { return mocks.supabase; } }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('next/link', () => ({ default: ({ children, href, ...rest }) => <a href={href} {...rest}>{children}</a> }));
vi.mock('gsap', () => ({ default: {
  registerPlugin: vi.fn(), from: vi.fn(), utils: { toArray: () => [] },
  context: (callback) => { callback(); return { revert: vi.fn() }; },
} }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: vi.fn() } }));
vi.mock('@/components/ScrollJourney', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/BouncyText', () => ({ default: ({ text }) => <span>{text}</span> }));
import Careers from '../../components/pages/Careers';
import { fallbackJobs } from '../../data/fallbackJobs';

const liveJob = { ...fallbackJobs[0], id: 'live-1', title: 'Platform Engineer' };

beforeEach(() => {
  vi.useFakeTimers();
  mocks.supabase = { from: mocks.from };
  mocks.from.mockReset().mockReturnValue({ select: mocks.select });
  mocks.select.mockReset().mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockReset().mockReturnValue({ order: mocks.order });
  mocks.order.mockReset().mockResolvedValue({ data: [liveJob], error: null });
  mocks.push.mockReset();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('careers server data hydration and fallback refresh', () => {
  it('shows authoritative server jobs without querying them again', () => {
    render(<Careers initialJobs={[liveJob]} isFallback={false} />);
    expect(screen.getByText('Platform Engineer')).toBeDefined();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('revalidates fallback server data and replaces it with active live jobs', async () => {
    let resolveQuery;
    mocks.order.mockReturnValue(new Promise(resolve => { resolveQuery = resolve; }));
    render(<Careers initialJobs={fallbackJobs} isFallback />);
    expect(screen.getByText(fallbackJobs[0].title)).toBeDefined();
    await act(async () => resolveQuery({ data: [liveJob], error: null }));
    expect(screen.getByText('Platform Engineer')).toBeDefined();
    expect(screen.queryByText(fallbackJobs[0].title)).toBeNull();
    expect(mocks.eq).toHaveBeenCalledWith('status', 'Active');
    expect(mocks.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('fetches jobs when no initial data is provided', async () => {
    await act(async () => { render(<Careers />); });
    expect(screen.getByText('Platform Engineer')).toBeDefined();
    expect(mocks.from).toHaveBeenCalledExactlyOnceWith('jobs');
  });

  it('uses local fallback jobs without a Supabase client', () => {
    mocks.supabase = null;
    render(<Careers />);
    expect(screen.getByText(fallbackJobs[0].title)).toBeDefined();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it.each(['empty', 'reported error', 'rejected query'])('retains fallback jobs after a refresh returns %s', async (outcome) => {
    if (outcome === 'empty') mocks.order.mockResolvedValue({ data: [], error: null });
    if (outcome === 'reported error') mocks.order.mockResolvedValue({ data: null, error: new Error('Unavailable') });
    if (outcome === 'rejected query') mocks.order.mockRejectedValue(new Error('Unavailable'));
    await act(async () => { render(<Careers initialJobs={fallbackJobs} isFallback />); });
    expect(screen.getByText(fallbackJobs[0].title)).toBeDefined();
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });

  it('uses Next navigation for the job application URL', () => {
    render(<Careers initialJobs={[liveJob]} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Apply Now' })[0]);
    expect(mocks.push).toHaveBeenCalledWith('/careers/platform-engineer');
  });

  it('navigates to the general application from the mission action', () => {
    render(<Careers initialJobs={[liveJob]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Join Our Mission' }));
    expect(mocks.push).toHaveBeenCalledWith('/careers/general');
  });
});
