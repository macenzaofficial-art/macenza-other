import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Cpu, Code, Globe, Smartphone, Zap, Cloud, ArrowRight } from 'lucide-react';
import HeroSequence from '../components/HeroSequence';
import HeroOverlay from '../components/HeroOverlay';
import Section from '../components/Section';
import Footer from '../components/Footer';
import LogoLoop from '../components/LogoLoop';
import ScrollVelocity from '../components/ScrollVelocity';
import { TestimonialCard } from '../components/ui/testimonial-cards';
import { cn } from '../lib/utils';
import SEO from '../components/SEO';

const services = [
  { image: "/portfolio/website_development.webp", title: "Website Development", desc: "We design and build custom frontend websites and headless CMS integrations. We use Next.js and Tailwind CSS to ensure rapid load times, responsive layouts, and search engine optimization, resolving slow load speeds and high bounce rates for consumer brands.", link: "/solutions" },
  { image: "/portfolio/web_applications.webp", title: "Web Applications", desc: "We build tailored SaaS platforms and internal business portals. Using React, TypeScript, and PostgreSQL, we consolidate spreadsheets, legacy databases, and separate APIs into a single secure web system tailored for your specific operating workflow.", link: "/solutions" },
  { image: "/portfolio/hrms_software.webp", title: "HRMS Software", desc: "We engineer customized human resource management dashboards. We use Node.js and React to integrate time tracking, automated payroll calculations, and job applicant queues, preventing human entry errors and database sync conflicts.", link: "https://www.hrenso.com/" },
  { image: "/portfolio/ai_development.webp", title: "AI Development", desc: "We integrate custom machine learning algorithms and language model APIs into existing applications. Using Python, PyTorch, and OpenAI API, we automate document categorization and customer service routing to lower manual operations cost.", link: "/solutions" },
  { image: "/portfolio/automation_solutions.webp", title: "Automation Solutions", desc: "We write custom scripts and scheduled background pipelines. Using Node.js, cron jobs, and webhooks, we automate data synchronization between inventory tools, accounting databases, and CRMs, removing manual file copying tasks.", link: "/solutions" },
  { image: "/portfolio/hotel_management.webp", title: "Hotel Management Software", desc: "We build custom hotel management software that helps hotels manage bookings, guests, rooms, billing, and staff from one easy-to-use system.", link: "/solutions" },
];

const portfolioProjects = [
  {
    name: "DIPLIM.COM",
    category: "AI Fashion / Digital Creative Platform",
    desc: "Diplim is a web tool apparel brands use to create product photos without physical photoshoots. Brands upload flat garment images, and the system processes and projects the clothing onto photorealistic digital models. Workflow yields downloadable, high-resolution marketing-ready assets, reducing agency coordination time and model casting costs.",
    image: "/portfolio/diplim_fashion.webp",
    buttonText: "View Project",
    url: "https://diplim.com"
  },
  {
    name: "HRMS Platform",
    category: "Human Resource Management System",
    desc: "A unified portal connecting timesheet logging, payroll calculations, and applicant tracking. Employees log hours, managers approve timesheets via web dashboard, and payroll reports generate automatically using PostgreSQL calculations, resolving payroll discrepancies and admin bottlenecking.",
    image: "/portfolio/hrms_saas.webp",
    buttonText: "View Project",
    url: "https://www.hrenso.com/"
  }
];

const techLogos = [
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">React</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">Next.js</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">TypeScript</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">Tailwind CSS</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">Node.js</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">Python</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">OpenAI</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">TensorFlow</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">AWS</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">Docker</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">PostgreSQL</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">NVIDIA</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">Figma</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">GitHub</span> },
  { node: <span className="text-3xl font-black text-black/30 hover:text-primary transition-all duration-300 tracking-tight">Google</span> },
];

