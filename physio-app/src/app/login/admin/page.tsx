'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === 'divyamsk21@gmail.com' && password === 'Admin@123') {
      // Keep localStorage for backwards compatibility while migrating other components
      localStorage.setItem('userRole', 'admin');
      
      // Hardcode a fake profile to satisfy the rest of the application
      const adminProfile = {
        id: 'admin-hardcoded-id',
        email: 'divyamsk21@gmail.com',
        role: 'admin',
        name: 'Admin User'
      };
      localStorage.setItem('currentUser', JSON.stringify(adminProfile));
      
      // Also set the session storage flag we added in the dashboard
      sessionStorage.setItem('adminAuth', 'true');
      
      router.push(`/dashboard/admin`);
    } else {
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center mb-2">Admin Login</h1>
        <p className="text-slate-500 text-center mb-8">Sign in to the Admin portal</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="admin@physio.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <a href="/forgot-password" className="text-sm text-primary font-semibold hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-lg hover-lift shadow-lg shadow-primary/20"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm text-slate-500 hover:text-primary transition-colors">
            &larr; Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  );
}
