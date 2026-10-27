import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '../components/Section';
import ScrollJourney from '../components/ScrollJourney';
import BouncyText from '../components/BouncyText';
import Footer from '../components/Footer';
import {
  Rocket, Brain, Target, Zap, Lightbulb, Globe,
  Search, ArrowRight, CheckCircle2, Star, Users,
  Heart, Briefcase, MapPin, Clock, ArrowDown, X, Upload, Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import { fallbackJobs } from '../data/fallbackJobs';
import SEO from '../components/SEO';

gsap.registerPlugin(ScrollTrigger);

const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const culturePoints = [
  "Documented specs", "Asynchronous Git workflow", "No unnecessary meetings",
  "Modular code reuse", "Staging server testing", "Direct client demos"
];

const hiringSteps = [
  "Application Review", "Initial Screening", "Technical Interview",
  "Team Discussion", "Final Interview", "Offer & Onboarding"
];

const benefits = [
  { text: "Remote-First Options", icon: "🏡", bg: "bg-sky-500/10", hoverBg: "group-hover:bg-sky-500/20" },
  { text: "Market-Aligned Pay", icon: "💰", bg: "bg-emerald-500/10", hoverBg: "group-hover:bg-emerald-500/20" },
  { text: "Technical Learning Budget", icon: "🎓", bg: "bg-violet-500/10", hoverBg: "group-hover:bg-violet-500/20" },
  { text: "Modern Dev Tools Access", icon: "🧠", bg: "bg-amber-500/10", hoverBg: "group-hover:bg-amber-500/20" },
  { text: "Flexible Schedule Blocks", icon: "⏰", bg: "bg-rose-500/10", hoverBg: "group-hover:bg-rose-500/20" },
  { text: "Async Collaboration Tools", icon: "🌐", bg: "bg-teal-500/10", hoverBg: "group-hover:bg-teal-500/20" },
  { text: "Mentorship & Code Reviews", icon: "📈", bg: "bg-indigo-500/10", hoverBg: "group-hover:bg-indigo-500/20" },
  { text: "Supportive Work Environment", icon: "✨", bg: "bg-pink-500/10", hoverBg: "group-hover:bg-pink-500/20" }
];

const testimonials = [
  {
    name: "Divyanshi Sen",
    role: "Full-Stack Developer",
    content: "Macenza provided a great environment to work on real-world web applications. The team is supportive, and I gained valuable experience while delivering quality solutions to clients.",
    image: "/review/divyanshi-review.webp"
  },
  {
    name: "Piyush Saini",
    role: "Full-Stack Developer",
    content: "Working at Macenza was an excellent experience. I had the opportunity to build scalable web solutions and collaborate with a talented and professional team.",
    image: "/review/piyush-review.webp"
  }
];

const Careers = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const [jobsList, setJobsList] = useState([]);

  // Fetch dynamic jobs from Supabase
  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setJobsList(data);
        return;
      }
      setJobsList(fallbackJobs);
    } catch (err) {
      console.warn("Supabase database not reached or table missing. Operating in static demonstration mode.", err);
      setJobsList(fallbackJobs);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchJobs();

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

      // Stagger job cards once the job grid enters the viewport
      gsap.from(".job-card", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".job-grid",
          start: "top 75%",
          toggleActions: "play none none none"
        }
      });
    }, pageRef);

    // Refresh ScrollTrigger after a timeout to fix late rendering layout shifts
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1500);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  // Sync scrolltrigger animations if jobs list changes dynamically
  useEffect(() => {
    if (jobsList.length > 0) {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    }
  }, [jobsList]);

  const careersSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Careers at Macenza | Join Our Team",
    "url": "https://www.macenza.com/careers",
    "description": "Explore career opportunities at Macenza. Join our team of engineers, developers, and AI specialists building the future of software."
  };

  return (
    <div ref={pageRef} className="bg-white text-black min-h-screen relative">
      <SEO
        title="Careers at Macenza | Join Our Team"
        description="Explore career opportunities at Macenza. Join our team of engineers, developers, and AI specialists building the future of software."
        canonicalPath="/careers"
        schema={careersSchema}
      />
      {/* Hero Section */}
      <section className="relative min-h-[80vh] lg:min-h-[85vh] flex flex-col items-center justify-start overflow-hidden pt-44 pb-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-left w-full flex flex-col items-start justify-center">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-6 reveal-up">
              Join Macenza
            </div>
            <h1 className="text-[2.2rem] md:text-[4.41rem] font-faculty font-normal tracking-normal text-black mb-8 reveal-up leading-tight">
              <BouncyText text="Build Software. " /> <br />
              <BouncyText text="With Macenza." className="text-primary italic" />
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-black/60 font-light reveal-up mb-12">
              Join our team of backend engineers, frontend developers, and system designers building custom software for client businesses.
            </p>
            <div className="flex flex-wrap justify-start gap-6 reveal-up">
              <button
                onClick={() => document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-primary text-white rounded-full font-bold text-lg glow-blue hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/20 flex items-center gap-3"
              >
                View Open Positions <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/careers/general')}
                className="px-10 py-5 glass-morphism text-black rounded-full font-bold text-lg hover:bg-black hover:text-white hover:!border-black transition-all duration-300 border !border-black/15 text-center"
              >
                Join Our Mission
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
            <pattern id="dotGridCareers" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" />
            </pattern>
            <rect width="120" height="160" fill="url(#dotGridCareers)" />
          </svg>

          {/* Glowing Tech Waves (Flowing data particles) */}
          <svg className="absolute right-[-10%] bottom-[-5%] w-[110%] h-[55%] pointer-events-none z-0" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="glowCareers" cx="50%" cy="50%" r="50%">
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
            <circle cx="350" cy="320" r="14" fill="url(#glowCareers)" opacity="0.7" className="animate-node-pulse" />
            <circle cx="350" cy="320" r="4" fill="#ffffff" className="animate-node-pulse" />

            <circle cx="550" cy="260" r="16" fill="url(#glowCareers)" opacity="0.8" className="animate-node-pulse-delayed" />
            <circle cx="550" cy="260" r="5" fill="#ffffff" className="animate-node-pulse-delayed" />

            <circle cx="750" cy="200" r="12" fill="url(#glowCareers)" opacity="0.6" className="animate-node-pulse" />
            <circle cx="750" cy="200" r="3.5" fill="#ffffff" className="animate-node-pulse" />

            <circle cx="200" cy="290" r="10" fill="url(#glowCareers)" opacity="0.5" className="animate-node-pulse-delayed" />
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

      {/* Why Join Macenza */}
      <Section id="why-join" title="Why Work With Us" subtitle="We maintain structured tasks, clear logic pipelines, and full developer code transparency.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Structured Workflow",
              icon: "⚡",
              desc: "Work in a task-based environment where you focus directly on writing code and testing scripts.",
              bgClass: "bg-amber-500/10"
            },
            {
              title: "Code Focus",
              icon: "🧠",
              desc: "Write modular frontend components, construct database schemas, and deploy container applications.",
              bgClass: "bg-violet-500/10"
            },
            {
              title: "Direct Ownership",
              icon: "🎯",
              desc: "Take ownership of your software features, schema designs, and API documentation.",
              bgClass: "bg-rose-500/10"
            },
            {
              title: "Skill Growth",
              icon: "🚀",
              desc: "Advance your knowledge in Next.js, FastAPI, Node.js, and server orchestration.",
              bgClass: "bg-pink-500/10"
            },
            {
              title: "Code Quality Focus",
              icon: "💡",
              desc: "Write testable functions, maintain clear specifications, and conduct collaborative code reviews.",
              bgClass: "bg-yellow-500/10"
            },
            {
              title: "Global Collaboration",
              icon: "🌐",
              desc: "Collaborate asynchronously with clients on multi-national software rollouts.",
              bgClass: "bg-teal-500/10"
            }
          ].map((feature, i) => (
            <div key={i} className="p-10 rounded-[3rem] glass-morphism border border-dark/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group reveal-up">
              <div className={`mb-8 p-5 rounded-2xl w-fit transition-all duration-500 text-4xl group-hover:scale-110 ${feature.bgClass}`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">{feature.title}</h3>
              <p className="text-black/60 font-light leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Company Culture Showcase */}
      <Section id="culture" className="overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[150px] -rotate-12 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto text-center mb-20 reveal-up relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-black">Life at <span className="text-primary italic">Macenza</span></h2>
          <p className="text-xl text-black/60 font-light leading-relaxed">
            Our workspace runs on clear task queues, async coordination, and minimal meetings. We focus on shipping functional code and maintaining robust environments.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10 reveal-up">
          {culturePoints.map((point, i) => (
            <div key={i} className="p-8 rounded-3xl glass-morphism border border-black/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 text-center group">
              <div className="mb-4 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold block leading-tight text-black">{point}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Open Positions */}
      <Section id="positions" title="Current Open Roles" subtitle="Find your role in our engineering and development team.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 job-grid">
          {jobsList.map((job, i) => (
            <div key={job.id || job._id || i} className="job-card p-10 rounded-[2.5rem] border border-black/5 hover:border-primary/20 hover:shadow-xl transition-colors transition-shadow duration-500 group flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h4 className="text-2xl font-bold text-black mb-2 group-hover:text-primary transition-colors">{job.title}</h4>
                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5 text-black/40 text-sm font-medium">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-black/40 text-sm font-medium">
                    <Clock className="w-4 h-4" /> {job.employmentType || job.type || 'Full Time'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/careers/${generateSlug(job.title)}`)}
                className="px-8 py-4 bg-black text-white rounded-full font-bold text-sm hover:bg-primary transition-all duration-300 shadow-lg group-hover:shadow-primary/20 text-center whitespace-nowrap"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Hiring Process */}
      <ScrollJourney 
        title={<>Our Hiring <span className="text-primary italic">Journey</span></>} 
        steps={hiringSteps} 
      />

      {/* Benefits */}
      <Section id="benefits" title="Perks & Benefits" subtitle="We offer supportive conditions to keep our developers and designers focused on shipping quality code.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 reveal-up">
          {benefits.map((benefit, i) => (
            <div key={i} className="p-8 rounded-[2rem] border border-black/5 hover:border-primary/20 hover:shadow-lg transition-all duration-500 text-center group">
              <div className={`mb-6 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500 text-3xl group-hover:scale-110 ${benefit.bg} ${benefit.hoverBg}`}>
                {benefit.icon}
              </div>
              <h4 className="font-bold text-black text-sm uppercase tracking-wider">{benefit.text}</h4>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section id="testimonials" className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {testimonials.map((t, i) => (
            <div key={i} className="p-12 rounded-[3rem] glass-morphism border border-black/5 reveal-up hover:shadow-2xl transition-colors transition-shadow duration-500 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <img src={t.image} alt={t.name} className="w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white" />
              <div>
                <p className="text-xl text-black/70 font-light italic leading-relaxed mb-8">"{t.content}"</p>
                <h4 className="text-lg font-bold text-black">{t.name}</h4>
                <p className="text-sm text-primary font-bold uppercase tracking-widest">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <Section id="final-cta" className="text-center">
        <div className="max-w-5xl mx-auto p-20 rounded-[4rem] bg-primary text-white relative overflow-hidden reveal-up">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>

          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight font-turret">
            Ready to Build Custom Apps?
          </h2>
          <p className="text-2xl text-white/80 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
            Join Macenza and build custom web applications, APIs, and database structures.
          </p>
          <button
            onClick={() => navigate('/careers/general')}
            className="relative z-10 inline-block px-8 py-4 sm:px-16 sm:py-6 bg-white text-primary rounded-full font-bold text-base sm:text-xl hover:bg-dark hover:text-white transition-all duration-300 shadow-2xl whitespace-nowrap"
          >
            Apply Now
          </button>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default Careers;
