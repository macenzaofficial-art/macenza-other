import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  // Automatically close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Solutions", path: "/solutions" },
    { name: "Technology", path: "/technology" },
    { name: "Careers", path: "/careers" },
    { name: "Blog", path: "/blog" },
    { name: "Contact", path: "/contact" }
  ];

  const isActive = (item) => {
    return currentPath === item.path;
  };

  return (
    <>
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[92%] h-[64px] sm:h-[78px] glass-morphism rounded-full px-4 sm:px-8 flex items-center justify-between z-[9999] pointer-events-auto shadow-xl">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Macenza Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl glow-blue bg-white p-1" />
            <span className="text-xl sm:text-2xl font-bold tracking-tighter text-black">MACENZA</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                isActive(item) 
                  ? "text-primary font-bold" 
                  : "text-black/70 hover:text-primary"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Get Started Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <Link to="/contact" className="hidden md:block px-6 py-3 bg-primary text-white rounded-full font-bold text-sm glow-blue hover:bg-primary-dark transition-all duration-300 active:scale-95 text-center">
            Get Started
          </Link>
          <button 
            className="lg:hidden p-2 text-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-black transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 w-full bg-black transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 w-full bg-black transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer (Sibling to prevent nested backdrop-filter rendering bug) */}
      {isMobileMenuOpen && (
        <div className="fixed top-[114px] left-1/2 -translate-x-1/2 w-[92%] glass-morphism rounded-3xl p-6 flex flex-col gap-4 lg:hidden pointer-events-auto z-[9998] animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`text-lg font-bold transition-colors ${
                isActive(item) 
                  ? "text-primary" 
                  : "text-black/80 hover:text-primary"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link 
            to="/contact" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold glow-blue mt-2 text-center"
          >
            Get Started
          </Link>
        </div>
      )}
    </>
  );
};

export default Navbar;
