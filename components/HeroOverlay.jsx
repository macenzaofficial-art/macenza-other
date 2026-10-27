import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Users, Rocket, Globe, Shield, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import BouncyText from './BouncyText';

const HeroOverlay = () => {
  const overlayRef = useRef(null);
  const leftContentRef = useRef(null);
  const rightStatsRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entry animations
      const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.5 } });

      tl.fromTo(".hero-line-1",
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1 },
        0.4
      );

      tl.fromTo(".hero-line-2",
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1 },
        0.6
      );

      tl.fromTo(".hero-btns",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1 },
        1.0
      );

      tl.fromTo(rightStatsRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2 },
        1.2
      );

      tl.fromTo(scrollIndicatorRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2 },
        1.4
      );
    }, overlayRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: <Users className="w-5 h-5 text-accent" />, title: "28", subtitle: "Software Engineers" },
    { icon: <Rocket className="w-5 h-5 text-accent" />, title: "100%", subtitle: "Code Ownership" },
    { icon: <Globe className="w-5 h-5 text-accent" />, title: "AWS Cloud", subtitle: "Hosting Infrastructure" },
    { icon: <Shield className="w-5 h-5 text-accent" />, title: "99.9%", subtitle: "Uptime SLA" },
  ];

  return (
    <div ref={overlayRef} className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-8 md:p-12 overflow-hidden">
      {/* Hero Content (Left) & Stats (Right) */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 sm:gap-12 mt-12 sm:mt-16 md:mt-20">

        {/* Left Hero Content */}
        <div ref={leftContentRef} className="max-w-[600px] pointer-events-auto w-full">
          <div className="overflow-hidden pt-2 sm:pt-4 mb-1 sm:mb-2">
            <h1 className="hero-line-1 text-[1.85rem] min-[360px]:text-[2.1rem] sm:text-[2.6rem] md:text-[3.3rem] font-faculty font-normal text-black tracking-normal leading-[1.15] sm:leading-[1.2] pb-1 sm:pb-2">
              <BouncyText text="Custom Web Apps" />
            </h1>
          </div>
          <div className="overflow-hidden pt-1 sm:pt-2 mb-6 sm:mb-8 md:mb-10">
            <h1 className="hero-line-2 text-[1.85rem] min-[360px]:text-[2.1rem] sm:text-[2.6rem] md:text-[3.3rem] font-faculty font-normal text-primary tracking-normal leading-[1.15] sm:leading-[1.2] pb-1 sm:pb-2">
              <BouncyText text="Development" />
            </h1>
          </div>
          <div className="hero-btns flex flex-wrap gap-3 sm:gap-4">
            <Link to="/contact" className="px-6 py-3.5 sm:px-8 sm:py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 glow-blue hover:bg-primary-dark transition-all duration-300 text-sm sm:text-base min-h-[48px]">
              Contact Us <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>

        {/* Right Floating Stats */}
        <div ref={rightStatsRef} className="hidden lg:flex flex-col gap-6 pointer-events-auto">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="stat-card w-64 glass-morphism rounded-[28px] p-6 flex items-center gap-4 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.35)] hover:border-primary/40 cursor-default group border border-black/5"
            >
              <div className="p-3 bg-black/5 rounded-2xl transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:scale-110">
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-black text-black tracking-tight">{stat.title}</div>
                <div className="text-xs font-medium text-black/50 uppercase tracking-wider">{stat.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Area */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-end gap-4 md:gap-8 mt-auto w-full">

        {/* Scroll Indicator */}
        <div
          ref={scrollIndicatorRef}
          className="hidden sm:flex items-center gap-4 pointer-events-auto"
        >
          <span className="text-sm font-bold text-dark/40 uppercase tracking-widest hidden md:block">
            Scroll to Explore
          </span>
          <button className="w-16 h-16 glass-morphism rounded-2xl flex items-center justify-center hover:bg-white/40 transition-all duration-300 group">
            <ChevronDown className="w-6 h-6 text-dark group-hover:translate-y-1 transition-transform animate-bounce" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroOverlay;
