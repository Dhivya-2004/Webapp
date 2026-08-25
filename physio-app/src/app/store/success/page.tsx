import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass max-w-lg w-full p-8 md:p-12 rounded-3xl text-center flex flex-col items-center border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-extrabold mb-4 gradient-text">
          Order Placed!
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Thank you for your purchase. Your order has been successfully placed and is now being processed. We&apos;ll keep you updated on its status!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link href="/my-orders" className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-bold rounded-xl hover-lift shadow-lg shadow-primary/20 transition-all text-center">
            View My Orders
          </Link>
          <Link href="/store" className="flex-1 py-3 px-6 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold rounded-xl hover-lift transition-all text-center border border-slate-200 dark:border-slate-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
