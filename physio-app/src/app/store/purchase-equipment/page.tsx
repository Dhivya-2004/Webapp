'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Sample equipment data for doctors/admins
const sampleEquipment = [
  {
    id: 'equip_1',
    name: 'Advanced Ultrasound Therapy Machine',
    price: 45000,
    description: 'Professional grade ultrasound machine for clinical use with multiple frequencies.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'equip_2',
    name: 'Clinical Laser Therapy Unit',
    price: 85000,
    description: 'High-power class IV laser therapy unit for deep tissue treatment.',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];

export default function PurchaseEquipmentPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role === 'doctor' || role === 'admin') {
      setIsAuthorized(true);
    } else {
      // Redirect unauthorized users (like patients or guests) back to the store
      router.push('/store');
    }
    setLoading(false);
  }, [router]);

  const handlePurchase = (equipmentName: string) => {
    alert(`Request to purchase ${equipmentName} has been submitted to the administration.`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/store" className="text-primary hover:underline mb-4 inline-block">
          &larr; Back to Store
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight gradient-text">
          Clinical Equipment Portal
        </h1>
        <p className="mt-2 text-lg text-slate-500">
          Exclusive portal for Doctors and Admins to request professional equipment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {sampleEquipment.map((item) => (
          <div key={item.id} className="glass rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="h-64 w-full bg-white dark:bg-slate-800 overflow-hidden relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-90" />
              <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                Professional Only
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 flex-grow">{item.description}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => handlePurchase(item.name)}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-accent transition-colors shadow-md hover-lift"
                >
                  Request Purchase
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
