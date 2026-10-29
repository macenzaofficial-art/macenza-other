// @vitest-environment jsdom
// Runner prerequisites: Vitest, React Testing Library, jsdom, the @/ root alias,
// and automatic JSX transformation (as in Next.js's bundled Vitest guide).
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const navigation = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }));
vi.mock('react-toastify', () => ({ ToastContainer: () => <div data-testid="global-toasts" /> }));
vi.mock('../../components/SmoothScroll', () => ({ default: () => <div data-testid="smooth-scroll" /> }));
vi.mock('../../components/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
import ClientLayout from '../../components/ClientLayout';

afterEach(() => cleanup());

describe('route-specific global UI', () => {
  it.each(['/', '/blog', '/careers/general', null])('renders marketing UI and children on %j', (path) => {
    navigation.pathname = path;
    render(<ClientLayout><main>Page content</main></ClientLayout>);
    expect(screen.getByTestId('global-toasts')).toBeDefined();
    expect(screen.getByTestId('smooth-scroll')).toBeDefined();
    expect(screen.getByTestId('navbar')).toBeDefined();
    expect(screen.getByText('Page content')).toBeDefined();
  });

  it.each(['/admin', '/admin/jobs', '/admin/resume-manager'])('leaves the admin to supply its own UI on %s', (path) => {
    navigation.pathname = path;
    render(<ClientLayout><main>Admin content</main></ClientLayout>);
    expect(screen.queryByTestId('global-toasts')).toBeNull();
    expect(screen.queryByTestId('smooth-scroll')).toBeNull();
    expect(screen.queryByTestId('navbar')).toBeNull();
    expect(screen.getByText('Admin content')).toBeDefined();
  });

  it('updates global UI when navigating into and out of admin', () => {
    navigation.pathname = '/blog';
    const { rerender } = render(<ClientLayout><main>Persistent content</main></ClientLayout>);
    navigation.pathname = '/admin/jobs';
    rerender(<ClientLayout><main>Persistent content</main></ClientLayout>);
    expect(screen.queryByTestId('global-toasts')).toBeNull();
    expect(screen.getByText('Persistent content')).toBeDefined();
    navigation.pathname = '/contact';
    rerender(<ClientLayout><main>Persistent content</main></ClientLayout>);
    expect(screen.getByTestId('global-toasts')).toBeDefined();
    expect(screen.getAllByTestId('global-toasts')).toHaveLength(1);
  });
});
