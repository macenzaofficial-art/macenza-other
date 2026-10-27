import Blog from '@/components/pages/Blog';
import { sanityClient } from '@/lib/sanityClient';

// Incremental Static Regeneration: Revalidate at most once every 5 minutes (300 seconds)
export const revalidate = 300;

export const metadata = {
  title: 'Insights & Articles | Macenza Blog',
  description: 'Explore the latest articles, guides, tech updates, and AI trends from the engineering team at Macenza.',
  alternates: {
    canonical: 'https://www.macenza.com/blog',
  },
};

async function getPosts() {
  try {
    const query = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      body,
      "authorName": author->name,
      "authorImage": author->image,
      "categories": categories[]->title
    }`;
    const data = await sanityClient.fetch(query);
    return data || [];
  } catch (err) {
    console.error('Failed to load blog posts in ISR:', err);
    return [];
  }
}

export default async function Page() {
  const initialPosts = await getPosts();
  return <Blog initialPosts={initialPosts} />;
}

