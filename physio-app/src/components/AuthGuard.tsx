'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role) {
      if (pathname?.startsWith('/dashboard/')) {
        const portal = pathname.split('/')[2];
        if (portal) {
          router.push(`/login/${portal}`);
          return;
        }
      }
      router.push('/login');
      return;
    }

    // Enforce role-based access to dashboard portals
    if (pathname?.startsWith('/dashboard/')) {
      const portal = pathname.split('/')[2]; // e.g. "admin", "patient", "doctor"
      if (portal && portal !== role) {
        router.push(`/dashboard/${role}`);
        return;
      }
    }

    setIsAuthenticated(true);
  }, [router, pathname]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