const globalTestimonials = [
  {
    name: "Harrison M.",
    country: "Australia",
    flag: "🇦🇺",
    industry: "Healthcare Services",
    project: "HRMS Platform",
    avatar: "/review/client_1.webp",
    rating: 5,
    outcome: "We migrated our workforce scheduling and automated payroll tracking to the new HRMS platform. The integration resolved our shift overlapping errors and cut weekly payroll processing time by over 12 hours."
  },
  {
    name: "Sarah K.",
    country: "USA",
    flag: "🇺🇸",
    industry: "Legal Operations",
    project: "Custom AI Development",
    avatar: "/review/client_2.webp",
    rating: 5,
    outcome: "The custom text-parsing pipeline categorizes client file uploads and maps key metadata fields directly into our database. This reduced document classification bottlenecks, allowing our paralegals to process cases twice as fast."
  },
  {
    name: "Tomas V.",
    country: "Czech Republic",
    flag: "🇨🇿",
    industry: "Information Technology",
    project: "Enterprise RAG System",
    avatar: "/review/client_3.webp",
    rating: 5,
    outcome: "By indexing our documentation repository with the custom RAG system, our service representatives can query product manuals via natural language. Customer ticket resolution speed increased by 35% within the first month."
  },
  {
    name: "Dilrabo S.",
    country: "Uzbekistan",
    flag: "🇺🇿",
    industry: "Hospitality",
    project: "Hotel Management System",
    avatar: "/review/client_4.webp",
    rating: 5,
    outcome: "Our receptionist staff now uses the unified ledger to check guest check-ins, process room changes, and invoice cleanings. The live room-state dashboard has completely eliminated double-booking reservation errors."
  },
  {
    name: "Olivia P.",
    country: "Canada",
    flag: "🇨🇦",
    industry: "Financial Advisory",
    project: "CRM Platform",
    avatar: "/review/client_5.webp",
    rating: 5,
    outcome: "The custom relationship portal consolidates our client history files, task logs, and meeting reminders into a single layout. The system saves our advisors hours of spreadsheet management each week."
  },
  {
    name: "James R.",
    country: "United Kingdom",
    flag: "🇬🇧",
    industry: "Logistics & Distribution",
    project: "Business Automation",
    avatar: "/review/client_6.webp",
    rating: 5,
    outcome: "We automated our ordering system to sync incoming email orders directly with our warehouse inventory records. The pipeline removed manual transcription checks and accelerated order packing speed."
  },
  {
    name: "Elena B.",
    country: "Germany",
    flag: "🇩🇪",
    industry: "Industrial Manufacturing",
    project: "Manufacturing Dashboard",
    avatar: "/review/client_7.webp",
    rating: 5,
    outcome: "The live dashboard aggregates sensor logs and displays machine load rates on the assembly line in real time. The alert triggers help our shift supervisors identify and resolve bottleneck jams immediately."
  },
  {
    name: "Tariq A.",
    country: "UAE",
    flag: "🇦🇪",
    industry: "Commercial Real Estate",
    project: "ERP Solution",
    avatar: "/review/client_8.webp",
    rating: 5,
    outcome: "Our property managers now coordinate tenant contracts, service invoices, and maintenance logs in a single web ledger. The database schema has simplified reporting, reducing contract administrative overhead by 40%."
  },
  {
    name: "Mei Ling T.",
    country: "Singapore",
    flag: "🇸🇬",
    industry: "Trade Finance",
    project: "AI Document Processing",
    avatar: "/review/client_9.webp",
    rating: 5,
    outcome: "The document ingestion software automatically reads vendor invoices, formats currency values, and validates tax codes. It processes thousands of bills daily with zero manual intervention required."
  },
  {
    name: "Sophie de J.",
    country: "Netherlands",
    flag: "🇳🇱",
    industry: "Digital Publishing",
    project: "Custom SaaS Platform",
    avatar: "/review/client_10.webp",
    rating: 5,
    outcome: "We replaced our separate billing plug-ins with a custom unified billing platform. The dashboard handles monthly renewals and subscription plan changes, eliminating billing coordination disputes."
  }
];

