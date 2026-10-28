import Careers from '@/components/pages/Careers';
import { supabase } from '@/lib/supabaseClient';
import { fallbackJobs } from '@/data/fallbackJobs';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: {
    absolute: 'Careers at Macenza | Join Our Team',
  },
  description: 'Explore career opportunities at Macenza. Join our team of engineers, developers, and AI specialists building the future of software.',
  alternates: {
    canonical: 'https://www.macenza.com/careers',
  },
};

async function getJobs() {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data;
    return fallbackJobs;
  } catch (err) {
    console.warn('SSR fetch failed for jobs, using fallbackJobs:', err);
    return fallbackJobs;
  }
}

export default async function Page() {
  const initialJobs = await getJobs();
  return <Careers initialJobs={initialJobs} />;
}

