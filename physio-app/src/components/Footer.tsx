export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold gradient-text mb-4">PhysioByHarish</h3>
            <p className="text-slate-500 dark:text-slate-400">
              Delivering premium physiotherapy services and high-quality orthopedic equipment directly to your home.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Contact Us</h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li className="flex items-center">
                <span className="mr-2">📞</span> +1 (800) PHYSIO-1
              </li>
              <li className="flex items-center">
                <span className="mr-2">✉️</span> support@physiobyharish.com
              </li>
              <li className="flex items-center">
                <span className="mr-2">📍</span> 123 Wellness Avenue, Health City, HC 40501
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400">
              <li>
                <a href="/store" className="hover:text-primary transition-colors">Store</a>
              </li>
              <li>
                <a href="/login" className="hover:text-primary transition-colors">Login to Portal</a>
              </li>
              <li>
                <a href="/register" className="hover:text-primary transition-colors">Register</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} PhysioByHarish. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
