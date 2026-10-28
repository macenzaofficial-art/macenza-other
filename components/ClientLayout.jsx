'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SmoothScroll from './SmoothScroll';
import Navbar from './Navbar';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <div className="relative">
      {!isAdmin && (
        <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar theme="colored" />
      )}
      {!isAdmin && <SmoothScroll />}
      {!isAdmin && <Navbar />}
      {children}
    </div>
  );
}
