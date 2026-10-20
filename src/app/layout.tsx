import type { Metadata, Viewport } from "next";
import './globals.css';
import './brand.css';

import { Providers } from '../components/Providers';
import NavigationApp from '../components/NavigationApp';
import Footer from '../components/Footer';
import { ToastProvider } from '../contexts/ToastContext';

import { Press_Start_2P, Jua } from 'next/font/google';

const brandFont = Jua({ weight: '400', subsets: ['latin'], variable: '--font-brand', display: 'swap' });

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
});

export const metadata: Metadata = {
  icons: { icon: '/brand/symbol-final-light.svg', apple: '/brand/symbol-final-light.svg' },
  title: "겜자취 | 게임 위키와 나만의 다락",
  description: "게임·플랫폼·제작사의 정보를 함께 기록하고, 좋아하는 게임을 내 다락에 모으는 게임 위키·아카이브.",
  keywords: "레트로, 게임, 컬렉션, 아카이브, 닌텐도, 플레이스테이션, 아타리",
  openGraph: {
    title: "겜자취 | 게임 위키와 나만의 다락",
    description: "게임 정보를 함께 기록하고, 좋아하는 게임과 추억을 내 다락에 차곡차곡.",
    url: "https://retrovault.kro.kr",
    siteName: "겜자취",
    images: [
      {
        url: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "겜자취 Preview Image",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "겜자취",
    description: "게임 위키와 나만의 다락",
    images: ["https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1200"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://retrovault.kro.kr',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`transition-colors duration-300 ${pressStart2P.variable} ${brandFont.variable}`}>
        <Providers>
          <ToastProvider>
            <div className="min-h-screen bg-vault-bg">
              <NavigationApp />
              <main className="pb-20 lg:pb-0 page-enter flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
