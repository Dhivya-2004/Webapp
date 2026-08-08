'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  registeredAt?: string;
  status?: string;
};

type Purchase = {
  id: string;
  productName: string;
  status?: string;
  price: number;
  patientName: string;
  patientEmail: string;
  purchasedAt: string;
};

type Appointment = {
  id: string;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  bookedAt: string;
};

type Tab = 'overview' | 'doctors' | 'patients' | 'purchases' | 'appointments' | 'applications';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('adminAuth') === 'true';
    }
    return false;
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchData() {
      const { data: users } = await supabase.from('profiles').select('*');
      if (users) setRegisteredUsers(users.map(u => ({ ...u, registeredAt: u.created_at })));

      const { data: purs } = await supabase.from('purchases').select(`
        *,
        user:profiles!purchases_user_id_fkey(name, email)
      `).order('created_at', { ascending: false });
      if (purs) {
        setPurchases(purs.map(p => ({
          ...p,
          productName: p.product_name,
          purchasedAt: p.created_at,
          patientName: p.user?.name || 'Unknown',
          patientEmail: p.user?.email || 'Unknown'
        })));
      }

      const { data: apts } = await supabase.from('appointments').select(`
        *,
        patient:profiles!appointments_patient_id_fkey(name, email),
        doctor:profiles!appointments_doctor_id_fkey(name, specialization)
      `).order('created_at', { ascending: false });
      if (apts) {
        setAppointments(apts.map(a => ({
          ...a,
          bookedAt: a.created_at,
          patientName: a.patient?.name || 'Unknown',
          patientEmail: a.patient?.email || 'Unknown',
          doctorName: a.doctor?.name || 'Unknown',
          doctorSpecialization: a.doctor?.specialization || 'Unknown'
        })));
      }
    }
    fetchData();
  }, [isAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'divyamsk21@gmail.com' && password === 'Admin@123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const doctors = registeredUsers.filter((u) => u.role === 'doctor');
  const patients = registeredUsers.filter((u) => u.role === 'patient');
  const totalRevenue = purchases.reduce((sum, p) => sum + p.price, 0);

  const handleRemoveUser = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      setRegisteredUsers(prev => prev.filter(u => u.id !== id));
    } else {
      alert('Failed to remove user: ' + error.message);
    }
  };

  const handleDoctorStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (!error) {
      setRegisteredUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    } else {
      alert('Failed to update status: ' + error.message);
    }
  };

  const handleRemovePurchase = async (id: string) => {
    const { error } = await supabase.from('purchases').delete().eq('id', id);
    if (!error) {
      setPurchases(prev => prev.filter(p => p.id !== id));
    }
  };

  const handlePurchaseStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('purchases').update({ status }).eq('id', id);
    if (!error) {
      setPurchases(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    }
  };

  const handleRemoveAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (!error) {
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleAppointmentStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'overview', label: 'Overview', emoji: '📊' },
    { id: 'doctors', label: `Doctors (${doctors.length})`, emoji: '🩺' },
    { id: 'patients', label: `Patients (${patients.length})`, emoji: '🧑‍🦽' },
    { id: 'purchases', label: `Purchases (${purchases.length})`, emoji: '🛒' },
    { id: 'appointments', label: `Appointments (${appointments.length})`, emoji: '📅' },
    { id: 'applications', label: `Doctor Applications`, emoji: '📋' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🛡️
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-slate-500 text-sm mt-2">Enter your credentials to access the admin dashboard.</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-sm font-medium">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 mt-4"
            >
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage doctors, patients and purchase records</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            AD
          </div>
          <div>
            <p className="font-semibold text-sm">Admin User</p>
            <p className="text-xs text-slate-500">admin@physio.com</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Doctors', value: doctors.length, icon: '🩺', color: 'from-blue-500 to-cyan-500', border: 'border-blue-200 dark:border-blue-800' },
          { label: 'Total Patients', value: patients.length, icon: '🧑‍🦽', color: 'from-violet-500 to-purple-500', border: 'border-violet-200 dark:border-violet-800' },
          { label: 'Appointments', value: appointments.length, icon: '📅', color: 'from-pink-500 to-rose-500', border: 'border-pink-200 dark:border-pink-800' },
          { label: 'Total Purchases', value: purchases.length, icon: '🛒', color: 'from-emerald-500 to-teal-500', border: 'border-emerald-200 dark:border-emerald-800' },
          { label: 'Pending Appts', value: pendingAppointments, icon: '⏳', color: 'from-amber-500 to-yellow-500', border: 'border-amber-200 dark:border-amber-800' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: 'from-amber-500 to-orange-500', border: 'border-amber-200 dark:border-amber-800' },
        ].map((stat) => (
          <div key={stat.label} className={`glass p-5 rounded-2xl border ${stat.border}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3 shadow-md`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-slate-500 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass rounded-2xl overflow-hidden">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-bold">Platform Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent doctors */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Recent Doctors</h3>
                {doctors.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No doctors registered yet</p>
                ) : (
                  <div className="space-y-2">
                    {doctors.slice(0, 4).map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {(doc.name || doc.email || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{doc.name || doc.email}</p>
                          <p className="text-xs text-slate-500 truncate">{doc.specialization || 'Physiotherapy'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Recent purchases */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Recent Purchases</h3>
                {purchases.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">No purchases yet</p>
                ) : (
                  <div className="space-y-2">
                    {purchases.slice(-4).reverse().map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{p.productName}</p>
                          <p className="text-xs text-slate-500 truncate">{p.patientName}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600 flex-shrink-0">₹{p.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Registered Doctors</h2>
            {doctors.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🩺</div>
                <p className="text-slate-500 font-medium">No doctors registered yet</p>
                <p className="text-sm text-slate-400 mt-1">Doctors will appear here after they register</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-left text-sm text-slate-500 border-b border-gray-100 dark:border-slate-700/50">
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Registered</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {doctors.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {(doc.name || doc.email || '?')[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-foreground">{doc.name || '—'}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-500">{doc.email}</td>
                        <td className="py-3 text-slate-400 text-xs">
                          {doc.registeredAt ? new Date(doc.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            doc.status === 'approved' 
                              ? 'bg-green-100 text-green-700' 
                              : doc.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : 'Approved'}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(doc.status === 'pending') && (
                              <button
                                onClick={() => handleDoctorStatus(doc.id, 'approved')}
                                className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1.5 rounded-full hover:bg-green-100"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveUser(doc.id)}
                              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-full transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="p-6">
            <h2 className="text-lg font-bold mb-4">Registered Patients</h2>
            {patients.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🧑‍ْ</div>
                <p className="text-slate-500 font-medium">No patients registered yet</p>
                <p className="text-sm text-slate-400 mt-1">Patients will appear here after they register</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                      <th className="pb-3 font-semibold">Patient</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Purchases</th>
                      <th className="pb-3 font-semibold">Registered</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {patients.map((patient) => {
                      const patientPurchases = purchases.filter((p) => p.patientEmail === patient.email);
                      return (
                        <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                {(patient.name || patient.email || '?')[0].toUpperCase()}
                              </div>
                              <span className="font-semibold text-foreground">{patient.name || '—'}</span>
                            </div>
                          </td>
                          <td className="py-3 text-slate-500">{patient.email}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${patientPurchases.length > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                              {patientPurchases.length} {patientPurchases.length === 1 ? 'item' : 'items'}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400 text-xs">
                            {patient.registeredAt ? new Date(patient.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleRemoveUser(patient.id)}
                              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full transition-colors"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === 'purchases' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Purchase Records</h2>
              {purchases.length > 0 && (
                <span className="text-sm text-emerald-600 font-bold">
                  Total Revenue: ₹{totalRevenue.toLocaleString()}
                </span>
              )}
            </div>
            {purchases.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🛒</div>
                <p className="text-slate-500 font-medium">No purchases yet</p>
                <p className="text-sm text-slate-400 mt-1">Patient purchases will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Patient</th>
                      <th className="pb-3 font-semibold">Price</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...purchases].reverse().map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 font-medium text-foreground">{purchase.productName}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            purchase.status === 'Delivered'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                              : purchase.status === 'Cancelled'
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          }`}>
                            {purchase.status || 'Ordered'}
                          </span>
                        </td>
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-foreground">{purchase.patientName}</p>
                            <p className="text-xs text-slate-400">{purchase.patientEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 font-bold text-emerald-600">₹{purchase.price}</td>
                        <td className="py-3 text-slate-400 text-xs">
                          {new Date(purchase.purchasedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                          <br />
                          <span>{new Date(purchase.purchasedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(!purchase.status || purchase.status === 'Ordered') && (
                              <>
                                <button
                                  onClick={() => handlePurchaseStatus(purchase.id, 'Delivered')}
                                  className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1.5 rounded-full hover:bg-green-100 transition-colors"
                                >
                                  Delivered
                                </button>
                                <button
                                  onClick={() => handlePurchaseStatus(purchase.id, 'Cancelled')}
                                  className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleRemovePurchase(purchase.id)}
                              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-full transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-bold">All Appointments</h2>
              <div className="flex gap-2 text-xs font-semibold">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  ⏳ Pending: {appointments.filter(a => a.status === 'pending').length}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  ✅ Approved: {appointments.filter(a => a.status === 'approved').length}
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                  ❌ Rejected: {appointments.filter(a => a.status === 'rejected').length}
                </span>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📅</div>
                <p className="text-slate-500 font-medium">No appointments booked yet</p>
                <p className="text-sm text-slate-400 mt-1">Appointments will appear here when patients book them</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                      <th className="pb-3 font-semibold">Patient</th>
                      <th className="pb-3 font-semibold">Doctor</th>
                      <th className="pb-3 font-semibold">Date & Time</th>
                      <th className="pb-3 font-semibold">Reason</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[...appointments].reverse().map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {(apt.patientName || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{apt.patientName}</p>
                              <p className="text-xs text-slate-400">{apt.patientEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-foreground">{apt.doctorName}</p>
                          <p className="text-xs text-slate-400">{apt.doctorSpecialization}</p>
                        </td>
                        <td className="py-3">
                          <p className="font-medium">📅 {apt.date}</p>
                          <p className="text-xs text-slate-400">⏰ {apt.time}</p>
                        </td>
                        <td className="py-3 text-slate-500 text-xs max-w-[150px]">
                          <span className="italic">{apt.reason || '—'}</span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            apt.status === 'approved'
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                              : apt.status === 'rejected'
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                          }`}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {apt.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAppointmentStatus(apt.id, 'approved')}
                                  className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1.5 rounded-full hover:bg-green-100 transition-colors"
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  onClick={() => handleAppointmentStatus(apt.id, 'rejected')}
                                  className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                                >
                                  ✗ Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleRemoveAppointment(apt.id)}
                              className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-2.5 py-1.5 rounded-full transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="p-6 h-[600px] flex flex-col">
            <h2 className="text-lg font-bold mb-4">Doctor Applications (Google Form Responses)</h2>
            <p className="text-sm text-slate-500 mb-4">
              To view the filled details here, publish your Google Sheet to the web (File {'>'} Share {'>'} Publish to web {'>'} Embed) and add the source URL to your .env.local file as <code>NEXT_PUBLIC_GOOGLE_SHEET_URL</code>.
            </p>
            {process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL ? (
              <iframe 
                src={process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL} 
                className="w-full flex-grow border-0 rounded-xl bg-white shadow-inner"
                title="Google Form Responses"
              />
            ) : (
              <div className="flex-grow flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 font-medium">NEXT_PUBLIC_GOOGLE_SHEET_URL is not configured in .env.local</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
