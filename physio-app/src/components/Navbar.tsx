'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('userRole'));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    setRole(null);
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
              PhysioByHarish
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
          </div>
          <div className="flex items-center space-x-4">
            {role ? (
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Logout ({role})
              </button>
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
        </div>
      </div>
    </nav>
  );
}
