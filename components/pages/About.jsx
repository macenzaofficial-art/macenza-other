'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '@/components/Section';
import BouncyText from '@/components/BouncyText';
import Footer from '@/components/Footer';
import {
  Users, Rocket, Globe, Shield, Heart, Zap,
  Lightbulb, Target, Sparkles, ArrowRight, ArrowDown,
  Search, Menu, X
} from 'lucide-react';
import Link from 'next/link';
import SEO from '@/components/SEO';

const teamMembers = [

  { name: "Shashank Shubham", role: "Founder & CEO", image: "/Team/Shashank Shubham Founder & CEO.webp" },
  { name: "Garima", role: "CTO", image: "/Team/Garima CTO.webp" },
  { name: "Dipanshu Shubham", role: "CMO", image: "/Team/A Dipanshu Shubham CMO.webp" },
  { name: "Kavita", role: "Marketing", image: "/Team/A Kavita Markating.webp" },
  { name: "Divya Ghalot", role: "AI Engineer", image: "/Team/A Divya Ghalot AI Engineer.webp" },
  { name: "Priyanka Berwa", role: "HR", image: "/Team/Priyanka HR.webp" },
  { name: "Piyush Saini", role: "Fullstack Developer", image: "/Team/Piyush Saini Fullstack Developer.webp" },
  { name: "Neha Jaiswal", role: "Fullstack Developer", image: "/Team/NEHA JAISWAL Fullstack Developer.webp" },
  { name: "Riva Sha", role: "Fullstack Developer", image: "/Team/Riva Sha FullStack Developer.webp" },
  { name: "Khushboo Rawat", role: "Business Development Manager", image: "/Team/A Khushboo Rawat Business Development Manager.webp" },
  { name: "Aman Partha", role: "Full Stack Developer", image: "/Team/A Aman Partha Full Stack Developer.webp" },
  { name: "Gungun Rawat", role: "Frontend UI/UX Designer", image: "/Team/Gungun UI UX Designer.webp" },
  { name: "Akshita Kumawat", role: "Full Stack Developer", image: "/Team/Akshita Kumawat Full Stack.webp" },
  { name: "Diksha Bansal", role: "Business Development Manager", image: "/Team/A Diksha Bansal AI ML.webp" },
  { name: "Divyanshi Sen", role: "Full Stack Developer", image: "/Team/Divyanshi Sen Full Stack Developer.webp" },
  { name: "Mohit Tanwar", role: "Full Stack Developer", image: "/Team/Mohit Tawar Full Stack Developer.webp" },
  { name: "Sonal Bairwa", role: "Manager", image: "/Team/Sonal Bairwa.webp" },
  { name: "Daksh Singh", role: "Android Developer", image: "/Team/Daksh Singh.webp" },
  { name: "Aachal Kumari", role: "Fullstack Developer", image: "/Team/Aachal Kumari.webp" },
  { name: "Akshata Baloj", role: "Fullstack Developer", image: "/Team/Akshata Baloj Fullstack Developer.webp" },
  { name: "Kapil Sharma", role: "Backend Developer", image: "/Team/A Kapil Sharma Backend Developer.webp" },
  { name: "Naman", role: "Business Development", image: "/Team/A Naman Business Developmenet.webp" },
  { name: "Preet Meena", role: "Marketing", image: "/Team/A Preet Meena Markating.webp" },
  { name: "Payal Meena", role: "UI/UX Designer", image: "/Team/A Payal Meena Ui Ux Designer.webp" },
  { name: "Santosh Rathore", role: "Sales", image: "/Team/A Santosh Rathore Salles.webp" },
  { name: "Anamika Sharma", role: "Frontend Developer", image: "/Team/Anamika Sharma Frontend Developer.webp" },
  { name: "Deepti Solanki", role: "AI/ML Engineer", image: "/Team/Deepti Solanki AI ML Engineer.webp" },
  { name: "Devendra Singh", role: "Backend Engineer", image: "/Team/Devendra Singh Backend Engineer.webp" },
  { name: "Kavita Yadhav", role: "Frontend Engineer", image: "/Team/Kavita Yadhav Frontend Engineer.webp" },
  { name: "Kuldeep Kothari", role: "Cybersecurity Engineer", image: "/Team/Kuldeep kothari Cybersecurity Engineer.webp" },
  { name: "Rohit", role: "Tester & Backend Developer", image: "/Team/Rohit Tester & Backend Developer.webp" },
  { name: "Yashika Agarwal", role: "Data Scientist", image: "/Team/Yashika Agarwal Data Scientist.webp" },
  { name: "Deepak Gupta", role: "Security Tester", image: "/Team/A Deepak Gupta Secutry Tester.webp" }

];

