'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockProducts } from '@/data/mock';
import { supabase } from '@/lib/supabase';

export default function StorePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<(typeof mockProducts[0] & { selectedSize?: string }) | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [wishlist, setWishlist] = useState<string[]>([]);

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  useEffect(() => {
    async function fetchSession() {
      if (typeof window !== 'undefined' && sessionStorage.getItem('adminAuth') === 'true') {
        setIsLoggedIn(true);
        setUserRole('admin');
        const adminProfile = JSON.parse(localStorage.getItem('currentUser') || '{}');
        setCurrentUser(adminProfile);
        
        const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${adminProfile.id || 'admin'}`) || '[]');
        setWishlist(storedWishlist);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        setCurrentUser(session.user);
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile) setUserRole(profile.role);

        // Keep wishlist in localStorage but keyed by Supabase user ID
        const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${session.user.id}`) || '[]');
        setWishlist(storedWishlist);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
        setCurrentUser(null);
      }
    }
    fetchSession();
  }, []);

  const toggleWishlist = (productId: string) => {
    if (!isLoggedIn || !currentUser) {
      router.push('/login');
      return;
    }

    setWishlist(prev => {
      const newWishlist = prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      
      localStorage.setItem(`wishlist_${currentUser.id}`, JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const handlePurchaseClick = (product: typeof mockProducts[0]) => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    const size = selectedSizes[product.id] || (product.sizes ? product.sizes[0] : undefined);
    setSelectedProduct({ ...product, selectedSize: size });
  };

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    const size = selectedSizes[product.id] || (product.sizes ? product.sizes[0] : undefined);
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = currentCart.find((item: any) => item.id === product.id && item.size === size);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({ ...product, size, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(currentCart));
    alert(`${product.name}${size ? ` (Size: ${size})` : ''} has been added to your cart!`);
  };

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (method: 'COD' | 'UPI') => {
    if (!selectedProduct || !currentUser) return;
    const price = selectedProduct.price;
    
    const newPurchase = {
      user_id: currentUser.id,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      size: selectedProduct.selectedSize || null,
      price,
      payment_method: method,
      status: 'Ordered',
    };

    const { data: insertedData, error } = await supabase.from('purchases').insert([newPurchase]).select();
    
    if (error) {
      console.error(error);
      alert('Failed to complete purchase. Please try again.');
      return;
    }

    const purchase_id = insertedData?.[0]?.id;
    
    if (method === 'UPI') {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // Create order by calling our backend
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price, receipt: `receipt_${purchase_id}` })
      });
      const orderData = await orderResponse.json();

      if (!orderData || orderData.error) {
        alert('Server error. Are you online?');
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummykey12345', 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PhysioByHarish',
        description: `Payment for ${selectedProduct.name}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              purchase_id: purchase_id,
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert(`Payment of ₹${price} successful! Purchase completed.`);
            
            // Send SMS notification
            try {
              await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: `Payment Received for ${selectedProduct.name} at PhysioByHarish. Amount: Rs ${price}. Payment: ${method}.`,
                  number: '6385842977'
                })
              });
            } catch(e) {
              console.error(e);
            }
          } else {
            alert('Payment verification failed!');
          }
        },
        prefill: {
          name: currentUser.user_metadata?.full_name || 'Customer',
          email: currentUser.email,
        },
        theme: {
          color: '#2563eb' // Matches primary blue theme
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } else {
      // COD Logic
      try {
        await fetch('/api/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Order received for ${selectedProduct.name} at PhysioByHarish. Amount: Rs ${price}. Payment: COD.`,
            number: '6385842977'
          })
        });
      } catch(e) {
        console.error(e);
      }
      alert(`Successfully purchased ${selectedProduct.name} for ₹${price} via Cash on Delivery!\n\n📱 SMS sent to 6385842977: Order received for ${selectedProduct.name}.`);
    }

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
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-72"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {(userRole === 'doctor' || userRole === 'admin') && (
            <button
              onClick={() => router.push('/store/purchase-equipment')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-semibold whitespace-nowrap hover:bg-accent transition-colors shadow-md"
            >
              Purchase Equipment
            </button>
          )}
        </div>
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm transition-colors ${
                  wishlist.includes(product.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                }`}
                title={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                {wishlist.includes(product.id) ? '❤️' : '🤍'}
              </button>
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

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Size</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(product.id, size)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          (selectedSizes[product.id] || product.sizes![0]) === size
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
              {selectedProduct.selectedSize && (
                <p className="text-primary font-medium mt-1">Size: {selectedProduct.selectedSize}</p>
              )}
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
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePurchase('COD')}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
              >
                <span>💵</span> Cash on Delivery
              </button>
              <button
                onClick={() => handlePurchase('UPI')}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <span>📱</span> Pay with UPI
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full py-3 rounded-xl border border-gray-300 dark:border-gray-700 font-semibold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
