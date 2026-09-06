'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function NurseDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login/nurse');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData?.role !== 'nurse') {
        router.push('/login');
        return;
      }

      if (profileData.status !== 'approved') {
        await supabase.auth.signOut();
        router.push('/login/nurse');
        return;
      }

      setProfile(profileData);
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    router.push('/login/nurse');
  };

  if (loading) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {profile?.name}</h1>
          <p className="text-slate-500">Nurse Dashboard</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors font-semibold"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl border border-emerald-100 dark:border-slate-800">
          <h3 className="text-lg font-bold mb-2">My Profile</h3>
          <p className="text-sm text-slate-500">Qualification: {profile?.qualification}</p>
          <p className="text-sm text-slate-500">Experience: {profile?.experience}</p>
          <p className="text-sm text-slate-500">Status: <span className="text-green-600 font-bold uppercase">{profile?.status}</span></p>
        </div>
        
        <div className="glass p-6 rounded-2xl border border-emerald-100 dark:border-slate-800">
          <h3 className="text-lg font-bold mb-2">Upcoming Visits</h3>
          <p className="text-sm text-slate-500">You have no upcoming patient visits.</p>
        </div>

        <div className="glass p-6 rounded-2xl border border-emerald-100 dark:border-slate-800">
          <h3 className="text-lg font-bold mb-2">Earnings</h3>
          <p className="text-sm text-slate-500">₹0.00 this month</p>
        </div>
      </div>
    </div>
  );
}
