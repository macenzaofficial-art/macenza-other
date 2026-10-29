// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ supabase: null, id: 'general', from: vi.fn(), error: vi.fn() }));
vi.mock('@/lib/supabaseClient', () => ({ get supabase() { return mocks.supabase; } }));
vi.mock('next/navigation', () => ({ useParams: () => ({ id: mocks.id }) }));
vi.mock('next/link', () => ({ default: ({ href, children, ...rest }) => <a href={href} {...rest}>{children}</a> }));
vi.mock('react-toastify', () => ({ toast: { error: mocks.error } }));
vi.mock('gsap', () => ({ default: {
  registerPlugin: vi.fn(), from: vi.fn(), utils: { toArray: () => [] },
  context: (callback) => { callback(); return { revert: vi.fn() }; },
} }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: vi.fn() } }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@hcaptcha/react-hcaptcha', () => ({ default: ({ onVerify, sitekey }) => (
  <button type="button" data-sitekey={sitekey} onClick={() => onVerify('synthetic-token')}>Verify test captcha</button>
) }));
import JobDetails from '../../components/pages/JobDetails';
import { fallbackJobs, generalApplicationJob } from '../../data/fallbackJobs';

beforeEach(() => {
  mocks.id = 'general';
  mocks.supabase = { from: mocks.from };
  mocks.from.mockReset();
  mocks.error.mockReset();
  vi.stubGlobal('fetch', vi.fn());
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('job detail initial data and unconfigured services', () => {
  it('renders a server-provided job without a second lookup', () => {
    render(<JobDetails initialJob={fallbackJobs[0]} />);
    expect(screen.getByRole('heading', { level: 1, name: fallbackJobs[0].title })).toBeDefined();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('updates when a different initial job is provided', () => {
    const { rerender } = render(<JobDetails initialJob={fallbackJobs[0]} />);
    rerender(<JobDetails initialJob={fallbackJobs[1]} />);
    expect(screen.getByRole('heading', { level: 1, name: fallbackJobs[1].title })).toBeDefined();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it.each(['general', 'general-application'])('uses the shared general application for %s', (id) => {
    mocks.id = id;
    render(<JobDetails />);
    expect(screen.getByRole('heading', { level: 1, name: generalApplicationJob.title })).toBeDefined();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('renders fallback job details without a configured Supabase client', () => {
    mocks.id = fallbackJobs[0].id;
    mocks.supabase = null;
    render(<JobDetails />);
    expect(screen.getByRole('heading', { level: 1, name: fallbackJobs[0].title })).toBeDefined();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('offers a return to careers for an unknown fallback job', () => {
    mocks.id = 'unknown-job';
    mocks.supabase = null;
    render(<JobDetails />);
    expect(screen.getByRole('link', { name: /Return to Careers/ }).getAttribute('href')).toBe('/careers');
  });

  it('passes the public hCaptcha site key to the form', () => {
    vi.stubEnv('NEXT_PUBLIC_HCAPTCHA_SITE_KEY', 'synthetic-site-key');
    render(<JobDetails initialJob={generalApplicationJob} />);
    expect(screen.getByRole('button', { name: 'Verify test captcha' }).getAttribute('data-sitekey')).toBe('synthetic-site-key');
  });

  it('reports an unconfigured database before uploading a resume or calling the application API', async () => {
    mocks.supabase = null;
    const { container } = render(<JobDetails initialJob={generalApplicationJob} />);
    const input = container.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [new File(['resume'], 'resume.pdf', { type: 'application/pdf' })] } });
    fireEvent.click(container.querySelector('input[name="agreeToTerms"]'));
    fireEvent.click(screen.getByRole('button', { name: 'Verify test captcha' }));
    await act(async () => { fireEvent.submit(container.querySelector('form')); });
    expect(mocks.error).toHaveBeenCalledWith('Database service is not configured. Please try again later.');
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Submit Application/ }).disabled).toBe(false);
  });
});
