import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '../components/Section';
import BouncyText from '../components/BouncyText';
import Footer from '../components/Footer';
import {
  Monitor, Server, Smartphone, Database, Brain, Cloud,
  Shield, Zap, Cpu, Globe, Rocket, Terminal,
  Layers, Code, Lock, Activity, Search, ArrowRight,
  ArrowDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

gsap.registerPlugin(ScrollTrigger);

const techStack = [
  {
    name: "Frontend Engineering",
    icon: "💻",
    technologies: [
      "React: Used to build modular, component-based user interfaces.",
      "Next.js: Used for fast page loads, server-side rendering, and SEO performance.",
      "TypeScript: Used to catch syntax and type errors during compilation.",
      "TailwindCSS: Used to write utility-first styling directly in JSX files.",
      "GSAP: Used for hardware-accelerated scroll triggers and page transitions."
    ],
    bgClass: "bg-sky-500/10"
  },
  {
    name: "Backend Engineering",
    icon: "🖥️",
    technologies: [
      "Node.js: Used to execute asynchronous, high-concurrency server code.",
      "Python: Used for machine learning scripts, data processing, and scripting.",
      "FastAPI: Used to build structured REST APIs with auto-generated documentation.",
      "Express.js: Used to handle HTTP routing with minimal server overhead."
    ],
    bgClass: "bg-blue-500/10"
  },
  {
    name: "Mobile Engineering",
    icon: "📱",
    technologies: [
      "Flutter: Used to build native-compiled cross-platform mobile apps.",
      "React Native: Used to share frontend logic between iOS and Android."
    ],
    bgClass: "bg-rose-500/10"
  },
  {
    name: "Databases & Caching",
    icon: "💾",
    technologies: [
      "PostgreSQL: Used to store normalized relational data with strict constraints.",
      "MongoDB: Used to store unstructured documents and JSON files.",
      "Redis: Used as an in-memory key-value cache to speed up database queries."
    ],
    bgClass: "bg-cyan-500/10"
  },
  {
    name: "AI & Machine Learning",
    icon: "🧠",
    technologies: [
      "OpenAI: Used to parse text, summarize logs, and route customer support queries.",
      "LangChain: Used to chain prompt calls and connect tools to language models.",
      "PyTorch: Used to train and fine-tune custom deep learning neural networks."
    ],
    bgClass: "bg-violet-500/10"
  },
  {
    name: "Hotel Management System",
    icon: "🏨",
    technologies: [
      "Booking Engine: Handles online reservations, room availability, and rate management.",
      "Property Management (PMS): Optimizes front desk operations, check-ins, and room assignments.",
      "POS & Billing: Automates billing, restaurant orders, and guest payment processing."
    ],
    bgClass: "bg-emerald-500/10"
  }
];

const capabilities = [
  "Automated Text Parsing", "Background Sync Triggers", "Scheduled Data Queries", "Email Queue Schedulers",
  "Log File Analysis", "Secure API Routing", "CSV Import Automation", "Host Health Audits"
];

const securityFeatures = [
  "HTTPS and SSL Certificates", "Token-Based Session Checks", "Role-Based Database Access",
  "Encrypted Storage Backups", "Strict CORS Origin Filtering", "Express Request Logging"
];

const engineeringExcellence = [
  "Modular Helper Functions", "Relational Schema Indexing", "Automated Git Pull Deployments",
  "Vite Asset Bundling", "Staging Server Testing", "Normalized Data Tables"
];

const agentStack = [
  "OpenAI Text Completion API", "LangChain Pipeline Scripts", "Pgvector Database Extensions", "Structured Prompt Templates",
  "User Session Context Caching", "Scheduled Background Cron Jobs"
];

const metrics = [
  { label: "28", sub: "Software Engineers" },
  { label: "100%", sub: "Code Ownership" },
  { label: "AWS VPS", sub: "Infrastructure" },
  { label: "99.9%", sub: "Database SLA" },
  { label: "Git-based", sub: "Version Control" }
];

const partners = ["OpenAI", "AWS", "Microsoft Azure", "Google Cloud", "Docker", "NVIDIA", "GitHub", "MongoDB"];

const devTools = ["Supabase", "GitHub", "Postman", "Docker Desktop", "Jupyter", "Figma", "Vercel", "Netlify"];

const Technology = () => {
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

      // Metric counters
      gsap.from(".metric-card", {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".metrics-grid",
          start: "top 80%",
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

  const techSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Technology Stack & Infrastructure | Macenza",
    "url": "https://www.macenza.com/technology",
    "description": "Discover the tech stack powering Macenza's AI platforms and web applications, including React, Next.js, Python, Node.js, PostgreSQL, OpenAI, and cloud infrastructure."
  };

  return (
    <div ref={pageRef} className="bg-white text-black min-h-screen">
      <SEO
        title="Technology Stack & Infrastructure | Macenza"
        description="Discover the tech stack powering Macenza's AI platforms and web applications, including React, Next.js, Python, Node.js, PostgreSQL, OpenAI, and cloud infrastructure."
        canonicalPath="/technology"
        schema={techSchema}
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
              Systems Engineering
            </div>
            <h1 className="text-[2.2rem] md:text-[4.41rem] font-faculty font-normal tracking-normal text-black mb-8 reveal-up leading-tight">
              <BouncyText text="Code Built for " /> <br />
              <BouncyText text="Performance." className="text-primary italic" />
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-black/60 font-light reveal-up mb-12">
              We configure cloud infrastructure, normalize relational databases, and build fast frontend interfaces.
            </p>
            <div className="flex flex-wrap justify-start gap-6 reveal-up">
              <button
                onClick={() => document.getElementById('tech-stack')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 bg-primary text-white rounded-full font-bold text-lg glow-blue hover:bg-primary-dark transition-all duration-300 flex items-center gap-3 shadow-xl shadow-primary/20"
              >
                Explore Stack <ArrowDown className="w-5 h-5" />
              </button>
              <Link
                to="/contact"
                className="px-10 py-5 glass-morphism text-black rounded-full font-bold text-lg hover:bg-black hover:text-white hover:!border-black transition-all duration-300 border !border-black/15 text-center"
              >
                Book Consultation
              </Link>
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
            <pattern id="dotGridTech" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" />
            </pattern>
            <rect width="120" height="160" fill="url(#dotGridTech)" />
          </svg>

          {/* Glowing Tech Waves (Flowing data particles) */}
          <svg className="absolute right-[-10%] bottom-[-5%] w-[110%] h-[55%] pointer-events-none z-0" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="glowTech" cx="50%" cy="50%" r="50%">
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
            <circle cx="350" cy="320" r="14" fill="url(#glowTech)" opacity="0.7" className="animate-node-pulse" />
            <circle cx="350" cy="320" r="4" fill="#ffffff" className="animate-node-pulse" />

            <circle cx="550" cy="260" r="16" fill="url(#glowTech)" opacity="0.8" className="animate-node-pulse-delayed" />
            <circle cx="550" cy="260" r="5" fill="#ffffff" className="animate-node-pulse-delayed" />

            <circle cx="750" cy="200" r="12" fill="url(#glowTech)" opacity="0.6" className="animate-node-pulse" />
            <circle cx="750" cy="200" r="3.5" fill="#ffffff" className="animate-node-pulse" />

            <circle cx="200" cy="290" r="10" fill="url(#glowTech)" opacity="0.5" className="animate-node-pulse-delayed" />
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

      {/* Tech Stack Showcase */}
      <Section id="tech-stack" title="Our Technology Stack" subtitle="The frontend frameworks, backend runtimes, databases, and deployment platforms we use to run applications.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {techStack.map((category, idx) => (
            <div key={idx} className="p-10 rounded-[3rem] glass-morphism border border-black/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-colors transition-shadow duration-500 group reveal-up">
              <div className={`mb-8 p-5 rounded-2xl w-fit transition-all duration-500 text-4xl group-hover:scale-110 ${category.bgClass}`}>
                {category.icon}
              </div>
              <h3 className="text-2xl font-bold text-black mb-6">{category.name}</h3>
              <div className="flex flex-col gap-4">
                {category.technologies.map((tech) => (
                  <div key={tech} className="text-sm font-medium text-black/75 hover:text-primary transition-all cursor-default leading-relaxed">
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* AI Capabilities */}
      <Section id="ai-capabilities" className="relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[200px] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20 reveal-up">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-black">Workflow <span className="text-primary italic">Automations</span></h2>
            <p className="text-xl text-black/60 font-light max-w-2xl mx-auto">Integrating APIs, scripting runtimes, and databases to automate manual business processes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 reveal-up">
            {capabilities.map((cap, i) => (
              <div key={i} className="p-8 rounded-[2rem] glass-morphism border border-black/5 flex items-center gap-6 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group">
                <div className="w-3 h-3 bg-primary rounded-full group-hover:scale-150 transition-transform"></div>
                <span className="text-lg font-bold text-black">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Security & Engineering Showcase */}
      <Section id="engineering" className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div className="reveal-up">
            <div className="flex items-center gap-4 mb-8">
              <Shield className="w-10 h-10 text-primary" />
              <h2 className="text-4xl font-bold text-black">Security & Infrastructure</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {securityFeatures.map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1" />
                  <span className="text-black/70 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-up">
            <div className="flex items-center gap-4 mb-8">
              <Terminal className="w-10 h-10 text-primary" />
              <h2 className="text-4xl font-bold text-black">Engineering Excellence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {engineeringExcellence.map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1" />
                  <span className="text-black/70 font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* AI Agent Stack */}
      <Section id="agent-stack" className="bg-white relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20 reveal-up">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-black">Workflow Scripting <span className="text-primary italic">Setup</span></h2>
            <p className="text-xl text-black/60 font-light max-w-2xl mx-auto">The database schemas and API integrations used in our automated text parsing engines.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 reveal-up">
            {agentStack.map((tech, i) => (
              <div key={i} className="p-8 rounded-3xl glass-morphism border border-black/5 hover:border-primary/30 transition-all text-center group shadow-sm">
                <div className="text-black font-bold group-hover:text-primary transition-colors">{tech}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Innovation Lab */}
      <Section id="innovation" className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="reveal-up">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-black">Testing Sandbox <span className="text-primary">Servers</span></h2>
            <p className="text-xl text-black/60 font-light leading-relaxed mb-10">
              We maintain sandbox test servers to try out new database engines, test container loads, and run script performance benchmarks.
            </p>
            <div className="space-y-6">
              {[
                "Database Engine Benchmarks", "Container Load Tests", "API Latency Logs", "Shell Scripting Automations"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-lg font-medium text-black">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative glass-morphism rounded-[3rem] border border-black/10 shadow-2xl overflow-hidden reveal-up group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none"></div>
            <img
              src="/Images/innovation-lab.jpg"
              alt="Macenza Innovation Lab"
              className="w-full h-auto transition-all duration-700 block group-hover:scale-[1.02]"
            />
          </div>
        </div>
      </Section>

      {/* Metrics */}
      <Section id="metrics">
        <div className="metrics-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {metrics.map((m, i) => (
            <div key={i} className="metric-card p-6 sm:p-8 lg:p-6 xl:p-8 rounded-3xl sm:rounded-[2rem] glass-morphism border border-black/5 text-center shadow-sm flex flex-col justify-center">
              <div className="text-xl sm:text-2xl xl:text-3xl font-black text-black mb-2 tracking-tight leading-tight">{m.label}</div>
              <div className="text-[10px] sm:text-xs font-bold text-black/40 uppercase tracking-widest">{m.sub}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Partners */}
      <section id="partners" className="py-20 border-y border-black/5 overflow-hidden relative w-full marquee-container">
        {/* Edge Fades for premium high-end look */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

        <div className="text-center mb-16 reveal-up">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-black/30">Technology Ecosystem</h3>
        </div>

        {/* Infinite scrolling wrapper container */}
        <div className="flex w-max select-none animate-marquee-stats opacity-40 hover:opacity-100 transition-opacity duration-700">
          {/* Group 1 */}
          <div className="flex gap-16 md:gap-32 pr-16 md:pr-32 flex-shrink-0">
            {partners.map((p, i) => (
              <span key={i} className="text-3xl md:text-5xl font-black text-black tracking-tighter hover:text-primary transition-colors duration-300 select-none">{p}</span>
            ))}
          </div>

          {/* Group 2 */}
          <div className="flex gap-16 md:gap-32 pr-16 md:pr-32 flex-shrink-0" aria-hidden="true">
            {partners.map((p, i) => (
              <span key={`g2-${i}`} className="text-3xl md:text-5xl font-black text-black tracking-tighter hover:text-primary transition-colors duration-300 select-none">{p}</span>
            ))}
          </div>

          {/* Group 3 */}
          <div className="flex gap-16 md:gap-32 pr-16 md:pr-32 flex-shrink-0" aria-hidden="true">
            {partners.map((p, i) => (
              <span key={`g3-${i}`} className="text-3xl md:text-5xl font-black text-black tracking-tighter hover:text-primary transition-colors duration-300 select-none">{p}</span>
            ))}
          </div>

          {/* Group 4 */}
          <div className="flex gap-16 md:gap-32 pr-16 md:pr-32 flex-shrink-0" aria-hidden="true">
            {partners.map((p, i) => (
              <span key={`g4-${i}`} className="text-3xl md:text-5xl font-black text-black tracking-tighter hover:text-primary transition-colors duration-300 select-none">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Tools */}
      <Section id="dev-tools" title="Developer Tooling" subtitle="The standard software tools we use to edit, test, and host our codebases.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 reveal-up">
          {devTools.map((tool, i) => (
            <div key={i} className="p-8 rounded-3xl border border-black/5 hover:border-primary/20 hover:shadow-xl transition-all duration-500 text-center group">
              <h4 className="font-bold text-black group-hover:text-primary transition-colors">{tool}</h4>
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
            Start Your Software Project
          </h2>
          <p className="text-2xl text-white/80 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
            Contact our engineering team to discuss your application architecture, schedule a database consult, or review a codebase audit.
          </p>
          <Link to="/contact" className="relative z-10 inline-block px-8 py-4 sm:px-16 sm:py-6 bg-white text-primary rounded-full font-bold text-base sm:text-xl hover:bg-dark hover:text-white transition-all duration-300 shadow-2xl whitespace-nowrap">
            Talk to Our Engineers
          </Link>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

export default Technology;
