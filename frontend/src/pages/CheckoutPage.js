import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Phone, MapPin, CheckCircle, Loader, Shield, Lock,
  LogIn, ChevronRight, User, Package, Smartphone,
  AlertCircle, RefreshCw, Clock
} from 'lucide-react';
import { ordersAPI, paymentAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const fmt = (n) =>
  n?.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });

const STEPS = [
  { label: 'Details',  icon: User       },
  { label: 'Payment',  icon: Smartphone },
  { label: 'Done',     icon: CheckCircle },
];

/* ── Step progress bar ───────────────────────────────────────────── */
function StepBar({ step }) {
  return (
    <div className="flex items-center mb-10">
      {STEPS.map((s, i) => {
        const Icon    = s.icon;
        const done    = i < step;
        const current = i === step;
        return (
          <div key={s.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                done    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                : current ? 'bg-brand-500 shadow-lg shadow-brand-500/30 ring-4 ring-brand-500/20'
                : 'bg-dark-700 border border-white/10'
              }`}>
                {done
                  ? <CheckCircle size={18} className="text-white" />
                  : <Icon size={16} className={current ? 'text-white' : 'text-gray-600'} />
                }
              </div>
              <span className={`text-xs font-medium ${done || current ? 'text-white' : 'text-gray-600'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mb-4 transition-all duration-700 ${
                i < step ? 'bg-gradient-to-r from-green-500 to-brand-500' : 'bg-dark-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Order summary panel ─────────────────────────────────────────── */
function Summary({ items, total, shipping }) {
  return (
    <div className="bg-dark-800/60 border border-white/8 rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Package size={15} className="text-brand-400" /> Order Summary
      </h3>
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-dark-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
              {item.product.image_url
                ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-lg">📦</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{item.product.name}</p>
              {item.selected_variants && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {Object.entries(item.selected_variants).map(([k, v]) => (
                    <span key={k} className="text-[9px] text-gray-400">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-gray-500 text-[10px]">x{item.quantity}</p>
            </div>
            <span className="text-brand-400 text-sm font-bold flex-shrink-0">
              {fmt(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/8 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
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
        <div className="border-t border-white/8 pt-2 flex justify-between">
          <span className="text-white font-semibold">Total</span>
          <span className="text-brand-400 font-bold font-display text-lg">{fmt(total + shipping)}</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/8 flex items-center gap-2 text-gray-500 text-xs">
        <Shield size={12} className="text-green-400 flex-shrink-0" />
        <span>Secured by SSL. Your data is protected.</span>
      </div>
    </div>
  );
}

/* ── Login gate ──────────────────────────────────────────────────── */
function LoginGate() {
  return (
    <div className="min-h-screen pt-24 px-4 pb-16 flex items-center justify-center">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-brand-500/10 border border-brand-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} className="text-brand-400" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-3">Sign In to Checkout</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          You need an account to place an order and pay via M-Pesa.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/login?redirect=/checkout"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25">
            <LogIn size={18} /> Sign In
          </Link>
          <Link to="/register?redirect=/checkout"
            className="flex-1 flex items-center justify-center bg-white/5 border border-white/15 hover:bg-white/10 text-white py-4 rounded-xl font-semibold transition-all">
            Create Account
          </Link>
        </div>
        <div className="mt-8 bg-dark-800/60 border border-white/8 rounded-2xl p-5 text-left">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Why sign in?</p>
          <div className="space-y-2.5">
            {[
              { icon: Shield,     text: 'Secure M-Pesa payment processing' },
              { icon: Package,    text: 'Track your orders in real-time'   },
              { icon: Clock,      text: 'View your full order history'      },
              { icon: Smartphone, text: 'Payment confirmation to your phone'},
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-gray-500 text-sm">
                <Icon size={13} className="text-brand-400 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <Link to="/products" className="mt-6 inline-flex text-gray-500 text-sm hover:text-gray-300 transition-colors">
          ← Continue browsing
        </Link>
      </div>
    </div>
  );
}

/* ── Main checkout ───────────────────────────────────────────────── */
export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user }                    = useAuth();
  const navigate                    = useNavigate();

  const [step,        setStep]        = useState(0);
  const [form,        setForm]        = useState({ shipping_address: '', phone: user?.phone || '' });
  const [order,       setOrder]       = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [mpesaPhone,  setMpesaPhone]  = useState(user?.phone || '');
  const [mpesaStatus, setMpesaStatus] = useState('idle'); // idle|sending|sent|polling|confirmed|error
  const [pollCount,   setPollCount]   = useState(0);
  const [error,       setError]       = useState('');
  const [fieldErr,    setFieldErr]    = useState({});

  const shipping   = total >= 5000 ? 0 : 300;
  const grandTotal = total + shipping;

  // Poll payment status after STK push
  const poll = useCallback(async () => {
    if (!order) return;
    try {
      const { data } = await paymentAPI.status(order.id);
      if (data.order_status === 'paid' || data.payment_status === 'success') {
        setMpesaStatus('confirmed');
        clearCart();
        setTimeout(() => setStep(2), 800);
      } else if (data.payment_status === 'failed') {
        setMpesaStatus('error');
        setError('Payment was cancelled or failed. Please try again.');
      } else {
        setPollCount(c => c + 1);
      }
    } catch {
      setPollCount(c => c + 1);
    }
  }, [order, clearCart]);

  useEffect(() => {
    if (mpesaStatus !== 'polling') return;
    if (pollCount >= 15) {
      setMpesaStatus('error');
      setError('Payment timed out. If you paid, contact support with your order number.');
      return;
    }
    const t = setTimeout(poll, 5000);
    return () => clearTimeout(t);
  }, [mpesaStatus, pollCount, poll]);

  if (!user)                              return <LoginGate />;
  if (items.length === 0 && step < 2)    return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-white text-xl font-semibold mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Add products before checking out</p>
        <button onClick={() => navigate('/products')}
          className="bg-brand-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-brand-400 transition-colors">
          Shop Now
        </button>
      </div>
    </div>
  );

  /* Validate shipping form */
  const validateForm = () => {
    const e = {};
    if (!form.shipping_address.trim()) e.shipping_address = 'Delivery address is required';
    if (!form.phone.trim())            e.phone = 'Phone number is required';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  /* Validate M-Pesa number */
  const validMpesa = () => {
    const c = mpesaPhone.replace(/\s|-/g, '');
    if (!c) { setError('Enter your M-Pesa phone number'); return false; }
    if (!/^(07|01|2547|2541|\+2547|\+2541)\d{7,8}$/.test(c)) {
      setError('Enter a valid Safaricom number e.g. 0712 345 678'); return false;
    }
    return true;
  };

  /* Create order */
  const createOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true); setError('');
    try {
      const { data } = await ordersAPI.create(form);
      setOrder(data);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create order. Please try again.');
    } finally { setLoading(false); }
  };

  /* Initiate M-Pesa STK Push */
  const payMpesa = async () => {
    if (!validMpesa()) return;
    setMpesaStatus('sending'); setError('');
    try {
      await paymentAPI.mpesa({ order_id: order.id, phone: mpesaPhone });
      setMpesaStatus('sent');
      setTimeout(() => { setMpesaStatus('polling'); setPollCount(0); }, 3000);
    } catch (err) {
      setMpesaStatus('error');
      setError(err.response?.data?.detail || 'M-Pesa request failed. Check your number and try again.');
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-white mb-1">Checkout</h1>
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Shield size={13} /> Secure checkout — payments processed by Safaricom
          </div>
        </div>

        <StepBar step={step} />

        {/* ── STEP 0: Shipping ── */}
        {step === 0 && (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <h2 className="font-display text-2xl font-bold text-white mb-6">Shipping Details</h2>
              <form onSubmit={createOrder} className="space-y-5">

                {/* Name read-only */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input value={user?.name || ''} readOnly
                      className="w-full bg-dark-700/40 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-gray-400 text-sm cursor-not-allowed" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Delivery Address *</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-3.5 text-gray-500" />
                    <textarea required rows={3} value={form.shipping_address}
                      onChange={e => { setForm(f => ({...f, shipping_address: e.target.value})); setFieldErr(fe => ({...fe, shipping_address:''})); }}
                      placeholder="Street, building, estate, town, county..."
                      className={`w-full bg-dark-800/60 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none resize-none transition-all ${fieldErr.shipping_address ? 'border-red-500/60' : 'border-white/10 focus:border-brand-400/60'}`} />
                  </div>
                  {fieldErr.shipping_address && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11}/>{fieldErr.shipping_address}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Contact Phone *</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input required value={form.phone}
                      onChange={e => { setForm(f => ({...f, phone: e.target.value})); setFieldErr(fe => ({...fe, phone:''})); }}
                      placeholder="0712 345 678"
                      className={`w-full bg-dark-800/60 border rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none transition-all ${fieldErr.phone ? 'border-red-500/60' : 'border-white/10 focus:border-brand-400/60'}`} />
                  </div>
                  {fieldErr.phone && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11}/>{fieldErr.phone}</p>}
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100">
                  {loading ? <Loader size={18} className="animate-spin" /> : <>Continue to Payment <ChevronRight size={16}/></>}
                </button>
              </form>
            </div>
            <div className="lg:col-span-2">
              <Summary items={items} total={total} shipping={shipping} />
            </div>
          </div>
        )}

        {/* ── STEP 1: M-Pesa Payment ── */}
        {step === 1 && order && (
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-white mb-1">Pay with M-Pesa</h2>
                <p className="text-gray-500 text-sm">Order #{order.id} · {fmt(grandTotal)}</p>
              </div>

              {/* User verified badge */}
              <div className="flex items-center gap-3 bg-dark-800/60 border border-white/8 rounded-xl px-4 py-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user.name}</p>
                  <p className="text-gray-500 text-xs truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-1 text-green-400 text-xs">
                  <Lock size={11} /> Verified
                </div>
              </div>

              {/* M-Pesa card */}
              <div className="bg-gradient-to-br from-green-950/60 via-dark-800/80 to-dark-800/60 border border-green-500/25 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600/20 to-green-900/10 border-b border-green-500/15 px-6 py-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                    <span className="text-white font-black text-xs leading-tight text-center">M<br/>PESA</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">Safaricom M-Pesa</p>
                    <p className="text-green-400 text-xs font-medium">STK Push Payment</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs font-medium">Secure</span>
                  </div>
                </div>

                <div className="p-6">
                  {/* How it works */}
                  <div className="bg-dark-900/40 rounded-xl p-4 mb-5">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">How it works</p>
                    <div className="space-y-2">
                      {['Enter your Safaricom M-Pesa number below',
                        'Click Pay — an STK prompt is sent to your phone',
                        'Enter your M-Pesa PIN to confirm',
                        'Order confirmed instantly!'].map((txt, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-xs flex items-center justify-center flex-shrink-0 font-bold mt-px">{i+1}</span>
                          <span className="text-gray-400 text-xs leading-relaxed">{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Phone input */}
                  <div className="mb-4">
                    <label className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">M-Pesa Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 bg-green-500/10 border border-green-500/20 rounded px-1.5 py-0.5 text-green-400 text-xs font-medium">+254</span>
                      <input value={mpesaPhone}
                        onChange={e => { setMpesaPhone(e.target.value); setError(''); }}
                        placeholder="0712 345 678"
                        disabled={['sending','sent','polling','confirmed'].includes(mpesaStatus)}
                        className="w-full bg-dark-900/60 border border-green-500/20 focus:border-green-400/60 rounded-xl pl-16 pr-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none transition-all disabled:opacity-50" />
                    </div>
                    <p className="text-gray-600 text-xs mt-1.5">Must be a Safaricom number with M-Pesa activated</p>
                  </div>

                  {/* Amount */}
                  <div className="bg-dark-900/60 border border-white/8 rounded-xl p-4 mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 text-sm">Amount</span>
                      <span className="text-white font-bold text-lg font-display">{fmt(grandTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">Reference</span>
                      <span className="text-gray-400 text-xs font-mono">Order-{order.id}</span>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                      <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-red-400 text-sm">{error}</p>
                        {mpesaStatus === 'error' && (
                          <button onClick={() => { setMpesaStatus('idle'); setError(''); }}
                            className="mt-2 flex items-center gap-1 text-brand-400 text-xs hover:text-brand-300">
                            <RefreshCw size={11} /> Try again
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA buttons */}
                  {mpesaStatus === 'idle' && (
                    <button onClick={payMpesa}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white py-4 rounded-xl font-bold text-base transition-all shadow-xl shadow-green-500/25 hover:scale-[1.02] active:scale-[0.98]">
                      <Smartphone size={20}/> Pay {fmt(grandTotal)} via M-Pesa
                    </button>
                  )}

                  {mpesaStatus === 'sending' && (
                    <div className="w-full flex items-center justify-center gap-3 bg-green-500/20 border border-green-500/30 text-green-400 py-4 rounded-xl font-semibold">
                      <Loader size={18} className="animate-spin" /> Sending STK Push...
                    </div>
                  )}

                  {(mpesaStatus === 'sent' || mpesaStatus === 'polling') && (
                    <div className="space-y-3">
                      <div className="w-full flex flex-col items-center justify-center gap-2 bg-green-500/10 border border-green-500/25 text-green-400 py-5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Smartphone size={22} className="animate-bounce" />
                          <span className="font-bold text-base">Check Your Phone!</span>
                        </div>
                        <p className="text-green-400/80 text-sm text-center px-4">
                          M-Pesa prompt sent to <strong>{mpesaPhone}</strong>.<br/>
                          Enter your PIN to complete payment.
                        </p>
                        {mpesaStatus === 'polling' && (
                          <div className="flex items-center gap-2 text-xs text-green-400/60 mt-1">
                            <Loader size={12} className="animate-spin" /> Waiting for confirmation...
                          </div>
                        )}
                      </div>
                      <p className="text-center text-gray-600 text-xs">
                        Didn't receive it?{' '}
                        <button onClick={() => { setMpesaStatus('idle'); setError(''); }}
                          className="text-brand-400 hover:text-brand-300 underline">
                          Try a different number
                        </button>
                      </p>
                    </div>
                  )}

                  {mpesaStatus === 'confirmed' && (
                    <div className="w-full flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 py-4 rounded-xl font-bold text-base">
                      <CheckCircle size={20} className="fill-green-400" /> Payment Confirmed!
                    </div>
                  )}
                </div>
              </div>

              <p className="flex items-start gap-2 mt-4 text-gray-600 text-xs">
                <Lock size={11} className="flex-shrink-0 mt-0.5" />
                Your M-Pesa PIN is never shared with ShopKenya. All payments processed by Safaricom.
              </p>
            </div>

            {/* Summary + delivery recap */}
            <div className="lg:col-span-2 space-y-4">
              <Summary items={items} total={total} shipping={shipping} />
              <div className="bg-dark-800/50 border border-white/8 rounded-xl p-4">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Delivering to</p>
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{form.shipping_address}</p>
                <p className="text-gray-400 text-xs mt-1">{form.phone}</p>
                <button onClick={() => setStep(0)}
                  className="text-brand-400 text-xs mt-2 hover:text-brand-300 transition-colors">
                  Edit details →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Confirmation ── */}
        {step === 2 && (
          <div className="max-w-lg mx-auto text-center py-8">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-green-500/15 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
                <CheckCircle size={44} className="text-green-400" />
              </div>
            </div>
            <h2 className="font-display text-4xl font-bold text-white mb-3">Order Confirmed!</h2>
            <p className="text-gray-400 mb-1">
              Order <span className="text-brand-400 font-bold">#{order?.id}</span> placed successfully.
            </p>
            <p className="text-gray-500 text-sm mb-10">M-Pesa payment received. A confirmation will be sent to your phone.</p>

            <div className="bg-dark-800/60 border border-white/8 rounded-2xl p-5 mb-8 text-left">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4 text-center">Payment Receipt</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Order ID',    value: `#${order?.id}`      },
                  { label: 'Amount Paid', value: fmt(grandTotal)       },
                  { label: 'Method',      value: 'M-Pesa STK Push'    },
                  { label: 'Phone',       value: mpesaPhone            },
                  { label: 'Status',      value: '✅ Paid & Confirmed' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className="text-white text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/orders')}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25">
                <Package size={18} /> View My Orders
              </button>
              <button onClick={() => navigate('/products')}
                className="flex-1 bg-white/5 border border-white/15 hover:bg-white/10 text-white py-4 rounded-xl font-semibold transition-all">
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
