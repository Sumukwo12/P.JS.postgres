import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count }        = useCart();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);
  const [q,        setQ]        = useState('');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => setOpen(false), [location]);

  const search = (e) => { e.preventDefault(); if (q.trim()) navigate(`/products?search=${encodeURIComponent(q)}`); };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-dark-900/90 backdrop-blur-xl border-b border-brand-500/20 shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform">
              <Package size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">Shop<span className="text-brand-400">Kenya</span></span>
          </Link>

          <form onSubmit={search} className="hidden md:flex flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-400/60 transition-all" />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/products" className="text-gray-300 hover:text-brand-400 px-3 py-2 text-sm font-medium transition-colors">Shop</Link>
            {user ? (
              <>
                {user.is_admin && <Link to="/admin" className="text-gray-300 hover:text-brand-400 px-3 py-2 text-sm flex items-center gap-1 transition-colors"><LayoutDashboard size={14}/>Admin</Link>}
                <Link to="/orders" className="text-gray-300 hover:text-brand-400 px-3 py-2 text-sm transition-colors">Orders</Link>
                <Link to="/cart" className="relative p-2 text-gray-300 hover:text-brand-400 transition-colors">
                  <ShoppingCart size={20}/>
                  {count > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">{count > 9 ? '9+' : count}</span>}
                </Link>
                <div className="flex items-center gap-1 ml-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold">{user.name[0].toUpperCase()}</div>
                  <button onClick={() => { logout(); navigate('/'); }} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><LogOut size={16}/></button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 text-sm transition-colors">Login</Link>
                <Link to="/register" className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-brand-500/20 hover:scale-105">Sign Up</Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            {user && <Link to="/cart" className="relative p-2 text-gray-300"><ShoppingCart size={20}/>{count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{count}</span>}</Link>}
            <button onClick={() => setOpen(!open)} className="text-gray-300 p-2">{open ? <X size={22}/> : <Menu size={22}/>}</button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-dark-800/95 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <form onSubmit={search}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..."
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"/>
              </div>
            </form>
            <Link to="/products" className="block text-gray-300 py-2 text-sm">Shop</Link>
            {user ? (
              <>
                {user.is_admin && <Link to="/admin" className="block text-gray-300 py-2 text-sm">Admin Dashboard</Link>}
                <Link to="/orders" className="block text-gray-300 py-2 text-sm">My Orders</Link>
                <button onClick={() => { logout(); navigate('/'); }} className="block text-red-400 py-2 text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="block text-gray-300 py-2 text-sm">Login</Link>
                <Link to="/register" className="block text-brand-400 py-2 text-sm font-semibold">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
