'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PatientDashboard() {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorSearch, setDoctorSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setCurrentUser(profile);

      const { data: docs } = await supabase.from('profiles').select('*').eq('role', 'doctor');
      if (docs) setDoctors(docs);

      const { data: apts } = await supabase.from('appointments').select(`
        *,
        doctor:profiles!appointments_doctor_id_fkey(name, specialization)
      `).eq('patient_id', session.user.id).order('created_at', { ascending: false });
      
      if (apts) {
        setMyAppointments(apts.map(a => ({
          ...a,
          doctorName: a.doctor?.name || 'Unknown',
          doctorSpecialization: a.doctor?.specialization || 'General'
        })));
      }
    }
    
    fetchData();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!selectedDoctor) {
      alert("Please select a doctor to request an appointment.");
      return;
    }
    
    const newAppointment = {
      patient_id: currentUser.id,
      doctor_id: selectedDoctor,
      date,
      time,
      reason: reason || 'General consultation',
      status: 'pending',
    };
    
    const { data, error } = await supabase.from('appointments').insert([newAppointment]).select(`
      *,
      doctor:profiles!appointments_doctor_id_fkey(name, specialization)
    `).single();

    if (!error && data) {
      setMyAppointments(prev => [{
        ...data,
        doctorName: data.doctor?.name || 'Unknown',
        doctorSpecialization: data.doctor?.specialization || 'General'
      }, ...prev]);
      
      const selectedDocData = doctors.find(d => d.id === selectedDoctor);
      let docPhone = selectedDocData?.phone || '6385842977';
      docPhone = docPhone.replace(/\D/g, ''); // strip non-digits
      if (docPhone.length === 10) docPhone = '91' + docPhone; // Add India country code if missing
      
      const patientName = currentUser.name || currentUser.email || 'Patient';
      const patientPhone = currentUser.phone || 'Not provided';
      const address = currentUser.address || 'Not provided';
      const message = `*New Appointment Request*\n\n*Patient Details:*\nName: ${patientName}\nPhone: ${patientPhone}\nAddress: ${address}\n\n*Appointment Details:*\nDate: ${date}\nTime: ${time}\nReason: ${reason || 'General consultation'}`;
      const whatsappUrl = `https://wa.me/${docPhone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedDoctor('');
        setDate('');
        setTime('');
        setReason('');
      }, 3000);
    } else {
      console.error(error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    (doc.name || '').toLowerCase().includes(doctorSearch.toLowerCase()) || 
    (doc.specialization || '').toLowerCase().includes(doctorSearch.toLowerCase()) ||
    (doc.clinic_name || '').toLowerCase().includes(doctorSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-foreground">Patient Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold uppercase">
            {currentUser ? (currentUser.name || currentUser.email || 'P').substring(0, 2) : '..'}
          </div>
          <span className="font-medium">
            {currentUser ? (currentUser.name || currentUser.email || 'Patient') : 'Loading...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Book a House Visit</h2>
            
            {bookingSuccess ? (
              <div className="p-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/50 flex flex-col items-center justify-center h-64">
                <div className="h-16 w-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Appointment Request Sent!</h3>
                <p className="text-center">The doctor has been notified and will approve your request shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-6">
                
                {/* Doctor Selection */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <label className="block text-sm font-medium">Select a Doctor</label>
                    <input 
                      type="text" 
                      placeholder="Search by name, clinic..." 
                      value={doctorSearch}
                      onChange={e => setDoctorSearch(e.target.value)}
                      className="px-4 py-2 text-sm rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1 scrollbar-hide">
                    {filteredDoctors.length === 0 ? (
                      <p className="text-sm text-slate-500 col-span-full py-4 text-center">No doctors found matching your search.</p>
                    ) : (
                      filteredDoctors.map(doc => (
                        <div 
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc.id)}
                          className={`cursor-pointer rounded-2xl border p-4 transition-all hover-lift ${selectedDoctor === doc.id ? 'border-primary ring-2 ring-primary/50 bg-primary/5 shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-primary/40 bg-white dark:bg-slate-800'}`}
                        >
                          <div className="flex items-start gap-4">
                            <img 
                              src={doc.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'Doctor')}&background=random`} 
                              alt={doc.name} 
                              className="w-16 h-16 rounded-full object-cover shadow-sm border border-slate-100 dark:border-slate-700 bg-slate-50"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-base truncate" title={doc.name}>{doc.name || 'Unknown Doctor'}</h4>
                              <p className="text-primary text-xs font-bold uppercase tracking-wide truncate mt-0.5">{doc.specialization || 'General'}</p>
                              
                              <div className="text-xs text-slate-500 mt-2 space-y-1">
                                {doc.qualification && <p className="truncate" title={doc.qualification}>🎓 {doc.qualification}</p>}
                                {doc.experience && <p>💼 {doc.experience} Years Exp.</p>}
                                {doc.clinic_name && <p className="truncate" title={doc.clinic_name}>🏥 {doc.clinic_name}</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {!selectedDoctor && (
                    <p className="text-xs text-red-500 mt-2 font-medium">* Please select a doctor from the list above.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <input 
                      type="time" 
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Visit (Optional)</label>
                  <textarea 
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Briefly describe your pain or symptoms..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={!selectedDoctor}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                    selectedDoctor 
                      ? 'bg-primary text-primary-foreground hover-lift shadow-primary/20' 
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                  }`}
                >
                  Request Appointment
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass p-6 rounded-3xl h-full">
            <h3 className="text-xl font-bold mb-4">My Appointments</h3>
            {myAppointments.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-4xl mb-4 opacity-50">📅</div>
                <p className="text-sm text-slate-500">No appointments booked yet.</p>
                <p className="text-xs text-slate-400 mt-2">Your upcoming sessions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                {[...myAppointments].reverse().map((apt: any) => (
                  <div key={apt.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">{apt.doctorName}</p>
                        <p className="text-xs text-primary font-medium">{apt.doctorSpecialization}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        apt.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        apt.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg mt-3">
                      <span className="flex items-center gap-1">📅 {apt.date}</span>
                      <span className="flex items-center gap-1">⏰ {apt.time}</span>
                    </div>
                    {apt.reason && <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 italic leading-relaxed line-clamp-2">"{apt.reason}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
