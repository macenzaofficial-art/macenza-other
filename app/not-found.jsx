import React from 'react';
import Link from 'next/link';
import { Home, BookOpen, Compass, ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata = {
  title: '404 - Page Not Found',
  description: 'The requested page could not be found.',
};

export default function NotFound() {
  return (
    <div
      style={{ colorScheme: 'light' }}
      className="min-h-screen bg-white text-black flex flex-col justify-between pt-32 sm:pt-40"
    >
      <main className="container mx-auto px-6 max-w-2xl my-auto py-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-primary text-xs sm:text-sm font-semibold mb-6">
          <Compass className="w-4 h-4" />
          <span>Error 404 · Page Not Found</span>
        </div>

        {/* Large 404 Numeral */}
        <div className="font-extrabold text-7xl sm:text-9xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary-dark/80 mb-4 select-none">
          404
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight mb-4">
          Lost in the Digital Landscape?
        </h1>

        {/* Description */}
        <p className="text-black/60 text-base sm:text-lg font-light leading-relaxed mb-10 max-w-lg mx-auto">
          The page you are looking for doesn't exist, may have been relocated, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white font-bold text-sm rounded-full shadow-lg shadow-primary/25 hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            href="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#EFF6FF] text-primary border border-[#BFDBFE] font-bold text-sm rounded-full hover:bg-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <BookOpen className="w-4 h-4" />
            Explore Blog
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
