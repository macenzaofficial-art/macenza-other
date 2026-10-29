'use client';

import dynamic from 'next/dynamic';

const Admin = dynamic(() => import('@/components/pages/Admin'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-medium">Loading Admin Dashboard...</p>
      </div>
    </div>
  ),
});

export default function AdminClientWrapper() {
  return <Admin />;
}
