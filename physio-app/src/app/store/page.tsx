'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockProducts } from '@/data/mock';

export default function StorePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setIsLoggedIn(!!role);
  }, []);

  const handlePurchaseClick = (product: typeof mockProducts[0]) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setSelectedProduct(product);
  };

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = currentCart.find((item: any) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(currentCart));
    alert(`${product.name} has been added to your cart!`);
  };

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePurchase = async () => {
    if (!selectedProduct) return;
    const price = selectedProduct.price;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const purchases = JSON.parse(localStorage.getItem('purchases') || '[]');
    purchases.push({
      id: `pur${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      price,
      status: 'Ordered',
      patientEmail: currentUser.email || 'Unknown',
      patientName: currentUser.name || currentUser.email || 'Unknown',
      purchasedAt: new Date().toISOString(),
    });
    localStorage.setItem('purchases', JSON.stringify(purchases));
    
    try {
      await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Order received for ${selectedProduct.name} at PhysioByHarish. Amount: Rs ${price}.`,
          number: '6385842977'
        })
      });
    } catch(e) {
      console.error(e);
    }

    alert(`Successfully purchased ${selectedProduct.name} for ₹${price}!\n\n📱 SMS sent to 6385842977: Order received for ${selectedProduct.name}.`);
    setSelectedProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Login required banner for guests */}
      {!isLoggedIn && (
        <div className="mb-6 flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl">
          <span className="text-2xl">🔒</span>
          <div className="flex-1">
            <p className="font-semibold text-amber-800 dark:text-amber-300">Login required to purchase</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">You can browse products freely, but you need to log in to make a purchase.</p>
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
          >
            Login Now
          </a>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">
            Physiotherapy Store
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Browse our catalog of premium physiotherapy equipment.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search products..."
          className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-72"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6 text-sm font-medium">
        <span className="text-slate-500">
          Showing <strong className="text-foreground">{filteredProducts.length}</strong> of 20 products
        </span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="glass rounded-2xl overflow-hidden hover-lift flex flex-col border border-slate-200 dark:border-slate-700"
          >
            {/* Image area */}
            <div className="relative h-48 w-full bg-white dark:bg-slate-800 flex items-center justify-center p-2">
              <img src={product.image} alt={product.name} className="h-full w-full object-contain rounded-xl" />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-base mb-4 leading-snug line-clamp-2">
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Price</span>
                  <span className="text-lg font-extrabold text-blue-700 dark:text-blue-400">
                    ₹{product.price}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-auto">
                {isLoggedIn && (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 py-2 rounded-xl font-semibold transition-colors text-sm shadow-sm bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  >
                    Add to Cart
                  </button>
                )}
                <button
                  onClick={() => handlePurchaseClick(product)}
                  className={`flex-1 py-2 rounded-xl font-semibold transition-colors text-sm shadow-sm ${
                    isLoggedIn
                      ? 'bg-primary text-primary-foreground hover:bg-accent'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600'
                  }`}
                >
                  {isLoggedIn ? 'Purchase' : '🔒 Login'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-slate-500">No products found.</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 text-primary font-medium hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Purchase Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="h-24 w-24 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 p-2 overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-contain" />
              </div>
              <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
              <p className="text-slate-400 text-sm mt-1">Confirm your purchase</p>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 text-center">
              <p className="text-sm text-slate-500 mb-1">You are purchasing</p>
              <p className="font-bold text-foreground">{selectedProduct.name}</p>
              <p className="text-2xl font-extrabold text-primary mt-1">
                ₹{selectedProduct.price}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-700 font-semibold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-accent transition-colors shadow-lg shadow-primary/20"
              >
                Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
