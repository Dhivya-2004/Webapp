import Link from 'next/link';

export default function LoginSelectionPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background px-4">
      <div className="glass p-8 md:p-12 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-extrabold text-center mb-2">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-8">How would you like to log in?</p>

        <div className="space-y-4">
          <Link href="/login/patient" className="block w-full">
            <div className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary p-4 rounded-xl flex items-center justify-between transition-all hover-lift shadow-sm">
              <div>
                <h3 className="font-bold text-lg">Patient Login</h3>
                <p className="text-sm text-slate-500">Access your portal and appointments</p>
              </div>
              <div className="text-primary text-xl">&rarr;</div>
            </div>
          </Link>

          <Link href="/login/doctor" className="block w-full">
            <div className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary p-4 rounded-xl flex items-center justify-between transition-all hover-lift shadow-sm">
              <div>
                <h3 className="font-bold text-lg">Doctor Login</h3>
                <p className="text-sm text-slate-500">Manage your patients and schedule</p>
              </div>
              <div className="text-primary text-xl">&rarr;</div>
            </div>
          </Link>

          <Link href="/login/admin" className="block w-full">
            <div className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary p-4 rounded-xl flex items-center justify-between transition-all hover-lift shadow-sm">
              <div>
                <h3 className="font-bold text-lg">Admin Login</h3>
                <p className="text-sm text-slate-500">System administration and oversight</p>
              </div>
              <div className="text-primary text-xl">&rarr;</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
