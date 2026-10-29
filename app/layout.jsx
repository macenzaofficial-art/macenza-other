import { Outfit, Syne, Playfair_Display, Pinyon_Script, IBM_Plex_Serif } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pinyon',
  display: 'swap',
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://www.macenza.com'),
  title: {
    default: 'Macenza | AI Software Development Company',
    template: '%s | Macenza',
  },
  description: 'Macenza delivers AI software solutions, automation systems, and custom digital products.',
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'Macenza',
    images: [{ url: '/hero-robot.webp' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${syne.variable} ${playfair.variable} ${pinyonScript.variable} ${ibmPlexSerif.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Faculty+Glyphic&family=Turret+Road:wght@200;300;400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
