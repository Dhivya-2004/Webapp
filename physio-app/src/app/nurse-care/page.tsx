import Link from 'next/link';

export default function NurseCarePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          <span className="text-blue-600 dark:text-blue-400">Nurse Care</span> Portal
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-16">
          Connecting professional nurses with patients who need dedicated home care and medical assistance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Patient Card */}
          <div className="glass p-8 md:p-12 rounded-3xl hover-lift shadow-xl border border-blue-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🤒</span>
            </div>
            <h2 className="text-2xl font-bold mb-3">For Patients</h2>
            <p className="text-slate-500 mb-8 flex-grow">
              Looking for professional nursing care at home? Book a certified nurse.
            </p>
            <Link
              href="/login/patient"
              className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover-lift shadow-lg shadow-primary/20 transition-all"
            >
              Patient Login
            </Link>
          </div>

          {/* Nurse Card */}
          <div className="glass p-8 md:p-12 rounded-3xl hover-lift shadow-xl border border-emerald-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">👩‍⚕️</span>
            </div>
            <h2 className="text-2xl font-bold mb-3">For Nurses</h2>
            <p className="text-slate-500 mb-8 flex-grow">
              Are you a certified nurse? Register with us to provide home care services.
            </p>
            <Link
              href="/login/nurse"
              className="w-full px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover-lift shadow-lg shadow-emerald-600/20 transition-all"
            >
              Nurse Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
