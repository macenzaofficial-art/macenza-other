import { cache } from 'react';
import { notFound } from 'next/navigation';
import JobDetails from '@/components/pages/JobDetails';
import { supabase } from '@/lib/supabaseClient';
import { fallbackJobs, generalApplicationJob } from '@/data/fallbackJobs';
import { generateSlug } from '@/lib/slugUtils';

export const dynamic = 'force-dynamic';

const getJob = cache(async (id) => {
  if (!id) return null;
  const cleanId = decodeURIComponent(id).trim();

  if (cleanId === 'general' || cleanId === 'general-application') {
    return generalApplicationJob;
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'Active');

      if (error) throw error;

      const matched = data?.find(
        (j) =>
          generateSlug(j.title) === cleanId ||
          String(j.id) === cleanId ||
          String(j._id) === cleanId
      );
      return matched || null;
    } catch (err) {
      console.warn('Supabase lookup failed or not set up. Falling back to mock jobs.', err);
    }
  }

  const matchedFallback = fallbackJobs.find(
    (j) => j.id === cleanId || generateSlug(j.title) === cleanId
  );

  return matchedFallback || null;
});

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || '';
  const job = await getJob(id);

  if (!job) {
    return {
      title: {
        absolute: 'Job Posting Not Found | Careers at Macenza',
      },
      description: 'The requested job application page could not be found or has expired.',
      alternates: {
        canonical: `https://www.macenza.com/careers/${id}`,
      },
    };
  }

  const jobSlug = id || generateSlug(job.title) || job.id;
  const description = job.description
    ? (job.description.length > 160 ? `${job.description.slice(0, 157)}...` : job.description)
    : 'View full role responsibilities, tech stack specifications, and submit your application at Macenza.';

  return {
    title: {
      absolute: `${job.title} | Careers at Macenza`,
    },
    description,
    alternates: {
      canonical: `https://www.macenza.com/careers/${jobSlug}`,
    },
    openGraph: {
      title: `${job.title} | Careers at Macenza`,
      description,
      type: 'website',
      url: `https://www.macenza.com/careers/${jobSlug}`,
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || '';
  const job = await getJob(id);

  if (!job) {
    notFound();
  }

  return <JobDetails initialJob={job} />;
}
