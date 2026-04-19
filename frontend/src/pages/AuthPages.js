import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader, Package, Phone, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Field({ icon: Icon, type = 'text', placeholder, value, onChange, required = true, minLength }) {
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        required={required} minLength={minLength}
        className="w-full bg-dark-800/60 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-400/60 focus:bg-dark-700/60 transition-all"/>
    </div>
  );
}

export function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [sp]       = useSearchParams();
  const redirect   = sp.get('redirect') || '/';
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const u = await login(form.email, form.password);
      navigate(redirect !== '/' ? redirect : u.is_admin ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your email and password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30"><Package size={24} className="text-white"/></div>
          <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your ShopKenya account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-dark-800/60 backdrop-blur-xl border border-white/8 rounded-2xl p-8 space-y-4">
          <Field icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
            <input type={showPw?'text':'password'} placeholder="Password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required
              className="w-full bg-dark-800/60 border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-400/60 transition-all"/>
            <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1">
              {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
            </button>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25 disabled:opacity-60 mt-2">
            {loading?<Loader size={18} className="animate-spin"/>:'Sign In'}
          </button>
          <p className="text-center text-gray-500 text-sm pt-2">
            Don't have an account?{' '}
            <Link to={`/register${redirect!=='/'?`?redirect=${redirect}`:''}`} className="text-brand-400 hover:text-brand-300 font-medium">Sign up free</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [sp]         = useSearchParams();
  const redirect     = sp.get('redirect') || '/';
  const [form,    setForm]    = useState({ name:'', email:'', password:'', phone:'' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await register(form); navigate(redirect); }
    catch (err) { setError(err.response?.data?.detail || 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30"><Package size={24} className="text-white"/></div>
          <h1 className="font-display text-3xl font-bold text-white">Create account</h1>
          <p className="text-gray-500 mt-2 text-sm">Join thousands of happy shoppers</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-dark-800/60 backdrop-blur-xl border border-white/8 rounded-2xl p-8 space-y-4">
          <Field icon={User} placeholder="Full Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          <Field icon={Mail} type="email" placeholder="Email address" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          <Field icon={Phone} placeholder="Phone e.g. 0712345678" required={false} value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
            <input type={showPw?'text':'password'} placeholder="Password (min 8 characters)" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required minLength={8}
              className="w-full bg-dark-800/60 border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-400/60 transition-all"/>
            <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1">
              {showPw?<EyeOff size={14}/>:<Eye size={14}/>}
            </button>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25 disabled:opacity-60 mt-2">
            {loading?<Loader size={18} className="animate-spin"/>:'Create Account'}
          </button>
          <p className="text-center text-gray-500 text-sm pt-2">
            Already have an account?{' '}
            <Link to={`/login${redirect!=='/'?`?redirect=${redirect}`:''}`} className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