const statsItems = [
  { value: "28", label: "Software Engineers" },
  { value: "100%", label: "Code Ownership" },
  { value: "AWS", label: "Cloud Platform" },
  { value: "99.9%", label: "Host Uptime SLA" },
  { value: "Git", label: "Version Control" }
];

const About = () => {
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      // Animate each reveal-up element individually when it enters the viewport
      gsap.utils.toArray(".reveal-up").forEach((elem) => {
        gsap.from(elem, {
          y: 20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: elem,
            start: "top 96%",
            toggleActions: "play none none none"
          }
        });
      });

      // Stagger animate team cards once the team grid comes into view
      gsap.from(".team-card", {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".team-grid",
          start: "top 75%",
          toggleActions: "play none none none"
        }
      });
    }, pageRef);

    // Refresh ScrollTrigger after a timeout to fix late rendering layout shifts (e.g. unsplash story images loading)
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1500);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Us | Macenza",
    "url": "https://www.macenza.com/about",
    "description": "Learn about Macenza, an AI software development company dedicated to building cutting-edge web applications, custom HRMS software, and AI integration solutions.",
    "publisher": {
      "@type": "Organization",
      "name": "Macenza",
      "url": "https://www.macenza.com/"
    }
  };

  return (
    <div ref={pageRef} className="bg-white text-black min-h-screen">
      <SEO
        title="About Us | Macenza"
        description="Learn about Macenza, an AI software development company dedicated to building cutting-edge web applications, custom HRMS software, and AI integration solutions."
        canonicalPath="/about"
        schema={aboutSchema}
      />
      {/* Hero Section */}
      <section className="relative min-h-[80vh] lg:min-h-[85vh] flex flex-col items-center justify-start overflow-hidden pt-44 pb-24">
        {/* Glow ambient backgrounds on z-0 layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        {/* Text content on middle layer z-10 */}
        <div className="container mx-auto px-6 relative z-10 text-left w-full flex flex-col items-start justify-center">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-6 reveal-up">
              Our Journey
            </div>
            <h1 className="text-[2.2rem] md:text-[4.41rem] font-faculty font-normal tracking-normal text-black mb-8 reveal-up leading-tight">
              <BouncyText text="Building Smarter " /> <br />
              <BouncyText text="Digital Futures." className="text-accent" />
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-black/60 font-light reveal-up mb-12">
              Macenza is a next-generation AI and software company building digital products, automation systems, and transformative technology experiences.
            </p>
            <div className="flex flex-wrap justify-start gap-6 reveal-up">
              <button
                onClick={() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-primary text-white rounded-full font-bold text-lg glow-blue hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/20 flex items-center gap-3"
              >
                Meet our Team <ArrowDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Background Hero Robot Image & decorations on top layer z-20 (pointer-events-none passes all clicks through) */}
        <div className="absolute right-0 bottom-0 top-0 w-full lg:w-1/2 opacity-15 lg:opacity-100 pointer-events-none z-20 overflow-hidden">
          {/* Tech Circle Background */}
          <div className="absolute right-[5%] top-[10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-primary/[0.04] to-accent/[0.04] border border-primary/15 pointer-events-none z-0 blur-[1px]"></div>
          <div className="absolute right-[10%] top-[15%] w-[450px] h-[450px] rounded-full border border-dashed border-primary/25 pointer-events-none z-0 animate-[spin_40s_linear_infinite]"></div>
          <div className="absolute right-[12%] top-[17%] w-[410px] h-[410px] rounded-full border border-dashed border-accent/20 pointer-events-none z-0 animate-[spin_25s_linear_infinite_reverse]"></div>

          {/* Decorative Dot Grid */}
          <svg className="absolute left-[15%] top-[50%] w-[120px] h-[160px] text-primary/15 pointer-events-none z-0" fill="currentColor" viewBox="0 0 120 160">
            <pattern id="dotGridAbout" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" />
            </pattern>
            <rect width="120" height="160" fill="url(#dotGridAbout)" />
          </svg>

          {/* Glowing Tech Waves (Flowing data particles) */}
          <svg className="absolute right-[-10%] bottom-[-5%] w-[110%] h-[55%] pointer-events-none z-0" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="glowAbout" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Main dense dot-stream wave */}
            <path className="animate-flow-dots-fast" d="M -50 340 Q 150 240, 350 320 T 750 200 T 950 260" stroke="#3b82f6" strokeWidth="5" strokeDasharray="0 16" strokeLinecap="round" opacity="0.8" />

            {/* Secondary overlapping wave */}
            <path className="animate-flow-dots-medium" d="M -50 310 Q 130 220, 330 300 T 730 180 T 930 240" stroke="#60a5fa" strokeWidth="3" strokeDasharray="0 12" strokeLinecap="round" opacity="0.6" />

            {/* Accent wave with thin line + sparse glowing dots */}
            <path d="M -50 280 Q 180 180, 380 270 T 780 150 T 980 210" stroke="#93c5fd" strokeWidth="1" opacity="0.2" />
            <path className="animate-flow-dots-reverse" d="M -50 280 Q 180 180, 380 270 T 780 150 T 980 210" stroke="#3b82f6" strokeWidth="6" strokeDasharray="0 48" strokeLinecap="round" opacity="0.8" />

            {/* Bottom thick blurred ambient wave */}
            <path className="animate-flow-dots-slow" d="M -50 370 Q 170 270, 370 350 T 770 230 T 970 290" stroke="#3b82f6" strokeWidth="8" strokeDasharray="0 24" strokeLinecap="round" opacity="0.15" />

            {/* Standalone large glowing nodes */}
            <circle cx="350" cy="320" r="14" fill="url(#glowAbout)" opacity="0.7" className="animate-node-pulse" />
            <circle cx="350" cy="320" r="4" fill="#ffffff" className="animate-node-pulse" />

            <circle cx="550" cy="260" r="16" fill="url(#glowAbout)" opacity="0.8" className="animate-node-pulse-delayed" />
            <circle cx="550" cy="260" r="5" fill="#ffffff" className="animate-node-pulse-delayed" />

            <circle cx="750" cy="200" r="12" fill="url(#glowAbout)" opacity="0.6" className="animate-node-pulse" />
            <circle cx="750" cy="200" r="3.5" fill="#ffffff" className="animate-node-pulse" />

            <circle cx="200" cy="290" r="10" fill="url(#glowAbout)" opacity="0.5" className="animate-node-pulse-delayed" />
            <circle cx="200" cy="290" r="3" fill="#93c5fd" className="animate-node-pulse-delayed" />
          </svg>

          <img
            src="/hero-robot.webp"
            alt="Macenza AI Robot"
            className="w-full h-full object-contain object-right-bottom select-none relative z-10 animate-float"
            loading="lazy"
            decoding="async"
          />
        </div>
        {/* Bottom Fade Mask */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-30"></div>
      </section>

      {/* Company Story */}
      <Section id="story" className="bg-white text-black">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="reveal-up">
            <h2 className="text-4xl md:text-6xl font-bold mb-10 tracking-tight text-black">
              Who <span className="text-primary">We Are</span>
            </h2>
            <div className="space-y-6 text-black/70 text-lg font-light leading-relaxed">
              <p>
                Macenza was founded to help growing businesses replace manual administrative tasks, fragmented spreadsheets, and slow legacy applications with fast, reliable web software. We believe that business software should be straightforward to navigate, quick to load, and easy to maintain over the long term.
              </p>
              <p>
                Our engineering philosophy centers on code simplicity and database normalization. We prefer writing clean, native JavaScript and well-structured SQL queries over adding unnecessary framework layers or complex server abstractions that make software difficult to debug and expensive to host.
              </p>
              <p>
                When working with clients, we operate as an extension of their technical team. We write comprehensive API specifications, build containerized test environments, and deliver full code ownership upon project completion. This ensures your internal team can easily take over the codebase whenever you are ready.
              </p>
            </div>
            <div className="mt-12 flex items-center gap-6">
              <div className="w-16 h-[1px] bg-primary"></div>
              <span className="text-primary font-bold uppercase tracking-widest text-sm">Founded in 2025</span>
            </div>
          </div>
          <div className="relative aspect-square rounded-[3rem] overflow-hidden group reveal-up">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-700"></div>
            <img
              src="/Team/who-we-are.webp"
              alt="Macenza Team"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
            />
          </div>
        </div>
      </Section>

      {/* Mission Vision Values */}
      <Section id="mission">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-12 rounded-[3rem] glass-morphism border border-dark/5 reveal-up hover:shadow-2xl transition-colors transition-shadow duration-500 hover:border-violet-500/20 group">
            <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform duration-300">
              🎯
            </div>
            <h3 className="text-3xl font-bold mb-6">Our Mission</h3>
            <p className="text-black/60 font-light leading-relaxed">
              To build practical, high-performance web software and automated data pipelines that solve concrete administrative bottlenecks for growing operations.
            </p>
          </div>
          <div className="p-12 rounded-[3rem] glass-morphism border border-dark/5 reveal-up hover:shadow-2xl transition-colors transition-shadow duration-500 bg-primary/5 hover:border-amber-500/20 group">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform duration-300">
              💡
            </div>
            <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
            <p className="text-black/60 font-light leading-relaxed">
              To establish a software studio where code quality, database speed, and clear API documentation form the absolute baseline of every client project.
            </p>
          </div>
          <div className="p-12 rounded-[3rem] glass-morphism border border-dark/5 reveal-up hover:shadow-2xl transition-colors transition-shadow duration-500 hover:border-rose-500/20 group">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform duration-300">
              ❤️
            </div>
            <h3 className="text-3xl font-bold mb-6">Our Principles</h3>
            <div className="flex flex-wrap gap-3">
              {["Maintainability", "Performance", "Transparency", "Simple Architecture", "Code Ownership"].map((v) => (
                <span key={v} className="px-4 py-2 bg-white rounded-full text-sm font-bold text-black/70 border border-dark/5 shadow-sm">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Startup Culture */}
      <Section id="culture" className="bg-white text-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[150px] -rotate-12 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto text-center mb-20 reveal-up">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-black">Work Environment at <span className="text-primary">Macenza</span></h2>
          <p className="text-xl text-black/60 font-light leading-relaxed">
            Our workspace runs on clear project task queues and open documentation. We eliminate layers of middle management so engineers can focus directly on writing high-quality code and delivering working features.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-up">
          {[
            { title: "Written specifications & demos", icon: "⚡", bg: "bg-amber-500/10" },
            { title: "Async Git-based collaboration", icon: "🌐", bg: "bg-sky-500/10" },
            { title: "Automation of routine testing", icon: "✨", bg: "bg-violet-500/10" },
            { title: "Code modularity & reuse", icon: "💡", bg: "bg-pink-500/10" },
            { title: "Direct client code reviews", icon: "🎯", bg: "bg-rose-500/10" },
            { title: "Frequent staging releases", icon: "🚀", bg: "bg-indigo-500/10" },
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/50 border border-dark/5 flex items-center gap-6 hover:bg-white/80 transition-all duration-300 shadow-sm group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 ${item.bg} group-hover:scale-110`}>{item.icon}</div>
              <span className="text-lg font-bold text-black">{item.title}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Our Workspace */}
      <Section id="workspace" title="Our Workspace" subtitle="Step inside the environment where our teams collaborate, create, and build next-generation tech.">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 reveal-up">
          {/* Main big image (1) */}
          <div className="md:col-span-6 md:row-span-2 rounded-[2.5rem] overflow-hidden aspect-[4/3] md:aspect-auto group relative shadow-lg">
            <img
              src="/portfolio/1.webp"
              alt="Macenza Office Space"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
              <span className="text-white font-bold text-lg">Main Collaboration Area</span>
            </div>
          </div>

          {/* Small image 2 */}
          <div className="md:col-span-3 rounded-[2rem] overflow-hidden aspect-square group relative shadow-md">
            <img
              src="/portfolio/2.webp"
              alt="Macenza Meeting Room"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <span className="text-white font-bold text-sm">Meeting Room</span>
            </div>
          </div>

          {/* Small image 3 */}
          <div className="md:col-span-3 rounded-[2rem] overflow-hidden aspect-square group relative shadow-md">
            <img
              src="/portfolio/3.webp"
              alt="Macenza Ideation Zone"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <span className="text-white font-bold text-sm">Ideation Zone</span>
            </div>
          </div>

          {/* Small image 4 */}
          <div className="md:col-span-3 rounded-[2rem] overflow-hidden aspect-square group relative shadow-md">
            <img
              src="/portfolio/4.webp"
              alt="Macenza Desk Setups"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <span className="text-white font-bold text-sm">Creative Desk Setups</span>
            </div>
          </div>

          {/* Small image 5 */}
          <div className="md:col-span-3 rounded-[2rem] overflow-hidden aspect-square group relative shadow-md">
            <img
              src="/portfolio/5.webp"
              alt="Macenza Lounge Area"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <span className="text-white font-bold text-sm">Lounge Area</span>
            </div>
          </div>

          {/* Image 6 */}
          <div className="md:col-span-3 rounded-[2rem] overflow-hidden aspect-square group relative shadow-md">
            <img
              src="/portfolio/6.webp"
              alt="Macenza Engineering Hub"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <span className="text-white font-bold text-sm">Engineering Hub</span>
            </div>
          </div>

          {/* Image 7 */}
          <div className="md:col-span-3 rounded-[2rem] overflow-hidden aspect-square group relative shadow-md">
            <img
              src="/portfolio/7.webp"
              alt="Macenza Executive Suite"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <span className="text-white font-bold text-sm">Executive Suite</span>
            </div>
          </div>

          {/* Image 8 */}
          <div className="md:col-span-3 rounded-[2rem] overflow-hidden aspect-square group relative shadow-md">
            <img
              src="/portfolio/8.webp"
              alt="Macenza Innovation Lab"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <span className="text-white font-bold text-sm">Innovation Lab</span>
            </div>
          </div>

          {/* Image 9 */}
          <div className="md:col-span-3 rounded-[2rem] overflow-hidden aspect-square group relative shadow-md">
            <img
              src="/portfolio/9.webp"
              alt="Macenza Breakout Zone"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
              <span className="text-white font-bold text-sm">Breakout Zone</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Stats Section (Infinite Marquee) */}
      <section id="stats" className="py-20 bg-white overflow-hidden relative w-full marquee-container">
        {/* Edge Fades for a premium, high-end look */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

        {/* Infinite scrolling wrapper container (4-group seamless train) */}
        <div className="flex w-max select-none animate-marquee-stats">
          {/* Group 1 */}
          <div className="flex gap-12 md:gap-24 pr-12 md:pr-24 flex-shrink-0">
            {statsItems.map((stat, i) => (
              <div key={i} className="text-center min-w-[200px] flex-shrink-0 select-none">
                <div className="text-5xl md:text-7xl font-black text-primary mb-3 tracking-tighter transition-all duration-300 hover:scale-105 hover:text-blue-700">{stat.value}</div>
                <div className="text-xs md:text-sm font-bold text-black/40 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Group 2 */}
          <div className="flex gap-12 md:gap-24 pr-12 md:pr-24 flex-shrink-0" aria-hidden="true">
            {statsItems.map((stat, i) => (
              <div key={`g2-${i}`} className="text-center min-w-[200px] flex-shrink-0 select-none">
                <div className="text-5xl md:text-7xl font-black text-primary mb-3 tracking-tighter transition-all duration-300 hover:scale-105 hover:text-blue-700">{stat.value}</div>
                <div className="text-xs md:text-sm font-bold text-black/40 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Group 3 */}
          <div className="flex gap-12 md:gap-24 pr-12 md:pr-24 flex-shrink-0" aria-hidden="true">
            {statsItems.map((stat, i) => (
              <div key={`g3-${i}`} className="text-center min-w-[200px] flex-shrink-0 select-none">
                <div className="text-5xl md:text-7xl font-black text-primary mb-3 tracking-tighter transition-all duration-300 hover:scale-105 hover:text-blue-700">{stat.value}</div>
                <div className="text-xs md:text-sm font-bold text-black/40 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Group 4 */}
          <div className="flex gap-12 md:gap-24 pr-12 md:pr-24 flex-shrink-0" aria-hidden="true">
            {statsItems.map((stat, i) => (
              <div key={`g4-${i}`} className="text-center min-w-[200px] flex-shrink-0 select-none">
                <div className="text-5xl md:text-7xl font-black text-primary mb-3 tracking-tighter transition-all duration-300 hover:scale-105 hover:text-blue-700">{stat.value}</div>
                <div className="text-xs md:text-sm font-bold text-black/40 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <Section
        id="team"
        title="Meet Our Team"
        subtitle="The developers, designers, and systems architects who build and maintain our client applications."
        className=""
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 team-grid">
          {teamMembers.map((member, i) => (
            <div key={i} className="team-card group">
              <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 shadow-xl shadow-dark/5">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h4 className="text-xl font-bold text-black">{member.name}</h4>
              <p className="text-sm text-black/50 font-medium">{member.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Why Choose Macenza */}
      <Section id="why" className="bg-white text-black">
        <div className="text-center mb-20 reveal-up">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-black">Why Choose <span className="text-primary">Macenza?</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Transparent Development Process", desc: "We provide clients direct access to their project's Git repository and schedule weekly video demos to review code progress." },
            { title: "Scalable Architecture", desc: "We design normalized database schemas, write optimized SQL queries, and implement cache stores to prevent system slowdowns." },
            { title: "Dedicated Engineering Support", desc: "Our clients collaborate directly with the software developers writing their code, avoiding communication layers." },
            { title: "Production-Ready Deployment", desc: "We write robust server configurations, Docker files, and automated deployment pipelines to ensure stable application rollouts." },
            { title: "Long-Term Code Maintenance", desc: "We offer monthly service contracts to monitor server application logs, update dependencies, patch security vulnerability issues, and fix bugs." },
            { title: "Full Code Ownership", desc: "All repository permissions, documentation, and cloud configuration ownership are transferred to your organization upon project completion." },
          ].map((item, i) => (
            <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-dark/5 shadow-sm reveal-up hover:border-primary/50 transition-colors duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-black">{item.title}</h4>
              <p className="text-black/50 font-light leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Join Our Journey CTA */}
      <Section id="join" className="text-center">
        <div className="max-w-5xl mx-auto p-20 rounded-[4rem] bg-primary text-white relative overflow-hidden reveal-up">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>

          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight font-turret">
            Start Your Software Project
          </h2>
          <p className="text-2xl text-white/80 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
            Contact our engineering team to discuss your application architecture requirements, schedule a database schema consultation, or review a code audit.
          </p>
          <Link href="/contact" className="relative z-10 inline-block px-8 py-4 sm:px-16 sm:py-6 bg-white text-primary rounded-full font-bold text-base sm:text-xl hover:bg-dark hover:text-white transition-all duration-300 shadow-2xl whitespace-nowrap">
            Contact Us
          </Link>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default About;