const Marquee = ({ items }) => {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [baseOffset, setBaseOffset] = useState(0);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
    if (containerRef.current) {
      const style = window.getComputedStyle(containerRef.current);
      const matrix = new WebKitCSSMatrix(style.transform);
      setBaseOffset(matrix.m41);
    }
  };

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    setDragOffset(0);
  };

  const duplicatedItems = [...items, ...items];

  const trackStyle = {
    animationPlayState: isPaused ? 'paused' : 'running',
    transform: dragOffset !== 0 ? `translateX(${baseOffset + dragOffset}px)` : undefined,
  };

  return (
    <div className="relative w-full overflow-hidden py-12 select-none">
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none"></div>

      <div
        ref={containerRef}
        className="flex gap-6 w-max animate-marquee-left hover:[animation-play-state:paused]"
        style={trackStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {duplicatedItems.map((item, idx) => (
          <div
            key={idx}
            className="w-[320px] md:w-[380px] flex-shrink-0 p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-black/5 hover:border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.12)] hover:-translate-y-[6px] transition-all duration-500 ease-out flex flex-col justify-between text-left group cursor-default"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-16 h-16 rounded-full object-cover border border-black/5 shadow-sm group-hover:scale-105 transition-transform duration-500"
                />
                <div>
                  <h4 className="text-xl font-bold text-black leading-tight tracking-tight">{item.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-black/40 font-bold uppercase tracking-wider mt-1">
                    <span>{item.flag}</span>
                    <span>{item.country}</span>
                  </div>
                </div>
              </div>

              <span className="text-primary text-xs font-black tracking-[0.2em] uppercase block mb-3">
                {item.project}
              </span>

              <div className="flex gap-1 text-amber-500 text-sm mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>

              <p className="text-black/60 font-light leading-relaxed text-sm md:text-base">
                "{item.outcome}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Home = React.memo(() => {
  const navigate = useNavigate();

  const handleLoadingComplete = () => {
    ScrollTrigger.refresh();
  };

  const [positions, setPositions] = useState([
    "front",
    "middle",
    "back",
    ...Array(globalTestimonials.length - 3).fill("back")
  ]);

  const handleShuffle = () => {
    setPositions((prev) => {
      const copy = [...prev];
      copy.unshift(copy.pop());
      return copy;
    });
  };

  const homeSchema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Macenza",
      "url": "https://www.macenza.com/",
      "logo": "https://www.macenza.com/logo.svg",
      "description": "Macenza delivers AI software solutions, automation systems, high-performance web applications, and custom digital transformation solutions.",
      "sameAs": [
        "https://in.linkedin.com/company/macenza",
        "https://instagram.com/macenza.ai"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "info@macenza.com",
        "contactType": "customer service"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Macenza",
      "url": "https://www.macenza.com/"
    }
  ];

  return (
    <div className="relative w-full max-w-full overflow-x-clip">
      <SEO
        title="Macenza | AI Software Development Company"
        description="Macenza delivers AI software solutions, automation systems, high-performance web applications, and custom digital transformation solutions."
        canonicalPath="/"
        schema={homeSchema}
      />
      <div id="hero-trigger" className="relative">
        <HeroSequence onLoadingComplete={handleLoadingComplete}>
          <div className="hero-overlay-container absolute inset-0 z-30">
            <HeroOverlay />
          </div>
        </HeroSequence>
      </div>

      {/* Technology & Partners Logo Carousel */}
      <div className="py-8 sm:py-12 bg-white border-y border-black/5 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 mb-4 sm:mb-6">
          <p className="text-[11px] sm:text-xs font-bold text-center text-black/40 uppercase tracking-[0.2em] sm:tracking-[0.25em]">
            Programming Languages, Frameworks, and Tools We Use
          </p>
        </div>
        <LogoLoop
          logos={techLogos}
          speed={35}
          direction="left"
          logoHeight={36}
          gap={40}
          fadeOut={true}
          fadeOutColor="#ffffff"
          scaleOnHover={true}
          pauseOnHover={true}
          ariaLabel="Technology Partners and Tools Loop"
        />
      </div>

      <Section
        id="services"
        title="Our Capabilities"
        subtitle="We build custom software, modern web applications, and smart automation that fits your business needs."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              onClick={() => {
                const selection = window.getSelection().toString();
                if (!selection) {
                  if (service.link.startsWith('http')) {
                    window.open(service.link, '_blank', 'noopener,noreferrer');
                  } else {
                    navigate(service.link);
                  }
                }
              }}
              className="rounded-2xl sm:rounded-3xl border border-dark/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group block overflow-hidden bg-white/50 backdrop-blur-sm cursor-pointer select-text"
            >
              <div className="aspect-video w-full overflow-hidden relative border-b border-dark/5">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  draggable="false"
                />
              </div>
              <div className="p-5 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">{service.title}</h3>
                <p className="text-black/60 font-light leading-relaxed text-sm md:text-base">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="why-macenza" className="bg-white text-black">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 tracking-tight text-black">
              Why <span className="text-primary">Macenza?</span>
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {[
                { title: "Transparent Development Process", desc: "We provide clients with direct access to their project's Git repository and schedule weekly video reviews to demo codebase updates." },
                { title: "Scalable Relational Databases", desc: "We write clean database schemas with proper foreign keys, indexing, and query optimizations to keep response times low under high user concurrency." },
                { title: "Automated Deployment Pipelines", desc: "We containerize applications using Docker and write configuration scripts for automated server updates, minimizing staging and production downtime." },
                { title: "Long-Term Code Maintenance", desc: "We offer monthly maintenance plans to monitor server error logs, update outdated libraries, patch security issues, and fix user bugs." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm sm:text-base">
                    0{i + 1}
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-black">{item.title}</h4>
                    <p className="text-black/60 font-light leading-relaxed text-sm sm:text-base">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] sm:aspect-square rounded-2xl sm:rounded-3xl overflow-hidden group max-w-lg mx-auto lg:max-w-none w-full">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-700"></div>
            <img
              src="/macenza-ad.webp"
              alt="AI Technology"
              width={800}
              height={800}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
            />
          </div>
        </div>
      </Section>

      <div className="py-6 sm:py-8 bg-white overflow-hidden border-t border-black/5 flex flex-col gap-2 sm:gap-3">
        <ScrollVelocity
          texts={['Website Development • IT Services • Web App Development • AI Solutions • Custom Software •']}
          velocity={35}
          className="text-black/10 uppercase font-black text-xl sm:text-2xl md:text-3xl"
        />
        <ScrollVelocity
          texts={['Cloud Infrastructure • Automation • UI/UX Design • Mobile Apps • Data Science •']}
          velocity={-35}
          className="text-black/5 uppercase font-black text-xl sm:text-2xl md:text-3xl"
        />
      </div>

      <Section
        id="portfolio"
        title="Products."
        subtitle="Explore software projects we have designed, built, and deployed for client organizations."
        className="bg-white text-black"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {portfolioProjects.map((project, index) => {
            const isExternal = project.url.startsWith('http');
            const handlePortfolioClick = () => {
              const selection = window.getSelection().toString();
              if (!selection) {
                if (isExternal) {
                  window.open(project.url, '_blank', 'noopener,noreferrer');
                } else {
                  navigate(project.url);
                }
              }
            };

            return (
              <div
                key={index}
                onClick={handlePortfolioClick}
                className="portfolio-card group relative rounded-2xl sm:rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-black/5 hover:border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.12)] p-5 sm:p-7 md:p-8 transition-colors transition-shadow duration-700 ease-out flex flex-col justify-between overflow-hidden cursor-pointer select-text"
              >
                <div>
                  <div className="relative aspect-[16/10] rounded-xl sm:rounded-[2rem] overflow-hidden mb-5 sm:mb-7 shadow-[0_15px_35px_rgba(0,0,0,0.05)] border border-black/5">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[800ms] ease-out"
                      draggable="false"
                    />
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-500">
                      <span className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white/95 backdrop-blur-md text-black rounded-full font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75">
                        {project.buttonText} <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <span className="text-primary text-[11px] sm:text-xs font-black tracking-[0.18em] sm:tracking-[0.2em] uppercase">
                      {project.category}
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-black/10 flex items-center justify-center text-xs font-bold text-black/40 group-hover:text-primary group-hover:border-primary/30 transition-colors duration-300">
                      0{index + 1}
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-black group-hover:text-primary transition-colors duration-300 tracking-tight">
                    {project.name}
                  </h3>
                  <p className="text-black/60 font-light mt-2.5 sm:mt-4 leading-relaxed text-sm md:text-base">
                    {project.desc}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />
              </div>
            );
          })}
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section
        id="testimonials-section"
        className="bg-white text-black relative overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
          {/* Column 1: Copy/Info */}
          <div className="flex flex-col items-start text-left max-w-xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black mb-4 sm:mb-6">
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-black/60 font-light leading-relaxed mb-6 sm:mb-8">
              Discover some of the software solutions we've delivered for businesses across multiple industries and countries. Drag the top card left/right or click the button to cycle through client success stories.
            </p>
            <button
              onClick={handleShuffle}
              className="px-6 py-3.5 sm:px-8 sm:py-4 bg-primary text-white rounded-full font-bold text-sm hover:bg-black transition-all duration-300 shadow-lg hover:shadow-primary/20 min-h-[44px]"
            >
              Next Story
            </button>
          </div>

          {/* Column 2: Testimonial Card Stack */}
          <div className="relative h-[410px] sm:h-[450px] md:h-[480px] w-full flex justify-center items-center overflow-hidden sm:overflow-visible">
            <div className="relative h-[380px] sm:h-[420px] md:h-[450px] w-[260px] min-[360px]:w-[280px] min-[400px]:w-[310px] sm:w-[330px] md:w-[350px] select-none">
              {globalTestimonials.map((t, index) => (
                <TestimonialCard
                  key={index}
                  id={index + 1}
                  testimonial={t.outcome}
                  author={`${t.name} — ${t.project} @ ${t.industry}`}
                  avatar={t.avatar}
                  handleShuffle={handleShuffle}
                  position={positions[index]}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Founder Section */}
      <Section
        id="founder"
        title="Meet the Founder"
        subtitle="The vision behind Macenza and the principles that guide every software solution we build."
        className="bg-white text-black relative overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-stretch reveal-up">
          {/* Left Column: Portrait and Stats */}
          <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-8">
            <div className="portfolio-card relative rounded-2xl sm:rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-4 sm:p-6 flex flex-col justify-between overflow-hidden h-full">
              <div className="relative aspect-[4/5] rounded-xl sm:rounded-[2rem] overflow-hidden mb-4 sm:mb-6 shadow-sm border border-black/5">
                <img
                  src="/review/founder.webp"
                  alt="Shashank Shubham"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center md:text-left px-1 sm:px-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-black tracking-tight mb-1">Shashank Shubham</h3>
                <span className="text-primary text-xs font-black tracking-[0.2em] uppercase">Founder & CEO</span>
              </div>
            </div>

            {/* Stats list */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { title: "Founded", value: "2025" },
                { title: "Specialization", value: "AI & SaaS" },
                { title: "Focus", value: "Custom Software" },
                { title: "Mission", value: "Practical Tech" }
              ].map((stat, i) => (
                <div key={i} className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-[2rem] bg-white/40 backdrop-blur-xl border border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] text-center">
                  <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-black/55 uppercase font-black tracking-wider">{stat.title}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Founder content and quote */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6 sm:gap-8">
            {/* Main content card */}
            <div className="portfolio-card relative rounded-2xl sm:rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-5 sm:p-7 md:p-10 flex flex-col gap-6 sm:gap-8 h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-primary mb-2 sm:mb-3 uppercase tracking-wider">About</h4>
                  <p className="text-black/65 font-light leading-relaxed text-sm md:text-base">
                    Macenza was founded with a simple belief: technology should solve real business problems, not create unnecessary complexity. From AI-powered applications to enterprise software and SaaS platforms, every solution is designed with long-term scalability, performance, and usability in mind.
                  </p>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-primary mb-2 sm:mb-3 uppercase tracking-wider">Why Macenza Was Started</h4>
                  <p className="text-black/65 font-light leading-relaxed text-sm md:text-base">
                    Many businesses struggle with software that is difficult to use, expensive to maintain, or doesn't truly fit their workflows. Macenza was created to build practical software that helps companies automate operations, improve efficiency, and grow with confidence.
                  </p>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-primary mb-2 sm:mb-3 uppercase tracking-wider">Our Philosophy</h4>
                  <p className="text-black/65 font-light leading-relaxed text-sm md:text-base">
                    We believe great software starts by understanding the business before writing a single line of code. Every project begins with discovery, thoughtful planning, clean architecture, and transparent collaboration. Our focus is on building software that delivers long-term value rather than unnecessary complexity.
                  </p>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-primary mb-2 sm:mb-3 uppercase tracking-wider">Our Vision</h4>
                  <p className="text-black/65 font-light leading-relaxed text-sm md:text-base">
                    To build intelligent software and AI solutions that help businesses around the world innovate, automate, and scale. We aim to create reliable digital products that make advanced technology practical, accessible, and impactful.
                  </p>
                </div>
              </div>

              {/* Founder quote */}
              <div className="border-t border-black/5 pt-5 sm:pt-7 mt-2 sm:mt-4">
                <blockquote className="text-lg sm:text-xl md:text-2xl text-black/80 font-light italic leading-relaxed mb-3 sm:mb-4">
                  "The best software isn't the one with the most features—it's the one that solves the right problem in the simplest possible way."
                </blockquote>
                <cite className="text-xs font-bold text-black/55 uppercase tracking-wider not-italic">
                  — Shashank Shubham, Founder & CEO
                </cite>
              </div>

              {/* Buttons */}
              <div className="flex flex-col min-[480px]:flex-row flex-wrap gap-3 sm:gap-4 mt-2 sm:mt-4">
                <Link
                  to="/contact"
                  className="px-6 py-3.5 sm:px-8 sm:py-4 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary-dark transition-all duration-300 shadow-md flex items-center justify-center gap-2 min-h-[44px]"
                >
                  Let's Build Together
                </Link>
                <Link
                  to="/solutions"
                  className="px-6 py-3.5 sm:px-8 sm:py-4 bg-white text-black border border-black/10 rounded-full font-bold text-sm hover:bg-black hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center min-h-[44px]"
                >
                  View Our Work
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="contact" className="text-center bg-white">
        <div className="max-w-5xl mx-auto px-5 py-10 sm:px-10 sm:py-14 md:p-16 lg:p-20 rounded-3xl sm:rounded-[3rem] lg:rounded-[4rem] bg-primary text-white relative overflow-hidden reveal-up">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
          <h2 className="text-3xl min-[380px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 tracking-tight font-turret">
            Start Your Software Project
          </h2>
          <p className="text-base sm:text-xl md:text-2xl text-white/85 font-light mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            Get in touch with our engineering team to discuss your application requirements, database schema design, and cloud hosting specifications.
          </p>
          <Link to="/contact" className="relative z-10 inline-block px-7 py-3.5 sm:px-12 sm:py-5 md:px-16 md:py-6 bg-white text-primary rounded-full font-bold text-sm sm:text-lg md:text-xl hover:bg-dark hover:text-white transition-all duration-300 shadow-2xl whitespace-nowrap min-h-[48px]">
            Get in Touch
          </Link>
        </div>
      </Section>

      <Footer />
    </div>
  );
});

export default Home;
