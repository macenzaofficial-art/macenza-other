import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SmoothScroll = () => {
  const { pathname } = useLocation();
  const lenisRef = useRef(null);

  // Synchronous, immediate scroll restoration on pathname change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  useEffect(() => {
    // Disable smooth scroll on mobile devices for better performance
    if (window.innerWidth < 768 || ('ontouchstart' in window)) {
      // Still need scroll handler for navbar hiding
      let lastScrollY = window.scrollY;
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const navs = document.querySelectorAll('nav.fixed');
        if (currentScrollY > 50) navs.forEach(nav => nav.classList.add('nav-transition'));
        else navs.forEach(nav => nav.classList.remove('nav-transition'));
        if (currentScrollY > lastScrollY && currentScrollY > 100) navs.forEach(nav => nav.classList.add('nav-hidden'));
        else if (currentScrollY < lastScrollY) navs.forEach(nav => nav.classList.remove('nav-hidden'));
        if (currentScrollY <= 10) navs.forEach(nav => nav.classList.remove('nav-hidden'));
        lastScrollY = currentScrollY;
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // Register ScrollTrigger plugin for desktop
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Synchronize ScrollTrigger with Lenis updates
    lenis.on('scroll', ScrollTrigger.update);

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const navs = document.querySelectorAll('nav.fixed');
      
      // Enable CSS transition only after initial scroll to avoid entry animation conflicts
      if (currentScrollY > 50) {
        navs.forEach(nav => nav.classList.add('nav-transition'));
      } else {
        navs.forEach(nav => nav.classList.remove('nav-transition'));
      }
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navs.forEach(nav => nav.classList.add('nav-hidden'));
      } else if (currentScrollY < lastScrollY) {
        navs.forEach(nav => nav.classList.remove('nav-hidden'));
      }
      
      // Always show at the very top
      if (currentScrollY <= 10) {
        navs.forEach(nav => nav.classList.remove('nav-hidden'));
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Drive Lenis updates using GSAP's ticker for perfectly synchronized frame timing
    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(updateTicker);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
};

export default SmoothScroll;
