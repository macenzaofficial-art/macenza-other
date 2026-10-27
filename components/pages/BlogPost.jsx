import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { sanityClient, urlFor } from '../sanityClient';
import {
  Calendar, Clock, User, ArrowLeft, Share2,
  Copy, Check, ChevronRight, Bookmark, ArrowRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import Section from '../components/Section';
import Footer from '../components/Footer';

export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getPostSlug = (post) => {
  if (!post) return '';
  if (post.slug?.current) {
    return generateSlug(post.slug.current);
  }
  if (typeof post.slug === 'string') {
    return generateSlug(post.slug);
  }
  return generateSlug(post.title) || post._id || '';
};

// Safe link href helper to prevent XSS protocol injection
export const getSafeHref = (href) => {
  if (!href) return '';
  const trimmed = href.trim();
  // Safe protocols: http, https, mailto, tel. Also allow relative/anchor links
  const isSafeProtocol = /^(https?|mailto|tel):/i.test(trimmed);
  const isRelative = trimmed.startsWith('/') || trimmed.startsWith('#');
  if (isSafeProtocol || isRelative) {
    return trimmed;
  }
  return '#';
};

// Rich portable text renderer
const PortableText = ({ value }) => {
  if (!Array.isArray(value)) return null;

  return value.map((block, index) => {
    // Handle inline image blocks
    if (block._type === 'image' && block.asset) {
      return (
        <figure key={index} className="my-10 rounded-3xl overflow-hidden border border-[#BFDBFE]/50 shadow-md">
          <img
            src={urlFor(block).width(1000).url()}
            alt={block.alt || 'Macenza Blog Illustration'}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="text-center text-xs text-black/50 py-3 bg-[#EFF6FF]">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    if (block._type !== 'block' || !block.children) return null;

    const content = block.children.map((child, cIdx) => {
      let text = child.text;

      // Handle links
      if (child.marks && child.marks.length > 0 && block.markDefs) {
        const linkMark = block.markDefs.find(m => child.marks.includes(m._key) && m._type === 'link');
        if (linkMark && linkMark.href) {
          return (
            <a
              key={cIdx}
              href={getSafeHref(linkMark.href)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold underline decoration-primary/40 underline-offset-4 hover:decoration-primary transition-all"
            >
              {text}
            </a>
          );
        }
      }

      if (child.marks && child.marks.includes('strong')) {
        text = <strong key={cIdx} className="font-extrabold text-black">{text}</strong>;
      }
      if (child.marks && child.marks.includes('em')) {
        text = <em key={cIdx} className="italic text-black/90">{text}</em>;
      }
      return text;
    });

    if (block.listItem === 'bullet') {
      return (
        <li key={index} className="text-base md:text-lg text-black/75 leading-relaxed ml-6 list-disc mb-2">
          {content}
        </li>
      );
    }

    if (block.style === 'h1') {
      return <h1 key={index} className="text-3xl md:text-4xl font-black mt-12 mb-6 text-black tracking-tight leading-tight">{content}</h1>;
    }
    if (block.style === 'h2') {
      return <h2 key={index} className="text-2xl md:text-3xl font-black mt-10 mb-5 text-black tracking-tight leading-tight">{content}</h2>;
    }
    if (block.style === 'h3') {
      return <h3 key={index} className="text-xl md:text-2xl font-bold mt-8 mb-4 text-black leading-snug">{content}</h3>;
    }
    if (block.style === 'h4') {
      return <h4 key={index} className="text-lg md:text-xl font-bold mt-6 mb-3 text-black">{content}</h4>;
    }
    if (block.style === 'blockquote') {
      return (
        <blockquote key={index} className="border-l-4 border-primary pl-6 py-3 my-8 italic text-black/80 bg-[#EFF6FF] rounded-r-2xl text-lg font-light">
          "{content}"
        </blockquote>
      );
    }

    return <p key={index} className="text-base md:text-lg text-black/75 leading-relaxed mb-6 font-normal">{content}</p>;
  });
};

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchPostDetails = async () => {
      setLoading(true);
      try {
        // Fetch all posts to ensure matching by Sanity slug, sluggified title, or _id
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

        if (allPosts && allPosts.length > 0) {
          const cleanParamSlug = generateSlug(decodeURIComponent(slug || ''));

          // Find matching post
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

          if (matched) {
            setPost(matched);
            // Related posts excluding current one
            const others = allPosts.filter(p => p._id !== matched._id).slice(0, 3);
            setRelatedPosts(others);
          } else {
            setPost(null);
          }
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error('Failed to load blog post from Sanity:', err);
        toast.error('Failed to connect to Sanity blog repository');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Article link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out "${post?.title}" by Macenza:`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-24 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-black/50">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col justify-between pt-32">
        <div className="container mx-auto px-6 text-center max-w-xl my-auto py-16">
          <div className="w-16 h-16 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
            <Bookmark className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Article Not Found</h1>
          <p className="text-black/60 font-light mb-8 leading-relaxed">
            The article you are looking for may have been moved, updated, or does not exist.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold text-sm rounded-full shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog Archives
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const postSlug = getPostSlug(post);
  const readingTime = post.body ? Math.max(1, Math.ceil(JSON.stringify(post.body).length / 1200)) : 1;
  const canonicalUrl = `https://www.macenza.com/blog/${postSlug}`;

  const postSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.mainImage ? urlFor(post.mainImage).width(1200).height(630).url() : "https://www.macenza.com/logo.svg",
    "datePublished": post.publishedAt || new Date().toISOString(),
    "dateModified": post.publishedAt || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": post.authorName || "Macenza Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Macenza",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.macenza.com/logo.svg"
      }
    },
    "description": post.body && post.body[0]?.children?.[0]?.text
      ? post.body[0].children[0].text.slice(0, 160)
      : "Read the latest engineering and tech insights from Macenza.",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-white flex flex-col pt-24">
      <SEO
        title={`${post.title} | Macenza Blog`}
        description={
          post.body && post.body[0]?.children?.[0]?.text
            ? post.body[0].children[0].text.slice(0, 160)
            : `Read ${post.title} on Macenza Blog.`
        }
        canonicalPath={`/blog/${postSlug}`}
        schema={postSchema}
      />

      {/* Breadcrumbs & Top Navigation */}
      <div className="border-b border-[#BFDBFE]/40 bg-[#EFF6FF]/40 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between gap-4 text-xs font-semibold text-black/60">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-black/30 shrink-0" />
            <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5 text-black/30 shrink-0" />
            <span className="text-black font-bold truncate max-w-[200px] sm:max-w-md">{post.title}</span>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-bold shrink-0 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Articles
          </Link>
        </div>
      </div>

      {/* Main Article Header */}
      <header className="container mx-auto px-6 pt-12 md:pt-16 pb-8 max-w-4xl">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.categories && post.categories.map(cat => (
            <span
              key={cat}
              className="px-3.5 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-black uppercase tracking-wider"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black text-black tracking-tight leading-[1.15] mb-8">
          {post.title}
        </h1>

        {/* Meta Author & Timestamp Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-[#BFDBFE]/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-[#BFDBFE] shrink-0">
              {post.authorImage ? (
                <img
                  src={urlFor(post.authorImage).width(120).height(120).url()}
                  alt={post.authorName || 'Author'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-black">{post.authorName || 'Macenza Engineering'}</h4>
              <div className="flex items-center gap-3 text-xs text-black/50 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'Recent'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  {readingTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy Link"
              className="p-2.5 rounded-xl border border-[#BFDBFE] hover:bg-[#EFF6FF] text-black/70 hover:text-primary transition-all flex items-center gap-1 text-xs font-bold"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={handleShareLinkedIn}
              title="Share on LinkedIn"
              className="p-2.5 rounded-xl border border-[#BFDBFE] hover:bg-[#EFF6FF] text-black/70 hover:text-blue-700 transition-all flex items-center justify-center"
              aria-label="Share on LinkedIn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </button>
            <button
              onClick={handleShareTwitter}
              title="Share on X"
              className="p-2.5 rounded-xl border border-[#BFDBFE] hover:bg-[#EFF6FF] text-black/70 hover:text-black transition-all flex items-center justify-center"
              aria-label="Share on X"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Featured Banner Image */}
      {post.mainImage && (
        <div className="container mx-auto px-6 max-w-4xl mb-12">
          <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden border border-[#BFDBFE] shadow-lg">
            <img
              src={urlFor(post.mainImage).width(1400).height(800).url()}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto px-6 max-w-3xl pb-20">
        <div className="prose prose-lg prose-blue text-black/80 font-normal leading-relaxed">
          <PortableText value={post.body} />
        </div>

        {/* Author Bio Box */}
        {post.authorName && (
          <div className="mt-16 p-8 rounded-[2.5rem] bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border border-[#BFDBFE] shrink-0 shadow-sm">
              {post.authorImage ? (
                <img
                  src={urlFor(post.authorImage).width(160).height(160).url()}
                  alt={post.authorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-black text-xl">
                  {post.authorName.charAt(0)}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Written By</span>
              <h3 className="text-xl font-bold text-black mt-0.5">{post.authorName}</h3>
              <p className="text-sm text-black/65 mt-2 font-light leading-relaxed">
                {post.authorBio && Array.isArray(post.authorBio)
                  ? post.authorBio[0]?.children?.[0]?.text
                  : "Engineer and contributor at Macenza, passionate about building intelligent software and high-performance applications."}
              </p>
            </div>
          </div>
        )}

        {/* Project Call to Action */}
        <div className="mt-12 p-8 md:p-10 rounded-[2.5rem] bg-primary text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-primary/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Build With Macenza
            </div>
            <h3 className="text-2xl font-bold font-faculty">Ready to accelerate your next software project?</h3>
            <p className="text-sm text-white/80 font-light mt-1 max-w-lg leading-relaxed">
              Our engineering team builds custom web platforms, AI integrations, and automation systems tailored for your business.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-8 py-4 bg-white text-primary rounded-full font-bold text-sm hover:bg-black hover:text-white transition-all duration-300 shrink-0 shadow-md"
          >
            Start a Conversation
          </Link>
        </div>
      </article>

      {/* More / Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="bg-neutral-50 py-20 border-t border-black/5">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Keep Reading</span>
                <h2 className="text-3xl font-black text-black tracking-tight mt-1">More Insights &amp; Articles</h2>
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-dark transition-colors group"
              >
                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map(related => {
                const relSlug = getPostSlug(related);
                return (
                  <Link
                    key={related._id}
                    to={`/blog/${relSlug}`}
                    className="bg-white border border-[#BFDBFE] rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="h-[200px] overflow-hidden relative">
                        {related.mainImage ? (
                          <img
                            src={urlFor(related.mainImage).width(450).height(300).url()}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#EFF6FF] flex items-center justify-center text-primary font-black">
                            MACENZA
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                          {related.categories && related.categories.map(cat => (
                            <span key={cat} className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white rounded font-black text-[9px] uppercase tracking-wider">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 flex flex-col gap-3">
                        <span className="text-[9px] text-black/40 flex items-center gap-1.5 font-bold uppercase">
                          <Calendar className="w-3 h-3 text-primary" />
                          {related.publishedAt ? new Date(related.publishedAt).toLocaleDateString() : 'Recent'}
                        </span>
                        <h3 className="text-lg font-black text-black group-hover:text-primary transition-colors tracking-tight leading-snug line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-black/50 text-xs leading-relaxed font-light line-clamp-2">
                          {related.body && related.body[0]?.children?.[0]?.text || 'Read full article insights.'}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[#BFDBFE]/30 text-xs">
                      <span className="font-bold text-black/70">{related.authorName || 'Contributor'}</span>
                      <span className="font-black text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        READ <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default BlogPost;
