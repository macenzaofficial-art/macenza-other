import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sanityClient, urlFor } from '../sanityClient';
import { Calendar, User, ArrowRight, ChevronRight, Award } from 'lucide-react';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import Section from '../components/Section';
import BouncyText from '../components/BouncyText';
import Footer from '../components/Footer';
import { getPostSlug } from './BlogPost';

const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch all posts from Sanity
  useEffect(() => {
    const fetchPosts = async () => {
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
        setPosts(data || []);
      } catch (err) {
        console.error('Failed to load blog posts from Sanity:', err);
        toast.error('Failed to connect to Sanity blog repository');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Extract all categories from posts
  const categoriesList = ['All', ...new Set(posts.flatMap(post => post.categories || []))];

  // Filter posts based on selection
  const filteredPosts = activeCategory === 'All'
    ? posts
    : posts.filter(post => post.categories && post.categories.includes(activeCategory));

  const featuredPost = filteredPosts[0];
  const recentPosts = filteredPosts.slice(1);

  const seoSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Macenza Blog",
    "url": "https://www.macenza.com/blog",
    "description": "Read the latest tech, AI, and developer insights from Macenza."
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-white overflow-x-hidden flex flex-col pt-24">
      <SEO
        title="Insights & Articles | Macenza Blog"
        description="Explore the latest articles, guides, tech updates, and AI trends from the engineering team at Macenza."
        canonicalPath="/blog"
        schema={seoSchema}
      />

      {/* Header section */}
      <section className="relative py-20 bg-black/5 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-block px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-6">
            Tech &amp; Engineering Blog
          </div>
          <h1 className="text-[2.31rem] md:text-[3.68rem] font-faculty font-normal tracking-normal text-black mb-6">
            <BouncyText text="Insights & " />
            <BouncyText text="Articles" className="text-primary italic" />
          </h1>
          <p className="max-w-2xl mx-auto text-black/50 text-base md:text-lg font-light leading-relaxed">
            Latest trends, updates, and deep dives from our engineers, designers, and specialists.
          </p>
        </div>
      </section>

      {/* Category Navigation Bar */}
      <div className="border-b border-[#BFDBFE]/40 bg-white sticky top-20 z-20 backdrop-blur-md bg-opacity-80 py-4 shadow-sm">
        <div className="container mx-auto px-6 flex items-center justify-start sm:justify-center overflow-x-auto gap-2 custom-scrollbar">
          {categoriesList.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                  : 'bg-white border border-[#BFDBFE] text-black/75 hover:bg-[#EFF6FF] hover:text-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <Section id="blog-content" className="py-20 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-black/40">Loading blog archives...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 flex flex-col items-center gap-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[3rem] p-10">
            <Award className="w-12 h-12 text-primary" />
            <h3 className="text-xl font-extrabold text-black">No Articles Yet</h3>
            <p className="text-xs text-black/60 font-light">
              We are preparing our first publications. Open Sanity Studio at localhost:3333 and publish your first article to display it here!
            </p>
          </div>
        ) : (
          <div className="container mx-auto px-6 flex flex-col gap-16">
            
            {/* Featured Article Card */}
            {featuredPost && activeCategory === 'All' && (() => {
              const featuredSlug = getPostSlug(featuredPost);
              return (
                <Link 
                  to={`/blog/${featuredSlug}`}
                  className="bg-white border border-[#BFDBFE] rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 transition-[border-color,box-shadow] duration-500 flex flex-col lg:flex-row group"
                >
                  <div className="lg:w-1/2 min-h-[300px] max-h-[500px] overflow-hidden relative">
                    {featuredPost.mainImage ? (
                      <img 
                        src={urlFor(featuredPost.mainImage).width(800).height(600).url()} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#EFF6FF] flex items-center justify-center text-primary font-black text-2xl">
                        MACENZA
                      </div>
                    )}
                    <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                      {featuredPost.categories && featuredPost.categories.map(cat => (
                        <span key={cat} className="px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-between gap-8">
                    <div className="flex flex-col gap-4">
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">Featured Story</span>
                      <h2 className="text-2xl md:text-3xl font-black text-black group-hover:text-primary transition-colors tracking-tight leading-tight">
                        {featuredPost.title}
                      </h2>
                      <p className="text-black/60 text-sm md:text-base leading-relaxed font-light line-clamp-3">
                        {/* Generates short preview text from body */}
                        {featuredPost.body && featuredPost.body[0]?.children?.[0]?.text || 'Click to read full article insights.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#BFDBFE]/40 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-[#BFDBFE]">
                          {featuredPost.authorImage ? (
                            <img src={urlFor(featuredPost.authorImage).width(80).height(80).url()} alt={featuredPost.authorName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-black/30 m-2" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-black">{featuredPost.authorName || 'Macenza Contributor'}</span>
                          <span className="text-[10px] text-black/40 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-primary" />
                            {featuredPost.publishedAt ? new Date(featuredPost.publishedAt).toLocaleDateString() : 'Draft'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-black text-primary group-hover:translate-x-1.5 transition-transform duration-300">
                        READ POST <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* Recent Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(activeCategory === 'All' ? recentPosts : filteredPosts).map(post => {
                const postSlug = getPostSlug(post);
                return (
                  <Link 
                    key={post._id}
                    to={`/blog/${postSlug}`}
                    className="bg-white border border-[#BFDBFE] rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-[border-color,box-shadow] duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-[220px] overflow-hidden relative">
                        {post.mainImage ? (
                          <img 
                            src={urlFor(post.mainImage).width(400).height(300).url()} 
                            alt={post.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#EFF6FF] flex items-center justify-center text-primary font-black">
                            MACENZA
                          </div>
                        )}
                        
                        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                          {post.categories && post.categories.map(cat => (
                            <span key={cat} className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white rounded font-black text-[9px] uppercase tracking-wider">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 md:p-8 flex flex-col gap-3">
                        <span className="text-[9px] text-black/40 flex items-center gap-1.5 font-bold uppercase">
                          <Calendar className="w-3 h-3 text-primary" />
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
                        </span>
                        <h3 className="text-lg font-black text-black group-hover:text-primary transition-colors tracking-tight leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-black/50 text-xs leading-relaxed font-light line-clamp-2">
                          {post.body && post.body[0]?.children?.[0]?.text || 'Click to view full insights.'}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t border-[#BFDBFE]/30 flex items-center justify-between">
                      <span className="text-xs font-bold text-black">{post.authorName || 'Contributor'}</span>
                      <span className="text-[10px] font-black text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        VIEW <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        )}
      </Section>

      <Footer />
    </div>
  );
};

export default Blog;
