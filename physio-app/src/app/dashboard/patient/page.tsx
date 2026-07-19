'use client';

import { useState, useEffect } from 'react';
import { mockUsers } from '@/data/mock';

export default function PatientDashboard() {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const doctors = [
    ...mockUsers.filter(u => u.role === 'doctor'),
    ...JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('registeredUsers') || '[]' : '[]').filter((u: any) => u.role === 'doctor'),
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    const allAppointments: any[] = JSON.parse(localStorage.getItem('appointments') || '[]');
    setMyAppointments(allAppointments.filter((a: any) => a.patientEmail === user.email));
    const allPurchases: any[] = JSON.parse(localStorage.getItem('purchases') || '[]');
    setMyPurchases(allPurchases.filter((p: any) => p.patientEmail === user.email));
  }, []);

  const handlePurchaseStatus = (id: string, newStatus: string) => {
    const allPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    const updated = allPurchases.map((p: any) => p.id === id ? { ...p, status: newStatus } : p);
    localStorage.setItem('purchases', JSON.stringify(updated));
    setMyPurchases(updated.filter((p: any) => p.patientEmail === currentUser?.email));
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const doctor = doctors.find(d => d.id === selectedDoctor);
    const allAppointments: any[] = JSON.parse(localStorage.getItem('appointments') || '[]');
    const patientName = currentUser?.name || currentUser?.email || 'Patient';
    const newAppointment = {
      id: `apt${Date.now()}`,
      patientName,
      patientEmail: currentUser?.email || '',
      doctorId: selectedDoctor,
      doctorName: doctor?.name || 'Doctor',
      doctorSpecialization: doctor?.specialization || 'Physiotherapy',
      date,
      time,
      reason: reason || 'General consultation',
      status: 'pending',
      bookedAt: new Date().toISOString(),
    };
    allAppointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(allAppointments));
    setMyAppointments(prev => [...prev, newAppointment]);
    
    // Open WhatsApp with pre-filled appointment details
    const address = currentUser?.address || 'Not provided';
    const message = `*New Appointment Request*\n\n*Patient:* ${patientName}\n*Address:* ${address}\n*Date:* ${date}\n*Time:* ${time}\n*Details:* ${reason || 'General consultation'}`;
    const whatsappUrl = `https://wa.me/916385842977?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedDoctor('');
      setDate('');
      setTime('');
      setReason('');
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-foreground">Patient Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
            JD
          </div>
          <span className="font-medium">John Doe</span>
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
                <div>
                  <label className="block text-sm font-medium mb-2">Select a Doctor</label>
                  <select 
                    required
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Choose...</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>
                    ))}
                  </select>
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
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover-lift shadow-lg shadow-primary/20"
                >
                  Request Appointment
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass p-6 rounded-3xl">
            <h3 className="text-xl font-bold mb-4">My Appointments</h3>
            {myAppointments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No appointments booked yet</p>
            ) : (
              <div className="space-y-3">
                {[...myAppointments].reverse().map((apt: any) => (
                  <div key={apt.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">{apt.doctorName}</p>
                        <p className="text-xs text-slate-500">{apt.doctorSpecialization}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        apt.status === 'approved' ? 'bg-green-100 text-green-700' :
                        apt.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>📅 {apt.date}</span>
                      <span>⏰ {apt.time}</span>
                    </div>
                    {apt.reason && <p className="text-xs text-slate-400 mt-1 italic">{apt.reason}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="glass p-6 rounded-3xl mt-6">
            <h3 className="text-xl font-bold mb-4">My Purchases</h3>
            {myPurchases.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No purchases made yet</p>
            ) : (
              <div className="space-y-3">
                {[...myPurchases].reverse().map((purchase: any) => (
                  <div key={purchase.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm">{purchase.productName}</p>
                        <p className="text-xs text-slate-500">₹{purchase.price}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        purchase.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        purchase.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {purchase.status || 'Ordered'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                      <span>📅 {new Date(purchase.purchasedAt).toLocaleDateString()}</span>
                    </div>
                    {(!purchase.status || purchase.status === 'Ordered') && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => handlePurchaseStatus(purchase.id, 'Delivered')}
                          className="flex-1 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 rounded-lg transition-colors"
                        >
                          Mark Delivered
                        </button>
                        <button
                          onClick={() => handlePurchaseStatus(purchase.id, 'Cancelled')}
                          className="flex-1 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 rounded-lg transition-colors"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
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
