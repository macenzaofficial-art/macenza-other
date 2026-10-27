import About from '@/components/pages/About';

export const metadata = {
  title: 'About Us | Macenza',
  description: 'Learn about Macenza, an AI software development company dedicated to building cutting-edge web applications, custom HRMS software, and AI integration solutions.',
  alternates: {
    canonical: 'https://www.macenza.com/about',
  },
};

export default function Page() {
  return <About />;
}
