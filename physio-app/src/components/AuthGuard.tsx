'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      // Allow hardcoded admin login to bypass Supabase check
      if (pathname === '/dashboard/admin') {
        const isAdminAuth = typeof window !== 'undefined' && sessionStorage.getItem('adminAuth') === 'true';
        if (isAdminAuth) {
          if (mounted) setIsAuthenticated(true);
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        if (pathname?.startsWith('/dashboard/')) {
          const portal = pathname.split('/')[2];
          if (portal) {
            if (mounted) router.push(`/login/${portal}`);
            return;
          }
        }
        if (mounted) router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', session.user.id)
        .single();
        
      const role = profile?.role;
      
      if (!role) {
        await supabase.auth.signOut();
        if (mounted) router.push('/login');
        return;
      }

      if (role === 'doctor' && (profile?.status === 'pending' || profile?.status === 'rejected')) {
        await supabase.auth.signOut();
        if (mounted) router.push('/login/doctor');
        return;
      }

      if (pathname?.startsWith('/dashboard/')) {
        const portal = pathname.split('/')[2];
        if (portal && portal !== role) {
          if (mounted) router.push(`/dashboard/${role}`);
          return;
        }
      }

      if (mounted) setIsAuthenticated(true);
    }

    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  if (!isAuthenticated) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
