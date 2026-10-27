import AdminClientWrapper from '@/components/admin/AdminClientWrapper';

export const metadata = {
  title: 'Admin Dashboard | Macenza',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <AdminClientWrapper />;
}
