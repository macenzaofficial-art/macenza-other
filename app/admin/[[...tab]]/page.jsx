import Admin from '@/components/pages/Admin';

export const metadata = {
  title: 'Admin Dashboard | Macenza',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <Admin />;
}
