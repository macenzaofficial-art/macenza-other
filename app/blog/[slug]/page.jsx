import BlogPost from '@/components/pages/BlogPost';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  return {
    title: 'Macenza Blog',
    description: 'Read the latest technology, AI, and developer insights from Macenza.',
    alternates: {
      canonical: `https://www.macenza.com/blog/${slug}`,
    },
  };
}

export default function Page() {
  return <BlogPost />;
}
