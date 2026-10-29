// @vitest-environment node
// Await the server functions directly; React does not mount async components here.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  supabase: null, from: vi.fn(), select: vi.fn(), eq: vi.fn(), order: vi.fn(), notFound: vi.fn(),
}));
vi.mock('@/lib/supabaseClient', () => ({ get supabase() { return mocks.supabase; } }));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('@/components/pages/Careers', () => ({ default: () => null }));
vi.mock('@/components/pages/JobDetails', () => ({ default: () => null }));

import CareersIndex, { dynamic as indexDynamic } from '../../app/careers/page';
import CareerDetail, { dynamic, generateMetadata } from '../../app/careers/[id]/page';
import Careers from '../../components/pages/Careers';
import JobDetails from '../../components/pages/JobDetails';
import { fallbackJobs, generalApplicationJob } from '../../data/fallbackJobs';
import { generateSlug } from '../../lib/slugUtils';

const job = { id: 42, _id: 'legacy-42', title: 'Platform Engineer', description: 'Build reliable software.' };
const props = (id) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  mocks.supabase = { from: mocks.from };
  mocks.from.mockReset().mockReturnValue({ select: mocks.select });
  mocks.select.mockReset().mockReturnValue({ eq: mocks.eq });
  // The list chains .order(); details await .eq() directly.
  mocks.eq.mockReset().mockReturnValue({ data: [job], error: null, order: mocks.order });
  mocks.order.mockReset().mockResolvedValue({ data: [job], error: null });
  mocks.notFound.mockReset().mockImplementation(() => { throw new Error('NEXT_NOT_FOUND'); });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('careers index server data', () => {
  it('passes active jobs to the client with fallback disabled', async () => {
    const element = await CareersIndex();
    expect(element.type).toBe(Careers);
    expect(element.props).toEqual({ initialJobs: [job], isFallback: false });
    expect(mocks.from).toHaveBeenCalledWith('jobs');
    expect(mocks.select).toHaveBeenCalledWith('*');
    expect(mocks.eq).toHaveBeenCalledWith('status', 'Active');
    expect(mocks.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(indexDynamic).toBe('force-dynamic');
  });

  it('marks jobs as fallback data when Supabase is unconfigured', async () => {
    mocks.supabase = null;
    expect((await CareersIndex()).props).toEqual({ initialJobs: fallbackJobs, isFallback: true });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it.each([[], null, undefined].map(value => [value]))('marks an empty database result as fallback data: %j', async (data) => {
    mocks.order.mockResolvedValue({ data, error: null });
    expect((await CareersIndex()).props).toEqual({ initialJobs: fallbackJobs, isFallback: true });
  });

  it.each(['reported', 'rejected'])('marks a %s query failure as fallback data', async (kind) => {
    if (kind === 'reported') mocks.order.mockResolvedValue({ data: null, error: new Error('Unavailable') });
    else mocks.order.mockRejectedValue(new Error('Unavailable'));
    expect((await CareersIndex()).props).toEqual({ initialJobs: fallbackJobs, isFallback: true });
  });
});

describe('career detail resolution', () => {
  it.each(['platform-engineer', '42', 'legacy-42', '%2042%20'])('resolves an active job by %s', async (id) => {
    const element = await CareerDetail(props(id));
    expect(element.type).toBe(JobDetails);
    expect(element.props.initialJob).toEqual(job);
    expect(mocks.eq).toHaveBeenCalledWith('status', 'Active');
    expect(mocks.notFound).not.toHaveBeenCalled();
    expect(dynamic).toBe('force-dynamic');
  });

  it.each(['general', 'general-application', '%20general%20'])('resolves %s without querying the database', async (id) => {
    expect((await CareerDetail(props(id))).props.initialJob).toBe(generalApplicationJob);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it.each(['id', 'title'])('uses fallback jobs by %s when unconfigured', async (kind) => {
    mocks.supabase = null;
    const fallback = fallbackJobs[0];
    const id = kind === 'id' ? fallback.id : generateSlug(fallback.title);
    expect((await CareerDetail(props(id))).props.initialJob).toEqual(fallback);
  });

  it.each(['reported', 'rejected'])('uses fallback jobs after a %s database failure', async (kind) => {
    if (kind === 'reported') mocks.eq.mockResolvedValue({ data: null, error: new Error('Unavailable') });
    else mocks.eq.mockRejectedValue(new Error('Unavailable'));
    expect((await CareerDetail(props(fallbackJobs[0].id))).props.initialJob).toEqual(fallbackJobs[0]);
  });

  it.each([[], null, [job]].map(value => [value]))('returns 404 when a successful lookup has no match, even if a fallback matches: %j', async (data) => {
    mocks.eq.mockResolvedValue({ data, error: null });
    await expect(CareerDetail(props(fallbackJobs[0].id))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.notFound).toHaveBeenCalledTimes(1);
  });

  it('returns 404 for unknown fallback jobs', async () => {
    mocks.supabase = null;
    await expect(CareerDetail(props('nonexistent-job'))).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it.each([undefined, ''])('returns 404 for missing IDs: %j', async (id) => {
    await expect(CareerDetail(props(id))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.from).not.toHaveBeenCalled();
  });
});

describe('career detail metadata', () => {
  it('includes an absolute title, description, and canonical URL', async () => {
    expect(await generateMetadata(props('platform-engineer'))).toEqual({
      title: { absolute: 'Platform Engineer | Careers at Macenza' },
      description: job.description,
      alternates: { canonical: 'https://www.macenza.com/careers/platform-engineer' },
      openGraph: {
        title: 'Platform Engineer | Careers at Macenza', description: job.description,
        type: 'website', url: 'https://www.macenza.com/careers/platform-engineer',
      },
    });
  });

  it.each([159, 160, 161])('handles the description boundary at %i characters', async (length) => {
    const description = 'x'.repeat(length);
    mocks.eq.mockResolvedValue({ data: [{ ...job, description }], error: null });
    const metadata = await generateMetadata(props('42'));
    const expected = length > 160 ? `${'x'.repeat(157)}...` : description;
    expect(metadata.description).toBe(expected);
    expect(metadata.openGraph.description).toBe(expected);
  });

  it('supplies a useful description when the job has none', async () => {
    mocks.eq.mockResolvedValue({ data: [{ ...job, description: '' }], error: null });
    expect((await generateMetadata(props('42'))).description).toBe(
      'View full role responsibilities, tech stack specifications, and submit your application at Macenza.',
    );
  });

  it('returns missing-job metadata when the live query succeeds without a match', async () => {
    mocks.eq.mockResolvedValue({ data: [], error: null });
    expect(await generateMetadata(props(fallbackJobs[0].id))).toEqual({
      title: { absolute: 'Job Posting Not Found | Careers at Macenza' },
      description: 'The requested job application page could not be found or has expired.',
      alternates: { canonical: `https://www.macenza.com/careers/${fallbackJobs[0].id}` },
    });
  });
});
