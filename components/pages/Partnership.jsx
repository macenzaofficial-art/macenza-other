import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Section from '../components/Section';
import BouncyText from '../components/BouncyText';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  Lock, 
  UserCheck, 
  Check, 
  Server,
  Palette,
  CreditCard,
  Rocket
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const hrmsModules = [
  { name: 'Employee Management', desc: 'Centralized directory, profiles, and organization structures.', icon: Users },
  { name: 'Attendance', desc: 'Real-time tracking, shift management, and punch logs.', icon: CheckCircle2 },
  { name: 'Leave Management', desc: 'Automated leave requests, approvals, and balance tracking.', icon: Briefcase },
  { name: 'Payroll', desc: 'Salary structures, tax deductions, and automated payslips.', icon: CreditCard },
  { name: 'Employee Documents', desc: 'Secure cloud repository for compliance and records.', icon: Layers },
  { name: 'Recruitment', desc: 'Applicant tracking, interview pipelines, and onboarding.', icon: Building2 },
  { name: 'Reports & Analytics', desc: 'Actionable workforce insights and custom export tools.', icon: TrendingUp },
  { name: 'Role & Permission Management', desc: 'Granular access control and audit trails.', icon: Lock },
  { name: 'AI HR Assistant', desc: 'Smart automated responses for policy & employee queries.', icon: Sparkles },
];

const salesBenefits = [
  { title: 'Start a Sales Business', desc: 'Build a business focused on selling proven software and technology solutions.', icon: '⚡', bg: 'bg-violet-500/10' },
  { title: 'No Product Development', desc: "You don't need to build or maintain the software yourself.", icon: '📦', bg: 'bg-blue-500/10' },
  { title: 'Earn From Every Sale', desc: 'Generate income through commission on successful customer sales.', icon: '💰', bg: 'bg-emerald-500/10' },
  { title: 'Focus on Customers', desc: 'Spend your time on lead generation, sales and customer relationships.', icon: '🎯', bg: 'bg-rose-500/10' },
  { title: 'Macenza Handles Technology', desc: 'Our team manages the underlying product and technical delivery.', icon: '🛡️', bg: 'bg-amber-500/10' },
  { title: 'Grow Your Sales Network', desc: 'Expand your customer base and increase your earning opportunities over time.', icon: '🚀', bg: 'bg-teal-500/10' }
];

const whiteLabelBenefits = [
  { title: 'Your Brand', desc: 'Build your HRMS offering around your own company identity.', icon: Palette },
  { title: 'Your Customers', desc: 'Build and maintain direct relationships with your customers.', icon: UserCheck },
  { title: 'Your Revenue', desc: 'Create a revenue stream around your branded HRMS.', icon: TrendingUp },
  { title: 'No HRMS Development From Scratch', desc: "Use Macenza's existing HR technology instead of building an entire HRMS platform yourself.", icon: Rocket },
  { title: 'Technology Behind the Scenes', desc: 'Macenza handles the technology while you focus on your business.', icon: Server },
  { title: 'Grow With Your Customers', desc: 'Expand your branded HRMS business as your customer base grows.', icon: ShieldCheck }
];

const comparisonData = [
  { feature: 'Business Model', sales: 'Sales-focused business', whiteLabel: 'Branded HRMS business' },
  { feature: 'Customer Sees', sales: 'Macenza', whiteLabel: 'Your Brand' },
  { feature: 'Primary Focus', sales: 'Sales & customer acquisition', whiteLabel: 'Brand, sales & customer relationships' },
  { feature: 'Product', sales: 'Macenza products & services', whiteLabel: 'Your branded HRMS' },
  { feature: 'Technology', sales: 'Powered & delivered by Macenza', whiteLabel: 'Powered by Macenza behind the scenes' },
  { feature: 'Earnings', sales: 'Commission on successful sales', whiteLabel: 'Your own HRMS revenue / margin' },
  { feature: 'Best For', sales: 'Companies focused on sales and customer acquisition', whiteLabel: 'Companies wanting to launch their own branded HRMS' }
];

