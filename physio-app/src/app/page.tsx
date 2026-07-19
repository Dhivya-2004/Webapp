import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center overflow-hidden bg-gradient-to-b from-secondary to-background pt-16 pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Expert Physiotherapy, <br className="hidden md:block" />
            <span className="gradient-text">Right at Your Doorstep</span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10">
            Book certified physiotherapists for home visits or purchase premium orthopedic equipment directly from our store.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
            <Link
              href="/dashboard/patient"
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover-lift shadow-lg shadow-primary/30"
            >
              Book an Appointment
            </Link>
            <Link
              href="/store"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-foreground border border-gray-200 dark:border-gray-700 rounded-full font-semibold text-lg hover-lift shadow-lg"
            >
              Purchase Equipment
            </Link>
            <Link
              href="https://wa.me/916385842977?text=Hello,%20I%20would%20like%20to%20book%20a%20physiotherapy%20appointment."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#25D366] text-white rounded-full font-semibold text-lg hover-lift shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp Booking</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Why Choose PhysioByHarish?</h2>
            <p className="mt-4 text-lg text-slate-500">Comprehensive care and premium equipment.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass p-8 rounded-2xl hover-lift">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Booking</h3>
              <p className="text-slate-500">Schedule appointments instantly with available doctors in your area.</p>
            </div>

            {/* Feature 2 */}
            <div className="glass p-8 rounded-2xl hover-lift">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Home Visits</h3>
              <p className="text-slate-500">Professional physiotherapists come to your home for personalized care.</p>
            </div>

            {/* Feature 3 */}
            <div className="glass p-8 rounded-2xl hover-lift">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Store</h3>
              <p className="text-slate-500">Buy authentic orthopedic products from top brands like Dyna and Tynor.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
