import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SmoothScroll from './components/SmoothScroll';
import Navbar from './components/Navbar';
import Home from './pages/Home';

// Lazy load all pages
const About = lazy(() => import('./pages/About'));
const Solutions = lazy(() => import('./pages/Solutions'));
const Technology = lazy(() => import('./pages/Technology'));
const Careers = lazy(() => import('./pages/Careers'));
const Contact = lazy(() => import('./pages/Contact'));
const Policy = lazy(() => import('./pages/Policy'));
const Terms = lazy(() => import('./pages/Terms'));
const Admin = lazy(() => import('./pages/Admin'));
const CertificateVerification = lazy(() => import('./pages/CertificateVerification'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const Partnership = lazy(() => import('./pages/Partnership'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Prefetch only lightweight informational pages during browser idle
    const preloadPages = () => {
      import('./pages/About').catch(() => { });
      import('./pages/Solutions').catch(() => { });
      import('./pages/Technology').catch(() => { });
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(preloadPages, { timeout: 4000 });
    }
  }, []);

  return (
    <div className="relative">
      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar theme="colored" />
      {!isAdmin && <SmoothScroll />}
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
        <Route path="/solutions" element={<Suspense fallback={<PageLoader />}><Solutions /></Suspense>} />
        <Route path="/technology" element={<Suspense fallback={<PageLoader />}><Technology /></Suspense>} />
        <Route path="/careers" element={<Suspense fallback={<PageLoader />}><Careers /></Suspense>} />
        <Route path="/careers/:id" element={<Suspense fallback={<PageLoader />}><JobDetails /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
        <Route path="/privacy" element={<Suspense fallback={<PageLoader />}><Policy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={<PageLoader />}><Terms /></Suspense>} />
        <Route path="/cookie-policy" element={<Suspense fallback={<PageLoader />}><CookiePolicy /></Suspense>} />
        <Route path="/partnership" element={<Suspense fallback={<PageLoader />}><Partnership /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<PageLoader />}><Admin /></Suspense>} />
        <Route path="/admin/:tab" element={<Suspense fallback={<PageLoader />}><Admin /></Suspense>} />
        <Route path="/certificateverification" element={<Suspense fallback={<PageLoader />}><CertificateVerification /></Suspense>} />
        <Route path="/blog" element={<Suspense fallback={<PageLoader />}><Blog /></Suspense>} />
        <Route path="/blog/:slug" element={<Suspense fallback={<PageLoader />}><BlogPost /></Suspense>} />
      </Routes>
    </div>
  );
}

export default App;
