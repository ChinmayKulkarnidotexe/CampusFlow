'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingOverlay from './LoadingOverlay';

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Set loading state when pathname changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {children}
      {isNavigating && <LoadingOverlay />}
    </>
  );
}
