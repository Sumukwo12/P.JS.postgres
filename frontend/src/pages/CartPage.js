import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Lock, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { items, updateItem, removeItem, total, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fmt = (n) => n?.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });
  const shipping   = total >= 5000 ? 0 : 300;
  const grandTotal = total + shipping;

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-white mb-2">Your Cart</h1>
        <p className="text-gray-500 mb-8">{items.length} {items.length === 1 ? 'item' : 'items'}</p>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag size={64} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-8">Add some products to get started</p>
            <Link to="/products" className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-3 rounded-full font-semibold hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-500/20">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => {
                const product  = item.product;
                const itemTotal = product.price * item.quantity;
                return (
                  <div key={item.id} className="bg-dark-800/60 backdrop-blur-sm border border-white/8 rounded-2xl p-4 flex gap-4 hover:border-white/15 transition-all">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-dark-700 flex-shrink-0">
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm mb-1 truncate">{product.name}</h3>
                      {item.selected_variants && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {Object.entries(item.selected_variants).map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-white/5 border border-white/10 text-gray-400 px-1.5 py-0.5 rounded">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                      {product.category && (
                        <span className="text-gray-500 text-xs">{product.category.name}</span>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 bg-dark-700 rounded-lg p-0.5">
                          <button onClick={() => updateItem(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded">
                            <Minus size={12} />
                          </button>
                          <span className="text-white text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateItem(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded">
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-brand-400 font-bold font-display">{fmt(itemTotal)}</span>
                          <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-dark-800/60 backdrop-blur-sm border border-white/8 rounded-2xl p-6 sticky top-24">
                <h2 className="text-white font-semibold text-lg mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span className="text-white">{fmt(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-400 font-medium' : 'text-white'}>
                      {shipping === 0 ? 'Free' : fmt(shipping)}
                    </span>
                  </div>
                  {total < 5000 && (
                    <p className="text-xs text-gray-600">Add {fmt(5000 - total)} more for free delivery</p>
                  )}
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-brand-400 font-bold font-display text-xl">{fmt(grandTotal)}</span>
                  </div>
                </div>

                {/* Checkout button — requires login */}
                {user ? (
                  <button
                    onClick={() => navigate('/checkout')}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <div>
                    {/* Login required notice */}
                    <div className="flex items-start gap-2 bg-brand-500/8 border border-brand-500/20 rounded-xl px-3 py-3 mb-3">
                      <Lock size={13} className="text-brand-400 flex-shrink-0 mt-0.5" />
                      <p className="text-brand-300 text-xs leading-relaxed">
                        Sign in to place your order and pay securely via M-Pesa.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Link
                        to="/login?redirect=/checkout"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25"
                      >
                        <LogIn size={18} /> Sign In to Checkout
                      </Link>
                      <Link
                        to="/register?redirect=/checkout"
                        className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/12 hover:bg-white/10 text-gray-300 py-3 rounded-xl font-medium text-sm transition-all"
                      >
                        Create a Free Account
                      </Link>
                    </div>
                  </div>
                )}

                <Link to="/products" className="block text-center text-gray-500 text-sm mt-4 hover:text-gray-300 transition-colors">
                  Continue Shopping
                </Link>

                {/* M-Pesa badge */}
                <div className="mt-5 pt-4 border-t border-white/8 flex items-center justify-center gap-2 text-gray-500 text-xs">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white font-black text-xs">M</div>
                  <span>Payments powered by M-Pesa</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
