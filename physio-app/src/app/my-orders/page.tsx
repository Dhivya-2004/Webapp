'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockProducts } from '@/data/mock';

interface Purchase {
  id: string;
  productId: string;
  productName: string;
  size?: string;
  price: number;
  status: string;
  patientEmail: string;
  patientName: string;
  purchasedAt: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'cart'>('orders');
  const [orders, setOrders] = useState<Purchase[]>([]);
  const [wishlistItems, setWishlistItems] = useState<typeof mockProducts>([]);
  const [cartItems, setCartItems] = useState<(typeof mockProducts[0] & { quantity: number, size?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role) {
      router.push('/login');
      return;
    }
    
    setIsLoggedIn(true);
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const allPurchases: Purchase[] = JSON.parse(localStorage.getItem('purchases') || '[]');
    
    // Filter by user email
    const userOrders = allPurchases.filter(p => p.patientEmail === currentUser.email);
    // Sort by date descending
    userOrders.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
    
    setOrders(userOrders);

    // Load wishlist
    const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${currentUser.email}`) || '[]');
    const items = mockProducts.filter(p => storedWishlist.includes(p.id));
    setWishlistItems(items);

    // Load cart
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(storedCart);

    setIsLoading(false);
  }, [router]);

  const removeFromWishlist = (productId: string) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email) return;
    const storedWishlist = JSON.parse(localStorage.getItem(`wishlist_${currentUser.email}`) || '[]');
    const newWishlist = storedWishlist.filter((id: string) => id !== productId);
    localStorage.setItem(`wishlist_${currentUser.email}`, JSON.stringify(newWishlist));
    setWishlistItems(prev => prev.filter(p => p.id !== productId));
  };

  const removeFromCart = (productId: string, size?: string) => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const newCart = storedCart.filter((item: any) => !(item.id === productId && item.size === size));
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCartItems(newCart);
  };

  if (isLoading || !isLoggedIn) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight gradient-text mb-2">
          Dashboard
        </h1>
        <p className="text-lg text-slate-500">
          View and track your previous purchases or items you love.
        </p>
      </div>

      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700 mb-8 pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'orders'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          My Orders
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'wishlist'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Wishlist
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'cart'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          My Cart
        </button>
      </div>

      {activeTab === 'orders' ? (
        orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-5xl mb-4">🛍️</div>
          <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            You haven't made any purchases yet. Head over to our store to browse our physiotherapy products.
          </p>
          <button
            onClick={() => router.push('/store')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-accent transition-colors shadow-sm"
          >
            Browse Store
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{order.productName}</h3>
                    {order.size && (
                      <span className="inline-block mt-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">
                        Size: {order.size}
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'Delivered' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {order.status || 'Processing'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Order ID</p>
                    <p className="font-medium text-sm mt-1">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Date</p>
                    <p className="font-medium text-sm mt-1">
                      {new Date(order.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Price</p>
                    <p className="font-medium text-sm mt-1 text-primary">₹{order.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )
      ) : activeTab === 'wishlist' ? (
        wishlistItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-5xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              You haven't added any products to your wishlist yet.
            </p>
            <button
              onClick={() => router.push('/store')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-accent transition-colors shadow-sm"
            >
              Browse Store
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product.id}
                className="glass rounded-2xl overflow-hidden hover-lift flex flex-col border border-slate-200 dark:border-slate-700 relative"
              >
                <div className="relative h-48 w-full bg-white dark:bg-slate-800 flex items-center justify-center p-2 cursor-pointer" onClick={() => router.push('/store')}>
                  <img src={product.image} alt={product.name} className="h-full w-full object-contain rounded-xl" />
                </div>
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-red-500 hover:scale-110 transition-transform shadow-sm"
                  title="Remove from wishlist"
                >
                  ❤️
                </button>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-base mb-2 leading-snug line-clamp-2">{product.name}</h3>
                  <div className="text-lg font-extrabold text-blue-700 dark:text-blue-400 mt-auto">
                    ₹{product.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        cartItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-5xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              You haven't added any products to your cart yet.
            </p>
            <button
              onClick={() => router.push('/store')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-accent transition-colors shadow-sm"
            >
              Browse Store
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {cartItems.map((item, index) => (
              <div
                key={`${item.id}-${item.size}-${index}`}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 items-center"
              >
                <div className="h-24 w-24 bg-slate-50 dark:bg-slate-900 rounded-xl p-2 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  {item.size && (
                    <span className="inline-block mt-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full">
                      Size: {item.size}
                    </span>
                  )}
                  <div className="flex gap-6 mt-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Quantity</p>
                      <p className="font-medium text-sm mt-1">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Price</p>
                      <p className="font-medium text-sm mt-1 text-primary">₹{item.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Total</p>
                      <p className="font-bold text-sm mt-1 text-primary">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id, item.size)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-slate-500 font-medium">Cart Total</p>
                <p className="text-2xl font-extrabold text-primary">
                  ₹{cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                </p>
              </div>
              <button
                onClick={() => router.push('/store')}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-accent transition-colors shadow-lg shadow-primary/20"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
