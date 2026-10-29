// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  pathname: '/admin', params: {}, supabase: null,
  push: vi.fn(), from: vi.fn(), select: vi.fn(), order: vi.fn(), unsubscribe: vi.fn(),
  getSession: vi.fn(), onAuthStateChange: vi.fn(),
}));
vi.mock('@/lib/supabaseClient', () => ({ get supabase() { return mocks.supabase; } }));
vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
  useParams: () => mocks.params,
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock('react-toastify', () => ({ ToastContainer: () => null, toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));
vi.mock('@/components/admin/DashboardKpiMetrics', () => ({ default: () => null }));
vi.mock('@/components/admin/AppliedCandidatesChart', () => ({ default: () => null }));
vi.mock('@/components/admin/JobVsCandidateAnalysis', () => ({ default: () => null }));
vi.mock('@/components/admin/RecentActivityAndActions', () => ({ default: () => null }));
vi.mock('@/components/admin/FuturisticAnalytics', () => ({ default: () => null }));
vi.mock('@/components/admin/AdminMobileHeader', () => ({ default: ({ activeTab }) => <output data-testid="active-tab">{activeTab}</output> }));
vi.mock('@/components/admin/AdminMobileBottomNav', () => ({ default: ({ onSelectTab }) => (
  <button onClick={() => onSelectTab('Jobs')}>Test switch to jobs</button>
) }));

let Admin;
let originalScrollTo;

beforeEach(async () => {
  vi.resetModules(); // Reset admin's in-memory data caches between independent tests.
  localStorage.clear();
  mocks.pathname = '/admin';
  mocks.params = {};
  mocks.push.mockReset();
  mocks.unsubscribe.mockReset();
  mocks.getSession.mockReset().mockResolvedValue({ data: { session: { user: { email: 'admin@example.test' } } } });
  mocks.onAuthStateChange.mockReset().mockReturnValue({ data: { subscription: { unsubscribe: mocks.unsubscribe } } });
  mocks.order.mockReset().mockResolvedValue({ data: [], error: null });
  mocks.select.mockReset().mockReturnValue({ data: [], error: null, order: mocks.order });
  mocks.from.mockReset().mockReturnValue({ select: mocks.select });
  mocks.supabase = { from: mocks.from, auth: { getSession: mocks.getSession, onAuthStateChange: mocks.onAuthStateChange } };
  window.history.replaceState(null, '', '/admin');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  // jsdom does not implement element scrolling. Track the descriptor for cleanup.
  originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, writable: true, value: vi.fn() });
  Admin = (await import('../../components/pages/Admin')).default;
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  if (originalScrollTo) Object.defineProperty(HTMLElement.prototype, 'scrollTo', originalScrollTo);
  else delete HTMLElement.prototype.scrollTo;
});

async function renderAdmin() {
  await act(async () => { render(<Admin />); });
  return screen.getByTestId('active-tab');
}

describe('admin navigation', () => {
  it.each([
    ['/admin', 'Dashboard'],
    ['/admin/jobs', 'Jobs'],
    ['/ADMIN/EMPLOYEE/', 'Employees'],
    ['/admin/resumemanager', 'Resume Manager'],
    ['/admin/resume-manager', 'Resume Manager'],
    ['/admin/dashbord', 'Dashboard'],
    ['/admin/analytics?range=week#chart', 'Analytics'],
    ['/admin/constructor', 'Dashboard'],
    ['/admin/__proto__', 'Dashboard'],
    ['/admin/unknown', 'Dashboard'],
  ])('selects the correct tab for %s', async (path, tab) => {
    mocks.pathname = path;
    expect((await renderAdmin()).textContent).toBe(tab);
  });

  it('prefers the current pathname over stale catch-all route params', async () => {
    mocks.pathname = '/admin/jobs';
    mocks.params = { tab: ['applications'] };
    expect((await renderAdmin()).textContent).toBe('Jobs');
  });

  it.each([[['applications']], ['applications']])('uses catch-all params when no pathname is available: %j', async (tab) => {
    mocks.pathname = null;
    mocks.params = { tab };
    expect((await renderAdmin()).textContent).toBe('Applications');
  });

  it('switches tabs with pushState and preserves the authentication subscription', async () => {
    mocks.params = { tab: ['dashboard'] };
    const activeTab = await renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Test switch to jobs' }));
    expect(activeTab.textContent).toBe('Jobs');
    expect(window.location.pathname).toBe('/admin/jobs');
    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.getSession).toHaveBeenCalledTimes(1);
    expect(mocks.onAuthStateChange).toHaveBeenCalledTimes(1);
    expect(mocks.unsubscribe).not.toHaveBeenCalled();
  });

  it('responds to browser history events even when route params remain stale', async () => {
    mocks.pathname = '/admin/jobs';
    mocks.params = { tab: ['jobs'] };
    const activeTab = await renderAdmin();
    act(() => {
      window.history.replaceState(null, '', '/admin/applications');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(activeTab.textContent).toBe('Applications');
    act(() => {
      window.history.replaceState(null, '', '/admin/jobs');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(activeTab.textContent).toBe('Jobs');
  });

  it('updates on pathname changes without reverting to stale route params', async () => {
    mocks.params = { tab: ['dashboard'] };
    let view;
    await act(async () => { view = render(<Admin />); });
    mocks.pathname = '/admin/jobs';
    view.rerender(<Admin />);
    expect(screen.getByTestId('active-tab').textContent).toBe('Jobs');
    view.rerender(<Admin />);
    expect(screen.getByTestId('active-tab').textContent).toBe('Jobs');
  });

  it('retains the selected tab for unrecognized history paths', async () => {
    mocks.pathname = '/admin/jobs';
    const activeTab = await renderAdmin();
    act(() => {
      window.history.replaceState(null, '', '/admin/constructor');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(activeTab.textContent).toBe('Jobs');
  });

  it('unsubscribes from authentication and history changes on unmount', async () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    await renderAdmin();
    cleanup();
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
    expect(removeEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
  });

  it('shows cached jobs immediately when remounted while a refresh is pending', async () => {
    mocks.pathname = '/admin/jobs';
    mocks.order.mockResolvedValueOnce({
      data: [{ id: 'cached-job', title: 'Cached role', status: 'Active', created_at: '2026-10-01T00:00:00Z' }],
      error: null,
    });
    await renderAdmin();
    expect(screen.getByText('Cached role')).toBeDefined();
    cleanup();
    mocks.order.mockReturnValue(new Promise(() => {}));
    await renderAdmin();
    expect(screen.getByText('Cached role')).toBeDefined();
  });
});

describe('admin without Supabase configuration', () => {
  it('shows an unavailable-authentication message and disables login actions', async () => {
    mocks.supabase = null;
    await act(async () => { render(<Admin />); });
    expect(screen.getByText('Supabase is not configured. Admin authentication is unavailable.')).toBeDefined();
    expect(screen.getByPlaceholderText('admin@macenza.com').disabled).toBe(true);
    expect(screen.getByPlaceholderText('••••••••••••').disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Forgot Password?' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: /Enter Dashboard/ }).disabled).toBe(true);
    expect(mocks.getSession).not.toHaveBeenCalled();
    expect(mocks.onAuthStateChange).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
