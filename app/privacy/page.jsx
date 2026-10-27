import Policy from '@/components/pages/Policy';

export const metadata = {
  title: 'Privacy Policy | Macenza',
  description: "Read Macenza's Privacy Policy to understand how we collect, use, store, and protect your data.",
  alternates: {
    canonical: 'https://www.macenza.com/privacy',
  },
};

export default function Page() {
  return <Policy />;
}
