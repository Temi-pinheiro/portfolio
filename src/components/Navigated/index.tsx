'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef } from 'react';

// Sets <html data-navigated> at the first client-side navigation. A first
// visit plays each page's entrance; after that the page transitions carry the
// change, and the entrances that would fight them switch off (globals.css).
// A layout effect, so it lands before the view transition captures the page.
export const Navigated = () => {
  const pathname = usePathname();
  const first = useRef(pathname);
  useLayoutEffect(() => {
    if (pathname !== first.current) {
      document.documentElement.dataset.navigated = '';
    }
  }, [pathname]);
  return null;
};
