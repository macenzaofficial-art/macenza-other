import AdminClientWrapper from '@/components/admin/AdminClientWrapper';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Macenza Admin Portal',
  alternates: {
    canonical: 'https://www.macenza.com/admin',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AdminClientWrapper />;
}
