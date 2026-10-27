import JobDetails from '@/components/pages/JobDetails';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  return {
    title: 'Job Opportunity | Careers at Macenza',
    description: 'View full role responsibilities, tech stack specifications, and submit your application at Macenza.',
    alternates: {
      canonical: `https://www.macenza.com/careers/${resolvedParams?.id || ''}`,
    },
  };
}

export default function Page() {
  return <JobDetails />;
}
