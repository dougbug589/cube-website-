import type { Metadata } from 'next';
import { Inter, Manrope, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import PublicShellWrapper from '@/components/layout/PublicShellWrapper';
import LegacyCacheCleanup from '@/components/common/LegacyCacheCleanup';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cubeiitm.org'),
  title: 'CUBE | Centre for Urbanization, Buildings & Environment (IIT Madras & Govt of TN)',
  description: 'Centre of Excellence established jointly by the Government of Tamil Nadu and IIT Madras. Leading applied research, engineering consultancy, third-party quality assurance, environmental testing (CEL), and sustainable urban mobility.',
  keywords: [
    'CUBE IIT Madras',
    'Centre for Urbanization Buildings and Environment',
    'Government of Tamil Nadu Centre of Excellence',
    'Structural Engineering Consultancy',
    'Third Party Quality Assurance TPQA',
    'CUBE Environmental Laboratory CEL',
    'Urban Planning Chennai',
    'Precast Housing Engineering'
  ],
  authors: [{ name: 'CUBE IIT Madras' }],
  openGraph: {
    title: 'CUBE - Centre for Urbanization, Buildings & Environment',
    description: 'Centre of Excellence of the Government of Tamil Nadu and IIT Madras for applied engineering, sustainable infrastructure, and smart urbanization.',
    url: 'https://cubeiitm.org',
    siteName: 'CUBE Digital Experience 2.0',
    images: [
      {
        url: '/images/branding/cube-live-logo.png',
        width: 300,
        height: 60,
        alt: 'Official CUBE Emblem - IIT Madras & Govt of Tamil Nadu',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/images/branding/cube-live-logo.png',
    apple: '/images/branding/cube-live-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${cormorant.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#24272B] antialiased">
        <LegacyCacheCleanup />
        <PublicShellWrapper>{children}</PublicShellWrapper>
      </body>
    </html>
  );
}
