'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const SERVICE_PROCEDURES_LIST = [
  "Initial Physiotherapy Assessment", "Post-Surgical Rehabilitation", "Stroke Rehabilitation", 
  "Parkinson's Therapy", "Post-Fracture Rehab", "Back Pain Management", "Neck Pain / Cervical Spondylosis", 
  "Knee Pain / Osteoarthritis Therapy", "Frozen Shoulder Therapy", "COPD /Respiratory Rehab", 
  "Geriatric Physiotherapy", "Pediatric Physiotherapy", "Sports Injury Rehab", "Orthopedic Physiotherapy", 
  "Neurological Physiotherapy", "Cardiac Rehabilitation", "Chest Physiotherapy", "Balance and Gait Training", 
  "Electrical Modalities (TENS/IFT/Ultrasound)", "Laser Therapy", "Dry Needling / Cupping", 
  "TheraBand / Resistance Training", "Passive Range of Motion (PROM)", "Postnatal Physiotherapy", 
  "Postural Correction Therapy"
];

const BLS_ACLS_LIST = ["Basic Life Support (BLS)", "Advanced Cardiac Life Support (ACLS)"];
const EQUIPMENT_LIST = ["Portable TENS Unit", "Exercise bands", "Ultrasound therapy machine"];
const LANGUAGES_LIST = ["Tamil", "English", "Malayalam", "Telugu", "Hindi", "Kannada"];
const EXPERIENCE_LIST = ["less than 6 months", "1 year", "2 years", "3 years", "More than 3 years"];
const GENDER_LIST = ["Male", "Female", "Other"];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  
  // Basic Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  
  // Doctor Specific Info
  const [gender, setGender] = useState('Male');
  const [qualification, setQualification] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [experience, setExperience] = useState('less than 6 months');
  const [specialization, setSpecialization] = useState('');
  const [prevEmpTitle, setPrevEmpTitle] = useState('');
  const [prevEmpClinic, setPrevEmpClinic] = useState('');
  
  // OTP States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('');
  
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('');

  // Arrays
  const [serviceProcedures, setServiceProcedures] = useState<string[]>([]);
  const [blsAcls, setBlsAcls] = useState<string[]>([]);
  const [specialEquipment, setSpecialEquipment] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  // Files
  const [degreePhoto, setDegreePhoto] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [aadharCard, setAadharCard] = useState<File | null>(null);

  const [toast, setToast] = useState<{show: boolean; message: string; type: 'success'|'error'}>({show: false, message: '', type: 'success'});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  const handleSendEmailOtp = async () => {
    if (!email) {
      showToast('Please enter an email address first.', 'error');
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedEmailOtp(otp);
    
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email', contact: email, otp })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to send Email OTP');
      }
      
      setEmailOtpSent(true);
      showToast('OTP sent to your email successfully!', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(`Error: ${error.message || 'sending Email OTP'}`, 'error');
    }
  };

  const handleVerifyEmailOtp = () => {
    if (emailOtp === generatedEmailOtp) {
      setIsEmailVerified(true);
      showToast('Email verified successfully!', 'success');
    } else {
      showToast('Invalid Email OTP.', 'error');
    }
  };

  const handleSendPhoneOtp = async () => {
    if (!phone) {
      showToast('Please enter a phone number first.', 'error');
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPhoneOtp(otp);
    
    // Fallback to Mock OTP since Fast2SMS requires payment
    setPhoneOtpSent(true);
    showToast(`OTP for Phone sent: ${otp} (Mock)`, 'success');
  };

  const handleVerifyPhoneOtp = () => {
    if (phoneOtp === generatedPhoneOtp) {
      setIsPhoneVerified(true);
      showToast('Phone verified successfully!', 'success');
    } else {
      showToast('Invalid Phone OTP.', 'error');
    }
  };

  const toggleArrayItem = (item: string, array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const uploadFile = async (file: File | null, prefix: string, userId: string): Promise<string | null> => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${prefix}-${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('doctor-documents')
      .upload(fileName, file);
    
    if (error) {
      console.error(`Error uploading ${prefix}:`, error);
      return null;
    }
    
    const { data } = supabase.storage.from('doctor-documents').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'doctor' || role === 'nurse') {
      if (!isEmailVerified) {
        showToast('Please verify your email address before registering.', 'error');
        return;
      }
      if (!isPhoneVerified) {
        showToast('Please verify your phone number before registering.', 'error');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    // 1. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setIsSubmitting(false);
      showToast(authError.message || 'Registration failed.', 'error');
      return;
    }

    if (!authData.user) {
      setIsSubmitting(false);
      showToast('Registration failed. Please try again.', 'error');
      return;
    }

    const newName = `${firstName} ${lastName}`.trim();
    let degreeUrl = null;
    let profileUrl = null;
    let aadharUrl = null;

    if (role === 'doctor' || role === 'nurse') {
      degreeUrl = await uploadFile(degreePhoto, 'degree', authData.user.id);
      profileUrl = await uploadFile(profilePhoto, 'profile', authData.user.id);
      aadharUrl = await uploadFile(aadharCard, 'aadhar', authData.user.id);
    }

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
          phone,
          qualification: (role === 'doctor' || role === 'nurse') ? qualification : null,
          clinic_name: (role === 'doctor' || role === 'nurse') ? clinicName : null,
          gender: (role === 'doctor' || role === 'nurse') ? gender : null,
          college_name: (role === 'doctor' || role === 'nurse') ? collegeName : null,
          experience: (role === 'doctor' || role === 'nurse') ? experience : null,
          specialization: (role === 'doctor' || role === 'nurse') ? specialization : null,
          previous_employment_title: (role === 'doctor' || role === 'nurse') ? prevEmpTitle : null,
          previous_employment_clinic: (role === 'doctor' || role === 'nurse') ? prevEmpClinic : null,
          service_procedures: (role === 'doctor' || role === 'nurse') ? serviceProcedures : null,
          bls_acls_services: (role === 'doctor' || role === 'nurse') ? blsAcls : null,
          special_equipment: (role === 'doctor' || role === 'nurse') ? specialEquipment : null,
          languages_known: (role === 'doctor' || role === 'nurse') ? languages : null,
          degree_photo_url: (role === 'doctor' || role === 'nurse') ? degreeUrl : null,
          profile_photo_url: (role === 'doctor' || role === 'nurse') ? profileUrl : null,
          aadhar_card_url: (role === 'doctor' || role === 'nurse') ? aadharUrl : null,
          status: (role === 'doctor' || role === 'nurse') ? 'pending' : 'approved',
        }
      ]);

    if (profileError) {
      setIsSubmitting(false);
      // eslint-disable-next-line no-console
      console.error(profileError);
      showToast('Failed to create user profile: ' + profileError.message, 'error');
      return;
    }
    
    localStorage.setItem('userRole', role);
    localStorage.setItem('currentUser', JSON.stringify({ id: authData.user.id, email, name: newName, role, address }));

    if (role === 'doctor' || role === 'nurse') {
      await supabase.auth.signOut();
      showToast('Registration successful! Please wait for Admin approval to login.', 'success');
    } else {
      showToast('Registration successful! Welcome to PhysioByHarish.', 'success');
    }

    setTimeout(() => {
      if (role === 'doctor') {
        router.push('/login/doctor');
      } else if (role === 'nurse') {
        router.push('/login/nurse');
      } else {
        router.push(`/dashboard/${role}`);
      }
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
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
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-3xl shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center mb-2">Create an Account</h1>
        <p className="text-slate-500 text-center mb-8">Join PhysioByHarish and get started</p>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Role Selection */}
          <div className="flex justify-center mb-8">
             <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`py-2 px-8 text-sm font-semibold rounded-lg transition-all ${
                  role === 'patient' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`py-2 px-8 text-sm font-semibold rounded-lg transition-all ${
                  role === 'doctor' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Doctor
              </button>
              <button
                type="button"
                onClick={() => setRole('nurse')}
                className={`py-2 px-8 text-sm font-semibold rounded-lg transition-all ${
                  role === 'nurse' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Nurse
              </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" placeholder="Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email address</label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={isEmailVerified && (role === 'doctor' || role === 'nurse')} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50" placeholder="john@example.com" />
                  {(role === 'doctor' || role === 'nurse') && !isEmailVerified && (
                    <button type="button" onClick={handleSendEmailOtp} className="px-4 py-3 bg-primary text-white font-semibold rounded-xl whitespace-nowrap hover:bg-primary/90">
                      {emailOtpSent ? 'Resend' : 'Verify'}
                    </button>
                  )}
                  {(role === 'doctor' || role === 'nurse') && isEmailVerified && (
                    <span className="px-4 py-3 bg-green-100 text-green-700 font-semibold rounded-xl flex items-center whitespace-nowrap">✓ Verified</span>
                  )}
                </div>
                {(role === 'doctor' || role === 'nurse') && emailOtpSent && !isEmailVerified && (
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" placeholder="Enter OTP" />
                    <button type="button" onClick={handleVerifyEmailOtp} className="px-4 py-3 bg-green-600 text-white font-semibold rounded-xl whitespace-nowrap hover:bg-green-700">
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} disabled={isPhoneVerified && (role === 'doctor' || role === 'nurse')} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50" placeholder="+91 9876543210" />
                  {(role === 'doctor' || role === 'nurse') && !isPhoneVerified && (
                    <button type="button" onClick={handleSendPhoneOtp} className="px-4 py-3 bg-primary text-white font-semibold rounded-xl whitespace-nowrap hover:bg-primary/90">
                      {phoneOtpSent ? 'Resend' : 'Verify'}
                    </button>
                  )}
                  {(role === 'doctor' || role === 'nurse') && isPhoneVerified && (
                    <span className="px-4 py-3 bg-green-100 text-green-700 font-semibold rounded-xl flex items-center whitespace-nowrap">✓ Verified</span>
                  )}
                </div>
                {(role === 'doctor' || role === 'nurse') && phoneOtpSent && !isPhoneVerified && (
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" placeholder="Enter OTP" />
                    <button type="button" onClick={handleVerifyPhoneOtp} className="px-4 py-3 bg-green-600 text-white font-semibold rounded-xl whitespace-nowrap hover:bg-green-700">
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" placeholder="••••••••" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Address / City</label>
            <textarea required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-primary outline-none" placeholder="123 Main St, City" rows={2}></textarea>
          </div>

          {/* DOCTOR & NURSE SPECIFIC FIELDS */}
          {(role === 'doctor' || role === 'nurse') && (
            <div className="space-y-8 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-primary">Professional Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700">
                    {GENDER_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Experience</label>
                  <select value={experience} onChange={e => setExperience(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700">
                    {EXPERIENCE_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Qualification</label>
                  <input type="text" required value={qualification} onChange={e => setQualification(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary" placeholder="BPT, MPT" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">College Name</label>
                  <input type="text" required value={collegeName} onChange={e => setCollegeName(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary" placeholder="University Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Specialization</label>
                  <input type="text" required value={specialization} onChange={e => setSpecialization(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary" placeholder="Orthopedics" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Current Clinic / Hospital Name</label>
                  <input type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary" placeholder="City Care Clinic" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Previous Employment - Job Title</label>
                  <input type="text" value={prevEmpTitle} onChange={e => setPrevEmpTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary" placeholder="Senior Physiotherapist" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Previous Employment - Clinic/Duration</label>
                  <input type="text" value={prevEmpClinic} onChange={e => setPrevEmpClinic(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary" placeholder="Apollo Hospital, 2 years" />
                </div>
              </div>

              {/* Service Procedures (Checkboxes) */}
              <div>
                <label className="block text-sm font-medium mb-4">Service Procedures Offered (Select multiple)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-64 overflow-y-auto p-4 border rounded-xl dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  {SERVICE_PROCEDURES_LIST.map(service => (
                    <label key={service} className="flex items-center space-x-3 text-sm">
                      <input 
                        type="checkbox" 
                        checked={serviceProcedures.includes(service)}
                        onChange={() => toggleArrayItem(service, serviceProcedures, setServiceProcedures)}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium mb-3">Languages Known</label>
                <div className="flex flex-wrap gap-4">
                  {LANGUAGES_LIST.map(lang => (
                    <label key={lang} className="flex items-center space-x-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={languages.includes(lang)}
                        onChange={() => toggleArrayItem(lang, languages, setLanguages)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span>{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Equipment & BLS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Special Equipment Available</label>
                  <div className="space-y-2">
                    {EQUIPMENT_LIST.map(eq => (
                      <label key={eq} className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" checked={specialEquipment.includes(eq)} onChange={() => toggleArrayItem(eq, specialEquipment, setSpecialEquipment)} className="rounded text-primary" />
                        <span>{eq}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Do you provide the following services?</label>
                  <div className="space-y-2">
                    {BLS_ACLS_LIST.map(svc => (
                      <label key={svc} className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" checked={blsAcls.includes(svc)} onChange={() => toggleArrayItem(svc, blsAcls, setBlsAcls)} className="rounded text-primary" />
                        <span>{svc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="p-4 border rounded-xl dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-900/50">
                  <label className="block text-sm font-medium mb-3">Profile Photo *</label>
                  <input type="file" required accept="image/*" onChange={e => setProfilePhoto(e.target.files?.[0] || null)} className="w-full text-sm" />
                </div>
                <div className="p-4 border rounded-xl dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-900/50">
                  <label className="block text-sm font-medium mb-3">Degree Photo *</label>
                  <input type="file" required accept="image/*,.pdf" onChange={e => setDegreePhoto(e.target.files?.[0] || null)} className="w-full text-sm" />
                </div>
                <div className="p-4 border rounded-xl dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-900/50">
                  <label className="block text-sm font-medium mb-3">Aadhar Card *</label>
                  <input type="file" required accept="image/*,.pdf" onChange={e => setAadharCard(e.target.files?.[0] || null)} className="w-full text-sm" />
                </div>
              </div>
              <p className="text-xs text-red-500 text-center font-semibold">
                * Note: File uploads require the "doctor-documents" bucket to be created in Supabase Storage!
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg shadow-lg mt-8 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover-lift shadow-primary/20'}`}
          >
            {isSubmitting ? 'Creating Account & Uploading...' : 'Create Account'}
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
