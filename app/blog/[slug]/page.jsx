import BlogPost from '@/components/pages/BlogPost';
import { generateSlug, getPostSlug } from '@/lib/slugUtils';
import { sanityClient, urlFor } from '@/lib/sanityClient';

export const revalidate = 300;

async function getPostData(slug) {
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

    const allPosts = await sanityClient.fetch(allPostsQuery);
    if (!allPosts || allPosts.length === 0) return { post: null, relatedPosts: [] };

    const cleanParamSlug = generateSlug(decodeURIComponent(slug || ''));
    const matched = allPosts.find(p => {
      const pSlug = getPostSlug(p);
      const pTitleSlug = generateSlug(p.title);
      const rawSlug = p.slug?.current ? generateSlug(p.slug.current) : '';

      return (
        pSlug === cleanParamSlug ||
        pTitleSlug === cleanParamSlug ||
        rawSlug === cleanParamSlug ||
        p._id === slug ||
        p._id === cleanParamSlug ||
        pSlug === slug ||
        pTitleSlug === slug
      );
    });

    if (!matched) return { post: null, relatedPosts: [] };

    const others = allPosts.filter(p => p._id !== matched._id).slice(0, 3);
    return { post: matched, relatedPosts: others };
  } catch (err) {
    console.error('Server-side post fetch failed:', err);
    return { post: null, relatedPosts: [] };
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const { post } = await getPostData(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Macenza Blog',
      description: 'The requested article could not be found.',
    };
  }

  let imageUrl = null;
  try {
    if (post.mainImage) {
      imageUrl = urlFor(post.mainImage).width(1200).height(630).url();
    }
  } catch {
    imageUrl = null;
  }

  return {
    title: `${post.title} | Macenza Blog`,
    description: post.title,
    alternates: {
      canonical: `https://www.macenza.com/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} | Macenza`,
      description: post.title,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.authorName ? [post.authorName] : ['Macenza Engineering'],
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const { post, relatedPosts } = await getPostData(slug);

  return <BlogPost initialPost={post} initialRelatedPosts={relatedPosts} />;
}

