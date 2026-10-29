// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ error: vi.fn() }));
vi.mock('@/lib/supabaseClient', () => ({ supabase: null }));
vi.mock('react-toastify', () => ({ toast: { error: mocks.error } }));
vi.mock('gsap', () => ({ default: {
  registerPlugin: vi.fn(), utils: { toArray: () => [] },
  context: (callback) => { callback(); return { revert: vi.fn() }; },
} }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: vi.fn() } }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/BouncyText', () => ({ default: ({ text }) => <span>{text}</span> }));
import CertificateVerification from '../../components/pages/CertificateVerification';

beforeEach(() => {
  vi.useFakeTimers();
  mocks.error.mockReset();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('certificate lookup without a database client', () => {
  it('reports the unavailable service and keeps the form usable', () => {
    render(<CertificateVerification />);
    const input = screen.getByPlaceholderText('e.g. MAC-xxx-xxx');
    fireEvent.change(input, { target: { value: ' mac-test-123 ' } });
    fireEvent.submit(input.closest('form'));
    expect(mocks.error).toHaveBeenCalledExactlyOnceWith('Verification service is temporarily unavailable.');
    expect(screen.getByRole('button', { name: 'Verify Credential' }).disabled).toBe(false);
    expect(screen.queryByText('Verifying...')).toBeNull();
  });

  it('validates a blank credential before checking service availability', () => {
    render(<CertificateVerification />);
    const input = screen.getByPlaceholderText('e.g. MAC-xxx-xxx');
    fireEvent.change(input, { target: { value: ' \t ' } });
    fireEvent.submit(input.closest('form'));
    expect(mocks.error).toHaveBeenCalledExactlyOnceWith('Please enter a certification number.');
  });
});
