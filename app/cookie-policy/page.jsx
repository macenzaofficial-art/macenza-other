import CookiePolicy from '@/components/pages/CookiePolicy';

export const metadata = {
  title: 'Cookie Policy',
  description: "Read Macenza's Cookie Policy to understand how cookies and similar technologies are used on macenza.com.",
  alternates: {
    canonical: 'https://www.macenza.com/cookie-policy',
  },
};

export default function Page() {
  return <CookiePolicy />;
}