const Partnership = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      // Reveal animations
      gsap.utils.toArray('.reveal-up').forEach((elem) => {
        gsap.from(elem, {
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: elem,
            start: 'top 95%',
            toggleActions: 'play none none none'
          }
        });
      });
    }, pageRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  const handleScrollToWhiteLabel = () => {
    document.getElementById('whitelabel-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGoToContact = () => {
    navigate('/contact');
  };

  const partnershipSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Partnership Opportunities | Macenza",
    "url": "https://www.macenza.com/partnership",
    "description": "Partner with Macenza to co-build, scale, and deliver advanced AI and web application solutions."
  };

  return (
    <div ref={pageRef} className="bg-white text-black min-h-screen">
      <SEO
        title="Partnership Opportunities | Macenza"
        description="Partner with Macenza to co-build, scale, and deliver advanced AI and web application solutions."
        canonicalPath="/partnership"
        schema={partnershipSchema}
      />
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-start overflow-hidden pt-40 pb-20 bg-gradient-to-b from-white via-neutral-50/50 to-white">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-left">
            <div className="inline-block px-4 py-2 bg-primary/5 rounded-full text-primary font-bold text-xs uppercase tracking-widest mb-6 reveal-up">
              PARTNERSHIP
            </div>
            <h1 className="text-[2.31rem] sm:text-[3.68rem] md:text-[4.41rem] font-faculty font-normal tracking-normal text-black mb-8 reveal-up leading-[1.1]">
              <BouncyText text="Build Your Business " /> <br />
              <BouncyText text="With Macenza" className="text-primary italic" />
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-black/60 font-light reveal-up mb-10 leading-relaxed">
              Start your own sales business with Macenza or launch a fully branded HRMS under your company name. Choose the partnership model that fits your business and grow with Macenza technology behind you.
            </p>
            <div className="flex flex-wrap items-center gap-4 reveal-up">
              <button
                onClick={handleGoToContact}
                className="px-8 py-4 sm:px-10 sm:py-5 bg-primary text-white rounded-full font-bold text-base sm:text-lg glow-blue hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95"
              >
                Become a Partner <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleScrollToWhiteLabel}
                className="px-8 py-4 sm:px-10 sm:py-5 bg-black/5 text-black hover:bg-black/10 rounded-full font-bold text-base sm:text-lg transition-all duration-300 active:scale-95"
              >
                Explore White-Label HRMS
              </button>
            </div>
          </div>

          {/* Right Visual Element: Animated Partnership Ecosystem Flow */}
          <div className="lg:col-span-5 reveal-up">
            <div className="relative p-8 sm:p-10 rounded-[3rem] glass-morphism border border-black/10 shadow-2xl bg-white/70 backdrop-blur-xl">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-primary/80 mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Partnership Architecture
              </div>

              <div className="flex flex-col gap-6 relative">
                {/* Node 1 */}
                <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-md flex items-center gap-4 group hover:border-primary/40 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    01
                  </div>
                  <div>
                    <h4 className="font-bold text-black">YOUR BUSINESS</h4>
                    <p className="text-xs text-black/50">Market presence & client relationships</p>
                  </div>
                </div>

                {/* Flow Connector Line */}
                <div className="flex justify-center -my-3">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-primary via-primary/50 to-accent animate-pulse" />
                </div>

                {/* Node 2 */}
                <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-md flex items-center gap-4 group hover:border-primary/40 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                    02
                  </div>
                  <div>
                    <h4 className="font-bold text-black">YOUR CUSTOMERS</h4>
                    <p className="text-xs text-black/50">Software solutions & HR management</p>
                  </div>
                </div>

                {/* Flow Connector Line */}
                <div className="flex justify-center -my-3">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-accent via-accent/50 to-primary animate-pulse" />
                </div>

                {/* Node 3 */}
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 shadow-md flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">MACENZA TECHNOLOGY</h4>
                    <p className="text-xs text-black/60 font-medium">Core engine & cloud platform behind the scenes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERSHIP MODELS SECTION */}
      <Section id="partnership-models" title="Two Ways to Partner With Macenza" subtitle="Choose between a sales-focused partnership or launching your own branded HRMS business powered by Macenza.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* CARD 01 — SALES PARTNERSHIP */}
          <div className="p-8 sm:p-12 rounded-[3rem] bg-white border border-black/10 shadow-xl hover:border-primary/40 transition-all flex flex-col justify-between reveal-up group">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-3xl font-black text-primary/20 group-hover:text-primary transition-colors">01</span>
                <span className="px-4 py-1.5 bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider rounded-full">Sales Partner</span>
              </div>
              <h3 className="text-3xl font-bold text-black mb-3">Sales Partnership</h3>
              <p className="text-primary font-semibold text-lg mb-4">You Bring the Customers. We Power the Solution. You Earn.</p>
              <p className="text-black/60 font-light text-base leading-relaxed mb-8">
                Build your own sales-focused business and earn commission by bringing customers to Macenza's software and technology solutions. You focus on sales and customer acquisition while Macenza handles the technology and product delivery.
              </p>

              {/* Visual Flow */}
              <div className="p-6 rounded-2xl bg-black/5 mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-3">Visual Flow</p>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-black/70">
                  <span className="px-3 py-1.5 bg-white rounded-lg border border-black/5">Your Company</span>
                  <span>↓</span>
                  <span className="px-3 py-1.5 bg-white rounded-lg border border-black/5">Sales</span>
                  <span>↓</span>
                  <span className="px-3 py-1.5 bg-white rounded-lg border border-black/5">Customer</span>
                  <span>↓</span>
                  <span className="px-3 py-1.5 bg-white rounded-lg border border-black/5">Macenza Product</span>
                  <span>↓</span>
                  <span className="px-3 py-1.5 bg-primary text-white rounded-lg">Your Commission</span>
                </div>
              </div>

              {/* Roles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h5 className="font-bold text-black mb-3 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> You Focus On
                  </h5>
                  <ul className="text-sm text-black/60 space-y-2 font-light">
                    <li>• Finding potential customers</li>
                    <li>• Generating leads</li>
                    <li>• Presenting Macenza solutions</li>
                    <li>• Closing sales</li>
                    <li>• Building customer relationships</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-black mb-3 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Macenza Handles
                  </h5>
                  <ul className="text-sm text-black/60 space-y-2 font-light">
                    <li>• Product development</li>
                    <li>• Technology</li>
                    <li>• Product delivery</li>
                    <li>• Technical implementation</li>
                    <li>• Product maintenance</li>
                    <li>• Technical support</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-emerald-600 mb-6 bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Earn an agreed commission on every successful sale.
              </p>
              <button
                onClick={handleGoToContact}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                Become a Sales Partner
              </button>
            </div>
          </div>

          {/* CARD 02 — WHITE-LABEL HRMS */}
          <div className="p-8 sm:p-12 rounded-[3rem] bg-slate-900 text-white border border-slate-800 shadow-2xl hover:border-primary/60 transition-all flex flex-col justify-between reveal-up group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-3xl font-black text-white/20 group-hover:text-primary transition-colors">02</span>
                <span className="px-4 py-1.5 bg-primary/20 text-primary font-bold text-xs uppercase tracking-wider rounded-full">White-Label Model</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">White-Label HRMS</h3>
              <p className="text-primary font-semibold text-lg mb-4">Your Brand. Your HRMS. Our Technology.</p>
              <p className="text-white/70 font-light text-base leading-relaxed mb-8">
                Launch and sell a complete HRMS under your own company name and brand. Your customers experience your HRMS while Macenza works behind the scenes as your technology partner.
              </p>

              {/* Visual Flow */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-3">Visual Flow</p>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-white/90">
                  <span className="px-3 py-1.5 bg-white/10 rounded-lg">YOUR COMPANY</span>
                  <span>↓</span>
                  <span className="px-3 py-1.5 bg-white/10 rounded-lg">YOUR BRAND</span>
                  <span>↓</span>
                  <span className="px-3 py-1.5 bg-white/10 rounded-lg">YOUR HRMS</span>
                  <span>↓</span>
                  <span className="px-3 py-1.5 bg-white/10 rounded-lg">YOUR CUSTOMERS</span>
                  <span>↓</span>
                  <span className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg">YOUR REVENUE</span>
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-sm text-white/80 font-light">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" /> Your Company Brand
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" /> Your Customer Ownership
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" /> Your Revenue Model
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0" /> Macenza Tech Behind the Scenes
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-primary/90 mb-6 bg-primary/10 p-3 rounded-xl border border-primary/20 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Macenza operates behind the scenes as your technology partner.
              </p>
              <button
                onClick={handleGoToContact}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-base hover:bg-primary-dark transition-all duration-300 shadow-xl shadow-primary/30 active:scale-[0.98]"
              >
                Explore White-Label HRMS
              </button>
            </div>
          </div>

        </div>
      </Section>

      {/* SALES PARTNERSHIP PROCESS */}
      <Section id="sales-partnership-details" title="Sell. Connect. Earn." subtitle="Start your own sales-focused business and use Macenza's products and services to create new revenue opportunities.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            { step: 'STEP 01', title: 'Build Your Sales Business', desc: 'Set up your company, sales agency or consultancy and start building your customer network.', icon: Users },
            { step: 'STEP 02', title: 'Find & Convert Customers', desc: "Identify businesses that need Macenza's software, SaaS, AI and technology solutions and help them choose the right solution.", icon: Briefcase },
            { step: 'STEP 03', title: 'Earn Commission', desc: 'When a successful sale is completed, you earn your agreed commission.', icon: TrendingUp }
          ].map((item, i) => (
            <div key={i} className="p-8 sm:p-10 rounded-[2.5rem] bg-white border border-black/10 shadow-lg reveal-up hover:border-primary/40 transition-all flex flex-col justify-between group relative">
              <div>
                <span className="text-xs font-black tracking-widest text-primary uppercase mb-4 block">{item.step}</span>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-bold text-black mb-3">{item.title}</h4>
                <p className="text-black/60 font-light text-base leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* SALES PARTNER BENEFITS */}
      <Section id="sales-partner-benefits" title="Why Become a Sales Partner?" subtitle="Focus on selling and growing your customer network while Macenza takes care of the technology.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {salesBenefits.map((item, i) => (
            <div key={i} className="p-8 sm:p-10 rounded-[2.5rem] bg-white border border-black/5 shadow-sm reveal-up hover:border-primary/40 transition-colors duration-300 flex gap-6 items-start group">
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110 ${item.bg}`}>
                {item.icon}
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-black">{item.title}</h4>
                <p className="text-black/50 font-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* WHITE-LABEL HRMS SECTION & DIAGRAM */}
      <section id="whitelabel-section" className="py-24 px-6 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mb-16 reveal-up">
            <div className="inline-block px-4 py-2 bg-primary/20 text-primary font-bold text-xs uppercase tracking-widest mb-4 rounded-full">
              WHITE-LABEL HRMS
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Your Brand. Your HRMS. <br />
              <span className="text-primary italic">Our Technology.</span>
            </h2>
            <p className="text-lg md:text-xl text-white/70 font-light leading-relaxed mb-4">
              Launch and sell a complete HRMS under your own company name and brand. Your customers experience your HRMS while Macenza works behind the scenes as your technology partner.
            </p>
            <p className="text-sm font-semibold text-primary/90">
              You build the brand and customer relationships. Macenza powers the technology.
            </p>
          </div>

          {/* Animated Diagram */}
          <div className="p-10 md:p-16 rounded-[3rem] bg-slate-900/80 border border-slate-800 shadow-2xl reveal-up mb-20 relative overflow-hidden backdrop-blur-xl">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Launch Your Own HRMS Business</h3>
              <p className="text-white/60 text-sm font-light max-w-2xl mx-auto">
                Offer a professional HRMS to your customers without building the entire technology platform from scratch. Your company becomes the customer-facing brand while Macenza provides the technology behind the platform.
              </p>
            </div>

            {/* Architecture Diagram Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center text-center relative z-10">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
                <Building2 className="w-10 h-10 text-primary mb-3" />
                <h4 className="font-bold text-white text-sm">YOUR COMPANY</h4>
                <p className="text-xs text-white/50 mt-1">Brand & Sales</p>
              </div>

              <div className="hidden md:flex justify-center text-primary animate-pulse">
                <ArrowRight className="w-6 h-6" />
              </div>

              <div className="p-6 rounded-2xl bg-primary/20 border border-primary/40 flex flex-col items-center">
                <Palette className="w-10 h-10 text-primary mb-3" />
                <h4 className="font-bold text-white text-sm">YOUR BRAND & HRMS</h4>
                <p className="text-xs text-white/70 mt-1">Customer Experience</p>
              </div>

              <div className="hidden md:flex justify-center text-primary animate-pulse">
                <ArrowRight className="w-6 h-6" />
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center md:col-span-1 col-span-1">
                <Users className="w-10 h-10 text-emerald-400 mb-3" />
                <h4 className="font-bold text-white text-sm">YOUR CUSTOMERS</h4>
                <p className="text-xs text-white/50 mt-1">Direct Relationships</p>
              </div>
            </div>

            {/* Subtly displayed Macenza footer node */}
            <div className="mt-12 pt-8 border-t border-white/10 flex justify-center items-center gap-3 text-xs text-white/40 font-medium">
              <Server className="w-4 h-4 text-primary/60" />
              <span>Macenza operates behind the scenes as your technology partner.</span>
            </div>
          </div>

          {/* WHITE-LABEL BUSINESS SECTION - TWO COLUMNS */}
          <div className="mb-12 reveal-up">
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">Your Business. Your Brand. Your Customers.</h3>
            <p className="text-white/60 text-base font-light">With the white-label HRMS model, you can build your own HR technology offering around your company and brand.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 reveal-up">
            {/* YOUR BUSINESS COLUMN */}
            <div className="p-8 sm:p-12 rounded-[2.5rem] bg-slate-900 border border-slate-800">
              <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <UserCheck className="w-7 h-7 text-primary" /> Your Business
              </h4>
              <ul className="space-y-4 text-sm text-white/70 font-light">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary shrink-0" /> Your company name</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary shrink-0" /> Your brand</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary shrink-0" /> Your logo</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary shrink-0" /> Your customer relationships</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary shrink-0" /> Your sales</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-primary shrink-0" /> Your pricing and business model</li>
              </ul>
            </div>

            {/* MACENZA COLUMN */}
            <div className="p-8 sm:p-12 rounded-[2.5rem] bg-slate-900 border border-slate-800">
              <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Server className="w-7 h-7 text-emerald-400" /> Powered by Macenza
              </h4>
              <ul className="space-y-4 text-sm text-white/70 font-light">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> HRMS technology</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Software development</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Platform infrastructure</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Product updates</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Maintenance</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Technical support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WHITE-LABEL BRANDING SECTION */}
      <Section id="whitelabel-branding" title="Make HRMS Your Own" subtitle="Give your customers an HRMS experience built around your own company identity.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'Your Brand', desc: "Present the HRMS using your company's brand identity.", icon: '🎨' },
            { title: 'Your Company Name', desc: "Sell the HRMS as your own branded business solution.", icon: '✨' },
            { title: 'Your Customer Relationship', desc: "You remain the customer-facing business and manage your client relationships.", icon: '🌐' },
            { title: 'Your Revenue Model', desc: "Create your own commercial model and earn from the customers you bring to your branded HRMS.", icon: '👥' }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-black/10 shadow-md reveal-up hover:border-primary/40 transition-all">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h4 className="text-xl font-bold text-black mb-2">{item.title}</h4>
              <p className="text-black/60 font-light text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* WHITE-LABEL BUSINESS MODEL */}
      <Section id="whitelabel-model" title="Build Your Own HRMS Revenue Stream" subtitle="Turn HR technology into a new business opportunity under your own brand while Macenza handles the technology behind the scenes.">
        <div className="p-8 sm:p-12 rounded-[3rem] bg-slate-900 text-white reveal-up mb-12">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold">
            <span className="px-5 py-3 bg-white/10 rounded-xl">YOUR COMPANY</span>
            <span className="text-primary text-xl">↓</span>
            <span className="px-5 py-3 bg-white/10 rounded-xl">YOUR BRAND</span>
            <span className="text-primary text-xl">↓</span>
            <span className="px-5 py-3 bg-white/10 rounded-xl">YOUR HRMS</span>
            <span className="text-primary text-xl">↓</span>
            <span className="px-5 py-3 bg-white/10 rounded-xl">YOUR CUSTOMERS</span>
            <span className="text-primary text-xl">↓</span>
            <span className="px-5 py-3 bg-emerald-500 text-white rounded-xl">YOUR REVENUE</span>
          </div>
          <p className="text-center text-xs text-white/50 mt-8">Powered by Macenza technology behind the scenes.</p>
        </div>
      </Section>

      {/* WHITE-LABEL BENEFITS */}
      <Section id="whitelabel-benefits" title="Why White-Label With Macenza?" subtitle="Launch your branded HRMS business effortlessly.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {whiteLabelBenefits.map((item, i) => (
            <div key={i} className="p-8 sm:p-10 rounded-[2.5rem] bg-white border border-black/5 shadow-sm reveal-up hover:border-primary/40 transition-colors duration-300 flex gap-6 items-start group">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2 text-black">{item.title}</h4>
                <p className="text-black/50 font-light text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* WHITE-LABEL HRMS MODULES */}
      <Section id="hrms-modules" title="A Complete HRMS Under Your Brand" subtitle="Explore the battle-tested modules available in our HRMS suite.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {hrmsModules.map((item, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-black/10 shadow-sm reveal-up hover:border-primary/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="text-xl font-bold text-black mb-2">{item.name}</h4>
              <p className="text-black/60 font-light text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* COMPARISON SECTION */}
      <Section id="partnership-comparison" title="Which Partnership Is Right for You?" subtitle="Choose the model based on how you want to build your business.">
        <div className="overflow-x-auto reveal-up">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-black/10">
                <th className="py-6 px-6 text-sm font-black uppercase text-black/40">Feature</th>
                <th className="py-6 px-6 text-lg font-bold text-primary">Sales Partnership</th>
                <th className="py-6 px-6 text-lg font-bold text-slate-900">White-Label HRMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm font-light text-black/80">
              {comparisonData.map((row, i) => (
                <tr key={i} className="hover:bg-black/[0.02] transition-colors">
                  <td className="py-5 px-6 font-bold text-black">{row.feature}</td>
                  <td className="py-5 px-6">{row.sales}</td>
                  <td className="py-5 px-6 font-medium text-black">{row.whiteLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* RESPONSIBILITIES SECTION */}
      <Section id="responsibilities" title="Simple Partnership. Clear Responsibilities." subtitle="We believe in total operational clarity and mutual trust.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 reveal-up">
          
          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-white border border-black/10 shadow-lg">
            <h4 className="text-2xl font-bold text-black mb-6 text-primary">Sales Partnership</h4>
            <div className="space-y-6">
              <div>
                <h5 className="font-bold text-black text-sm uppercase tracking-wider mb-2">Sales Partner</h5>
                <p className="text-black/60 text-sm font-light">You focus on finding customers, generating leads, presenting solutions and closing sales.</p>
              </div>
              <div>
                <h5 className="font-bold text-black text-sm uppercase tracking-wider mb-2">Macenza</h5>
                <p className="text-black/60 text-sm font-light">Macenza provides the products, technology and technical delivery.</p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12 rounded-[2.5rem] bg-slate-900 text-white border border-slate-800 shadow-xl">
            <h4 className="text-2xl font-bold text-white mb-6 text-primary">White-Label HRMS</h4>
            <div className="space-y-6">
              <div>
                <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Your Company</h5>
                <p className="text-white/70 text-sm font-light">You manage the brand, sales, customers, pricing and business relationship.</p>
              </div>
              <div>
                <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Macenza</h5>
                <p className="text-white/70 text-sm font-light">Macenza provides and maintains the HRMS technology behind your branded platform.</p>
              </div>
            </div>
          </div>

        </div>
      </Section>

      {/* FINAL CTA */}
      <Section id="final-cta" className="text-center">
        <div className="max-w-5xl mx-auto p-12 sm:p-20 rounded-[4rem] bg-primary text-white relative overflow-hidden reveal-up">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none"></div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight font-turret">
            Ready to Build Your Business With Macenza?
          </h2>
          <p className="text-xl sm:text-2xl text-white/80 font-light mb-10 max-w-3xl mx-auto leading-relaxed">
            Whether you want to build a sales-focused business or launch your own branded HRMS, Macenza gives you the technology to support your growth.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={handleGoToContact}
              className="px-8 py-4 sm:px-12 sm:py-5 bg-white text-primary rounded-full font-bold text-base sm:text-lg hover:bg-black hover:text-white transition-all duration-300 shadow-2xl"
            >
              Become a Sales Partner
            </button>
            <button
              onClick={handleGoToContact}
              className="px-8 py-4 sm:px-12 sm:py-5 bg-black/20 text-white rounded-full font-bold text-base sm:text-lg hover:bg-black transition-all duration-300"
            >
              Launch White-Label HRMS
            </button>
          </div>
        </div>
      </Section>

      <Footer />
    </div>
  );
};

export default Partnership;
