'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DoctorOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [qualification, setQualification] = useState('');
  const [college, setCollege] = useState('');
  const [studyStatus, setStudyStatus] = useState('');
  const [studyYear, setStudyYear] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('Invalid registration link. User ID is missing.');
    }
  }, [userId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = existingUsers.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      setError('User not found. Please register first.');
      return;
    }

    // Update user with educational details
    existingUsers[userIndex] = {
      ...existingUsers[userIndex],
      education: {
        qualification,
        college,
        status: studyStatus,
        year: studyStatus === 'Studying' ? studyYear : undefined,
      },
      onboardingComplete: true,
    };

    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    // If the currently logged-in user is this user, update currentUser as well
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.id === userId) {
      localStorage.setItem('currentUser', JSON.stringify(existingUsers[userIndex]));
    }

    alert('Educational details saved successfully!');
    router.push('/dashboard/doctor');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="glass p-8 rounded-3xl w-full max-w-md text-center shadow-xl">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Doctor Profile Setup</h1>
          <p className="text-slate-500">
            Please provide your educational details to complete your registration.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Qualification</label>
            <input
              type="text"
              required
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. BPT, MPT, MBBS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">College Name</label>
            <input
              type="text"
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your college or university name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Current Status</label>
            <select
              required
              value={studyStatus}
              onChange={(e) => {
                setStudyStatus(e.target.value);
                if (e.target.value !== 'Studying') setStudyYear('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select status...</option>
              <option value="Completed">Completed</option>
              <option value="Internship">Internship</option>
              <option value="Studying">Currently Studying</option>
            </select>
          </div>

          {studyStatus === 'Studying' && (
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Which year of studying?</label>
              <input
                type="text"
                required
                value={studyYear}
                onChange={(e) => setStudyYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 3rd Year"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover-lift shadow-lg shadow-primary/20 mt-4"
          >
            Save Details
          </button>
        </form>
      </div>
    </div>
  );
}
