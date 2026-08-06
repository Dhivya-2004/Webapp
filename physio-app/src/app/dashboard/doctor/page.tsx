'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [totalPatients, setTotalPatients] = useState(0);

  useEffect(() => {
    let channel: any;
    
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setCurrentUser(profile);

      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient');
      setTotalPatients(count || 0);

      const fetchAppointments = async () => {
        const { data: apts } = await supabase.from('appointments').select(`
          *,
          patient:profiles!appointments_patient_id_fkey(name, email)
        `).eq('doctor_id', session.user.id).order('created_at', { ascending: false });
        
        if (apts) {
          setAppointments(apts.map(a => ({
            ...a,
            patientName: a.patient?.name || 'Unknown',
            patientEmail: a.patient?.email || 'Unknown'
          })));
        }
      };

      await fetchAppointments();

      // SUPABASE REALTIME SUBSCRIPTION
      const channelId = `realtime_appointments_${session.user.id}_${Math.random()}`;
      channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `doctor_id=eq.${session.user.id}`,
          },
          (payload) => {
            console.log('Real-time appointment update!', payload);
            fetchAppointments(); // Re-fetch to get joined profile data safely
          }
        )
        .subscribe();
    }
    
    fetchData();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setAppointments(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      
      // Send real-time notification to the patient
      const appointment = appointments.find(a => a.id === id);
      if (appointment) {
        await supabase.from('notifications').insert([{
          user_id: appointment.patient_id,
          message: `Your appointment on ${appointment.date} at ${appointment.time} has been ${newStatus}.`
        }]);
      }
    }
  };

  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const todayVisits = appointments.filter(a => a.status === 'approved' && a.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-foreground">Doctor Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center text-primary-foreground font-bold uppercase text-sm">
              {(currentUser?.name || currentUser?.email || 'D')[0]}
             </div>
             {pendingCount > 0 && (
               <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">
                 {pendingCount}
               </div>
             )}
          </div>
          <div>
            <span className="font-bold block">{currentUser?.name || currentUser?.email || 'Doctor'}</span>
            <span className="text-xs text-slate-500 block">{currentUser?.specialization || 'Physiotherapy'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl flex flex-col justify-center border-l-4 border-primary">
          <p className="text-slate-500 font-medium mb-1">Today's Visits</p>
          <p className="text-4xl font-extrabold text-primary">{todayVisits}</p>
        </div>
        <div className="glass p-6 rounded-2xl flex flex-col justify-center border-l-4 border-yellow-500">
          <p className="text-slate-500 font-medium mb-1">Pending Requests</p>
          <p className="text-4xl font-extrabold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="glass p-6 rounded-2xl flex flex-col justify-center border-l-4 border-accent">
          <p className="text-slate-500 font-medium mb-1">Total Registered Patients</p>
          <p className="text-4xl font-extrabold text-accent">{totalPatients}</p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl mt-8">
        <h2 className="text-2xl font-bold mb-6">Appointment Requests</h2>
        
        <div className="space-y-4">
          {[...appointments].reverse().map(appointment => (
              <div key={appointment.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-lg font-bold text-slate-500 uppercase flex-shrink-0">
                    {(appointment.patientName || '?').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{appointment.patientName}</h3>
                    <p className="text-xs text-slate-500 mb-1">{appointment.patientEmail}</p>
                    <p className="text-sm font-medium italic mb-2">"{appointment.reason}"</p>
                    <div className="flex items-center text-sm text-slate-500 gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {appointment.time}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {appointment.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleStatusChange(appointment.id, 'rejected')}
                        className="flex-1 sm:flex-none px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleStatusChange(appointment.id, 'approved')}
                        className="flex-1 sm:flex-none px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-accent transition-colors shadow-sm"
                      >
                        Approve
                      </button>
                    </>
                  ) : (
                    <span className={`px-4 py-2 rounded-xl font-medium text-sm ${
                      appointment.status === 'approved' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}

          {appointments.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No appointments found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
