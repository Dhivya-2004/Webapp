'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import NotificationBell from './NotificationBell';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      if (typeof window !== 'undefined' && sessionStorage.getItem('adminAuth') === 'true') {
        setRole('admin');
        const adminProfile = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setUserId(adminProfile.id || 'admin-hardcoded-id');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setRole(profile?.role || null);
      } else {
        setRole(null);
        setUserId(null);
      }
    }
    
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        if (typeof window !== 'undefined' && sessionStorage.getItem('adminAuth') === 'true') {
          // Keep the admin session active
          setRole('admin');
          const adminProfile = JSON.parse(localStorage.getItem('currentUser') || '{}');
          setUserId(adminProfile.id || 'admin-hardcoded-id');
        } else {
          setRole(null);
          setUserId(null);
        }
      } else {
        fetchSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminAuth');
    }
    setRole(null);
    setUserId(null);
    window.location.href = '/login';
  };
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/store' },
    { name: 'Patient Portal', path: '/dashboard/patient' },
    { name: 'Doctor Portal', path: '/dashboard/doctor' },
    { name: 'Admin', path: '/dashboard/admin' },
  ];

  return (
    <nav className="glass sticky top-0 z-50 w-full border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-bold text-2xl gradient-text tracking-tighter">
              Velora
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  pathname === link.path
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground hover:text-primary hover:border-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {role && (
              <Link
                href="/my-orders"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  pathname === '/my-orders'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground hover:text-primary hover:border-gray-300'
                }`}
              >
                My Orders
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              {role ? (
                <>
                  {userId && <NotificationBell userId={userId} />}
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Logout ({role})
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-accent transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              {role && userId && <div className="mr-3"><NotificationBell userId={userId} /></div>}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:text-primary focus:outline-none p-1"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col space-y-2 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {role && (
                <Link
                  href="/my-orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname === '/my-orders'
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  My Orders
                </Link>
              )}
            </div>
            <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 px-5">
              {role ? (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Logout ({role})
                </button>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white text-center hover:bg-accent shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
