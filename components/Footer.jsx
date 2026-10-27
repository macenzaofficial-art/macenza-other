import React, { useState } from 'react';
import { Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackgroundBeamsWithCollision } from './ui/background-beams-with-collision';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const socials = [
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
      href: "https://instagram.com/macenza.ai",
      label: "Instagram"
    },
    {
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
      href: "https://in.linkedin.com/company/macenza",
      label: "LinkedIn"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      href: "mailto:info@macenza.com",
      label: "Email"
    }
  ];

  return (
    <footer className="border-t border-black/5 bg-white relative overflow-hidden">
      <BackgroundBeamsWithCollision className="py-16 md:py-24 h-auto md:h-auto flex flex-col justify-center bg-gradient-to-b from-white to-neutral-50 relative">
        {/* Giant Background "MACENZA" Letters */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-[14vw] md:text-[17vw] lg:text-[19vw] font-black tracking-[-0.04em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-primary/50 via-primary/10 to-primary/[0.02] leading-none whitespace-nowrap select-none">
            MACENZA
          </span>
        </div>

        <div className="container mx-auto px-6 relative z-10 w-full">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

            {/* Column 1: Brand Info */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Macenza Logo" className="w-10 h-10 object-contain rounded-xl glow-blue bg-white p-1" />
                <span className="text-2xl font-black tracking-tighter text-black">MACENZA</span>
              </div>
              <p className="text-sm text-black/60 leading-relaxed max-w-sm">
                Empowering businesses through cutting-edge AI integration, high-performance web applications, and custom digital transformation solutions.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3 mt-2">
                {socials.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target={social.href.startsWith('mailto:') ? undefined : "_blank"}
                    rel={social.href.startsWith('mailto:') ? undefined : "noopener noreferrer"}
                    className="p-3 bg-black/5 rounded-full text-black/60 hover:bg-primary hover:text-white hover:scale-110 transition-all duration-300 shadow-sm flex items-center justify-center"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Our Services */}
            <div className="flex flex-col gap-5">
              <h4 className="font-bold text-black text-lg tracking-tight">Our Services</h4>
              <div className="flex flex-col gap-3 text-sm text-black/60">
                <span className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group">
                  Website Development
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-300"></span>
                </span>
                <span className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group">
                  Web Application Development
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-300"></span>
                </span>
                <a
                  href="https://www.hrenso.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1.5 group"
                >
                  Custom HRMS Software
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
                <span className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 group">
                  AI Integration & Solutions
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-300"></span>
                </span>
              </div>
            </div>

            {/* Column 3: Quick Links */}
            <div className="flex flex-col gap-5">
              <h4 className="font-bold text-black text-lg tracking-tight">Company</h4>
              <div className="flex flex-col gap-3 text-sm text-black/60">
                <Link to="/about" className="hover:text-primary hover:translate-x-1 transition-all duration-200">About Us</Link>
                <Link to="/technology" className="hover:text-primary hover:translate-x-1 transition-all duration-200">Technology</Link>
                <Link to="/partnership" className="hover:text-primary hover:translate-x-1 transition-all duration-200">Partnership</Link>
                <Link to="/careers" className="hover:text-primary hover:translate-x-1 transition-all duration-200">Careers</Link>
                <Link to="/contact" className="hover:text-primary hover:translate-x-1 transition-all duration-200">Contact Us</Link>
              </div>
            </div>

            {/* Column 4: Newsletter Widget */}
            <div className="flex flex-col gap-5">
              <h4 className="font-bold text-black text-lg tracking-tight">Newsletter</h4>
              <p className="text-sm text-black/60 leading-relaxed">
                Stay updated with the latest AI trends and product releases from Macenza.
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full mt-1">
                <div className="relative flex-grow">
                  <input
                    type="email"
                    placeholder={subscribed ? "Subscribed!" : "Enter your email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={subscribed}
                    required
                    className={`w-full px-4 py-2.5 bg-black/5 border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 ${subscribed ? "bg-green-50/50 text-green-700 border-green-200" : ""
                      }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={subscribed}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center shrink-0 ${subscribed
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20"
                    }`}
                  aria-label="Subscribe to newsletter"
                >
                  {subscribed ? (
                    <svg className="w-5 h-5 animate-in zoom-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Footer Divider */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-black/10 to-transparent mb-8" />

          {/* Bottom Footer Row */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full text-sm">
            <div className="text-black/40">
              <span>© 2025 Macenza AI. All rights reserved.</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-black/50">
              <Link to="/certificateverification" className="hover:text-primary transition-colors">Verify Certificate</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </BackgroundBeamsWithCollision>
    </footer>
  );
};

export default Footer;
