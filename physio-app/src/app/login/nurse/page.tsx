'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function NurseLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError('Invalid credentials.');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || profile?.role !== 'nurse') {
      await supabase.auth.signOut();
      setError('Account is not registered as a Nurse.');
      return;
    }

    if (profile?.status === 'pending') {
      await supabase.auth.signOut();
      setError('Your account is pending admin approval. Please wait until your details are verified.');
      return;
    }
    
    if (profile?.status === 'rejected') {
      await supabase.auth.signOut();
      setError('Your account application was rejected. Please contact support.');
      return;
    }

    // Keep localStorage for backwards compatibility while migrating other components
    localStorage.setItem('userRole', 'nurse');
    localStorage.setItem('currentUser', JSON.stringify(profile));
    router.push(`/dashboard/nurse`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center mb-2">Nurse Login</h1>
        <p className="text-slate-500 text-center mb-8">Sign in to your Nurse account</p>

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
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="nurse@demo.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <a href="/forgot-password" className="text-sm text-emerald-600 font-semibold hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-lg hover-lift shadow-lg shadow-emerald-600/20"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <a href="/register?role=nurse" className="text-emerald-600 font-bold hover:underline">
            Register here
          </a>
        </p>

        <div className="mt-4 text-center">
          <Link href="/nurse-care" className="text-sm text-slate-500 hover:text-emerald-600 transition-colors">
            &larr; Back to Nurse Care
          </Link>
        </div>
      </div>
    </div>
  );
}
