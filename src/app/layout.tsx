import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import PublicShellWrapper from '@/components/layout/PublicShellWrapper';
import LegacyCacheCleanup from '@/components/common/LegacyCacheCleanup';
import { SPLASH_BOOT_SCRIPT } from '@/lib/splash';

// One family site-wide: Plus Jakarta Sans. Soft curves and open forms, but
// formal enough for an institutional site; bold display, 500-weight body.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cubeiitm.org'),
  title: 'CUBE | Centre for Urbanization, Buildings & Environment (IIT Madras & Govt of TN)',
  description: 'Centre for Urbanization, Buildings & Environment (CUBE) has been raised by IIT Madras and Government of Tamil Nadu as an Applied Research, Technology and Consultancy Centre.',
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
    description: 'Established in May 2017 as a Centre of Excellence of Government of Tamil Nadu in collaboration with IIT Madras, CUBE is an Applied Research, Technology and Consultancy Centre with its own Environment Laboratory (CEL).',
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
    <html lang="en" className={`${jakarta.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#0B0D0E] text-[#F3F5F6] antialiased">
        {/* decides splash vs no-splash before first paint (no flash on return visits) */}
        <script dangerouslySetInnerHTML={{ __html: SPLASH_BOOT_SCRIPT }} />
        <LegacyCacheCleanup />
        <PublicShellWrapper>{children}</PublicShellWrapper>
      </body>
    </html>
  );
}
