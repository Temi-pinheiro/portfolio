'use client';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NavBar } from '~~/components';
import { MobileNav } from '~~/components/MobileNav';
import { Suspense, useEffect, useState } from 'react';
import { Preloader } from '~~/components/Preloader';
import { AnimatePresence } from 'framer-motion';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;

      const locomotiveScroll = new LocomotiveScroll();
    })();
    setTimeout(() => setLoading(false), 5000);
  }, []);

  return (
    <html lang='en'>
      <body className={inter.className}>
        <AnimatePresence mode='wait'>
          {loading ? (
            <Preloader loading={loading} />
          ) : (
            <>
              <NavBar />
              <MobileNav />
              {children}
            </>
          )}
        </AnimatePresence>
      </body>
    </html>
  );
}
