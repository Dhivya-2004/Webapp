'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin override for demo
    if (email === 'admin@physio.com') {
      setStatus('success');
      setMessage('Password reset link has been sent to your email address.');
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = existingUsers.find((u: any) => u.email === email);

    if (user) {
      setStatus('success');
      setMessage('Password reset link has been sent to your email address.');
    } else {
      setStatus('error');
      setMessage('No account found with that email address.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center mb-2">Reset Password</h1>
        <p className="text-slate-500 text-center mb-8">Enter your email to receive a reset link</p>

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
            {message}
          </div>
        )}

        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="name@example.com"
              disabled={status === 'success'}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'success' || !email}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-lg hover-lift shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
