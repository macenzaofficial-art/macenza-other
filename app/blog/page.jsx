import Blog from '@/components/pages/Blog';

export const metadata = {
  title: 'Insights & Articles | Macenza Blog',
  description: 'Explore the latest articles, guides, tech updates, and AI trends from the engineering team at Macenza.',
  alternates: {
    canonical: 'https://www.macenza.com/blog',
  },
};

export default function Page() {
  return <Blog />;
}
