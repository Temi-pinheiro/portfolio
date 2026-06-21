'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Preloader } from '~~/components/Preloader';
import { NavBar } from '~~/components';
import { MobileNav } from '~~/components/MobileNav';

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(pathname !== '/projects');

  useEffect(() => {
    let scroll: { destroy?: () => void } | undefined;
    (async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;
      scroll = new LocomotiveScroll();
    })();

    const timer = setTimeout(() => setLoading(false), 3000);

    return () => {
      clearTimeout(timer);
      scroll?.destroy?.();
    };
  }, []);

  // The page content is always rendered (so it is present in the server-rendered
  // HTML for crawlers and paints early), while the preloader sits on top as a
  // fixed overlay and fades out to reveal the finished page.
  return (
    <>
      <NavBar />
      <MobileNav />
      {children}
      <AnimatePresence>
        {loading && <Preloader loading={loading} />}
      </AnimatePresence>
    </>
  );
};
