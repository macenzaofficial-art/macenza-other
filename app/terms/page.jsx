import Terms from '@/components/pages/Terms';

export const metadata = {
  title: 'Terms & Conditions | Macenza',
  description: "Read Macenza's Terms & Conditions governing access to and use of our website, software, and services.",
  alternates: {
    canonical: 'https://www.macenza.com/terms',
  },
};

export default function Page() {
  return <Terms />;
}
