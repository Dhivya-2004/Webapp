'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<{show: boolean; message: string; type: 'success'|'error'}>({show: false, message: '', type: 'success'});

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("Auth error:", authError);
      let errorMsg = authError.message;
      if (!errorMsg || errorMsg === '{}') {
        errorMsg = 'This email is already registered or invalid. Please try another one or sign in.';
      }
      showToast(errorMsg, 'error');
      return;
    }

    if (!authData.user) {
      showToast('Registration failed. Please try again.', 'error');
      return;
    }

    const newName = `${firstName} ${lastName}`.trim();

    // 2. Insert into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email,
          role,
          name: newName,
          address,
          status: role === 'doctor' ? 'pending' : 'approved',
        }
      ]);

    if (profileError) {
      console.error(profileError);
      showToast('Failed to create user profile: ' + profileError.message, 'error');
      return;
    }
    
    // Keep localStorage for partial backwards compatibility while we migrate the rest of the app
    localStorage.setItem('userRole', role);
    localStorage.setItem('currentUser', JSON.stringify({ id: authData.user.id, email, name: newName, role, address }));

    if (role === 'doctor') {
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newName,
            email: email,
            userId: authData.user.id,
          }),
        });
        await supabase.auth.signOut();
        showToast('Registration successful! Please wait for Admin approval to login.', 'success');
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    } else {
      showToast('Registration successful! Welcome to PhysioByHarish.', 'success');
    }

    setTimeout(() => {
      if (role === 'doctor') {
        router.push('/login/doctor');
      } else {
        router.push(`/dashboard/${role}`);
      }
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Toast Notification */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className={`px-6 py-4 rounded-xl shadow-2xl border font-semibold flex items-center gap-3 ${
          toast.type === 'success' 
            ? 'bg-green-50/90 dark:bg-green-900/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-100 backdrop-blur-md' 
            : 'bg-red-50/90 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-100 backdrop-blur-md'
        }`}>
          {toast.type === 'success' ? '✅' : '⚠️'} {toast.message}
        </div>
      </div>
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center mb-2">Create an Account</h1>
        <p className="text-slate-500 text-center mb-8">Join PhysioByHarish and get started</p>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">I want to register as a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`py-3 px-4 text-sm font-semibold rounded-xl capitalize transition-all ${
                  role === 'patient'
                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`py-3 px-4 text-sm font-semibold rounded-xl capitalize transition-all ${
                  role === 'doctor'
                    ? 'bg-accent text-primary-foreground shadow-md ring-2 ring-accent ring-offset-2 dark:ring-offset-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Doctor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="john@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Full Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="123 Main St, City"
              />
            </div>
          </div>



          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover-lift shadow-lg shadow-primary/20 mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <a href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
