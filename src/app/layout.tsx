'use client';
import type { Metadata } from 'next';
import { Inter, Inconsolata } from 'next/font/google';
import './globals.css';
import { NavBar } from '~~/components';
import { MobileNav } from '~~/components/MobileNav';
import { Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { Preloader } from '~~/components/Preloader';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });
const inconsolate = Inconsolata({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(pathname !== '/projects');
  useLayoutEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;

      const locomotiveScroll = new LocomotiveScroll();
    })();
    setTimeout(() => setLoading(false), 3000);
  }, []);

  return (
    <html lang='en'>
      <body className={inconsolate.className}>
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
