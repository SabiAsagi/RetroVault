import type { Metadata, Viewport } from "next";
import './globals.css';

import { Providers } from '../components/Providers';
import NavigationApp from '../components/NavigationApp';
import Footer from '../components/Footer';
import { ToastProvider } from '../contexts/ToastContext';

export const metadata: Metadata = {
  title: "RetroVault | 레트로 게임 컬렉션 아카이브",
  description: "80년대부터 지금까지, 시대를 초월하는 명작들을 수집하고 기록하는 나만의 게임 박물관.",
  keywords: "레트로, 게임, 컬렉션, 아카이브, 닌텐도, 플레이스테이션, 아타리",
  openGraph: {
    title: "RetroVault - Digital Retro Game Museum",
    description: "시대를 초월하는 명작들을 수집하고 기록하는 나만의 게임 박물관.",
    url: "https://retrovault.kro.kr",
    siteName: "RetroVault",
    images: [
      {
        url: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "RetroVault Preview Image",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RetroVault",
    description: "나만의 레트로 게임 컬렉션 아카이브",
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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </head>
      <body className="transition-colors duration-300">
        <Providers>
          <ToastProvider>
            <div className="min-h-screen bg-vault-bg">
              <NavigationApp />
              <main className="pb-16 sm:pb-0 page-enter flex-1">
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
