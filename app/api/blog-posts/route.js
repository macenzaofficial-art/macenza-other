import { NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanityClient';

export async function GET() {
  try {
    const allPostsQuery = `*[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      body,
      "authorName": author->name,
      "authorImage": author->image,
      "authorBio": author->bio,
      "categories": categories[]->title
    }`;

    const posts = await sanityClient.fetch(allPostsQuery);
    return NextResponse.json(posts || []);
  } catch (error) {
    console.error('API route blog-posts fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
}
