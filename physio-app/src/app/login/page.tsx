'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();


    if (role === 'admin' && email === 'admin@physio.com') {
      localStorage.setItem('userRole', 'admin');
      router.push(`/dashboard/admin`);
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = existingUsers.find((u: any) => u.email === email && u.password === password && u.role === role);

    if (!user) {
      setError('Invalid credentials or account not registered. Please register first.');
      return;
    }

    localStorage.setItem('userRole', role);
    router.push(`/dashboard/${role}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center mb-2">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-8">Sign in to your PhysioByHarish account</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {(['patient', 'doctor', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRole(r); setError(''); }}
                  className={`py-2 px-3 text-sm font-semibold rounded-lg capitalize transition-colors ${role === r
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={`demo@${role}.com`}
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

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <a href="/register" className="text-primary font-bold hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
