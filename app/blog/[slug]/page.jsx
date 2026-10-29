import { notFound } from 'next/navigation';
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
    if (!allPosts || allPosts.length === 0) return { post: null, relatedPosts: [], notFound: true };

    const cleanParamSlug = generateSlug(decodeURIComponent(slug || ''));

    // Exact slug or ID matches take precedence over title aliases
    let matched = allPosts.find(p => {
      const rawSlug = p.slug?.current ? generateSlug(p.slug.current) : (typeof p.slug === 'string' ? generateSlug(p.slug) : '');
      const pSlug = getPostSlug(p);

      return (
        (rawSlug && (rawSlug === cleanParamSlug || rawSlug === slug)) ||
        (pSlug && (pSlug === cleanParamSlug || pSlug === slug)) ||
        p._id === slug ||
        p._id === cleanParamSlug
      );
    });

    // Fallback to title matching if no exact slug/ID match exists
    if (!matched) {
      matched = allPosts.find(p => {
        const pTitleSlug = generateSlug(p.title);
        return pTitleSlug === cleanParamSlug || pTitleSlug === slug;
      });
    }

    if (!matched) return { post: null, relatedPosts: [], notFound: true };

    const others = allPosts.filter(p => p._id !== matched._id).slice(0, 3);
    return { post: matched, relatedPosts: others, notFound: false };
  } catch (err) {
    console.error('Server-side post fetch failed:', err);
    return { post: null, relatedPosts: [], notFound: false, fetchFailed: true };
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const { post } = await getPostData(slug);

  if (!post) {
    return {
      title: {
        absolute: 'Article Not Found | Macenza Blog',
      },
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

  const firstTextBlock = Array.isArray(post.body)
    ? post.body.find(b => b?._type === 'block' && Array.isArray(b?.children))
    : null;
  const excerpt =
    (firstTextBlock?.children
      ? firstTextBlock.children.map(c => c.text || '').join('').trim().slice(0, 160)
      : null) ||
    (post.body && post.body[0]?.children?.[0]?.text
      ? post.body[0].children[0].text.slice(0, 160)
      : `Read ${post.title} on Macenza Blog.`);

  return {
    title: {
      absolute: `${post.title} | Macenza Blog`,
    },
    description: excerpt,
    alternates: {
      canonical: `https://www.macenza.com/blog/${getPostSlug(post)}`,
    },
    openGraph: {
      title: `${post.title} | Macenza`,
      description: excerpt,
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
  const { post, relatedPosts, notFound: postNotFound } = await getPostData(slug);

  if (postNotFound) {
    notFound();
  }

  return <BlogPost initialPost={post} initialRelatedPosts={relatedPosts} />;
}

