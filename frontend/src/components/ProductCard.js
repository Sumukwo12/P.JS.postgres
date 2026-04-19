import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [adding, setAdding]   = useState(false);
  const [liked,  setLiked]    = useState(false);
  const [added,  setAdded]    = useState(false);
  const [hint,   setHint]     = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { setHint(true); setTimeout(() => setHint(false), 3000); return; }
    setAdding(true);
    try { await addToCart(product.id, 1); setAdded(true); setTimeout(() => setAdded(false), 2200); }
    catch {}
    finally { setAdding(false); }
  };

  const price = product.price?.toLocaleString('en-KE', { style:'currency', currency:'KES', maximumFractionDigits:0 });

  return (
    <div className="group relative bg-dark-800/60 backdrop-blur-sm border border-white/8 rounded-2xl overflow-hidden hover:border-brand-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1">
      {hint && (
        <div className="absolute top-2 left-2 right-2 z-20 bg-dark-900/95 border border-brand-500/40 rounded-xl px-3 py-2.5 shadow-xl">
          <p className="text-brand-300 text-xs font-medium mb-2">Sign in to add to cart</p>
          <div className="flex gap-1.5">
            <Link to="/register" onClick={e=>e.stopPropagation()} className="flex-1 text-center bg-brand-500 text-white text-xs py-1.5 rounded-lg font-semibold">Sign Up</Link>
            <Link to="/login"    onClick={e=>e.stopPropagation()} className="flex-1 text-center bg-white/10 text-white text-xs py-1.5 rounded-lg">Login</Link>
          </div>
        </div>
      )}

      <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-square">
        {product.image_url
          ? <img src={product.image_url.startsWith('/static') ? `http://localhost:8000${product.image_url}` : product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
          : <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-600 flex items-center justify-center text-5xl">🛍️</div>
        }
        {product.category && <span className="absolute top-3 left-3 bg-dark-900/80 text-brand-400 text-xs px-2.5 py-1 rounded-full border border-brand-400/20 font-medium">{product.category.name}</span>}
        {product.stock < 5 && product.stock > 0 && <span className="absolute top-3 right-3 bg-red-500/80 text-white text-xs px-2 py-1 rounded-full">Low stock</span>}
        {product.stock === 0 && <span className="absolute top-3 right-3 bg-gray-700/80 text-gray-300 text-xs px-2 py-1 rounded-full">Out of stock</span>}
        <div className="absolute inset-0 bg-dark-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-xs"><Eye size={13}/>Quick View</span>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-white font-medium text-sm mb-1 line-clamp-2 group-hover:text-brand-400 transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-0.5 mb-3">
          {[1,2,3,4,5].map(i=><Star key={i} size={10} className={i<=4?'fill-brand-400 text-brand-400':'text-gray-600'}/>)}
          <span className="text-gray-500 text-xs ml-1">(4.0)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-brand-400 font-bold font-display text-lg">{price}</span>
          <div className="flex items-center gap-1.5">
            <button onClick={e=>{e.preventDefault();setLiked(!liked);}} className={`p-2 rounded-full border transition-all ${liked?'bg-red-500/20 border-red-500/40 text-red-400':'bg-white/5 border-white/10 text-gray-400 hover:text-red-400'}`}>
              <Heart size={13} className={liked?'fill-current':''}/>
            </button>
            <button onClick={handleAdd} disabled={adding||product.stock===0}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                added ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                : product.stock===0 ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : !user ? 'bg-dark-700 border border-brand-500/30 text-brand-400 hover:bg-brand-500/15'
                : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-400 hover:to-brand-500 shadow-md shadow-brand-500/20'
              }`}>
              {!user ? <><LogIn size={12}/>Login</> : added ? '✓ Added' : adding ? '...' : <><ShoppingCart size={12}/>Add</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
