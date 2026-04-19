import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Package, Shield, Truck, Star, LogIn } from 'lucide-react';
import { productsAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding,   setAdding]   = useState(false);
  const [added,    setAdded]    = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [similarProducts, setSimilarProducts] = useState([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await productsAPI.get(id);
        setProduct(data);
        // Initial defaults for variants
        if (data.variants) {
          const defaults = {};
          Object.entries(data.variants).forEach(([k, v]) => { if (Array.isArray(v) && v.length) defaults[k] = v[0]; });
          setSelectedVariants(defaults);
        }
        // Fetch similar
        if (data.category?.id) {
          const sRes = await productsAPI.list({ category_id: data.category.id });
          setSimilarProducts(sRes.data.filter(p => p.id !== data.id).slice(0, 4));
        }
      } catch {
        setProduct(DEMO_PRODUCT);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, quantity, selectedVariants);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen pt-24 flex items-center justify-center text-white">Product not found</div>
  );

  const price = product.price?.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-dark-800/60 border border-white/8">
              {product.image_url
                ? <img src={product.image_url.startsWith('/static') ? `http://localhost:8000${product.image_url}` : product.image_url} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-8xl">🛍️</div>
              }
            </div>
            {product.category && (
              <span className="absolute top-4 left-4 bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs px-3 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">{product.name}</h1>

            <div className="flex items-center gap-1 mb-4">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={14} className={i <= 4 ? 'fill-brand-400 text-brand-400' : 'text-gray-600'} />
              ))}
              <span className="text-gray-400 text-sm ml-2">4.0 (124 reviews)</span>
            </div>

            <div className="text-brand-400 font-display text-4xl font-bold mb-6">{price}</div>

            {product.description && (
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-8">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
              </span>
            </div>

            {/* Variants */}
            {product.variants && Object.entries(product.variants).map(([key, options]) => (
              <div key={key} className="mb-8">
                <label className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3 block">{key}</label>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(options) && options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariants(v => ({ ...v, [key]: opt }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedVariants[key] === opt
                          ? 'bg-brand-500/20 border-brand-500 text-brand-400 shadow-lg shadow-brand-500/10'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-400 text-sm">Quantity</span>
                <div className="flex items-center gap-3 bg-dark-800/60 border border-white/10 rounded-xl p-1">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                    <Minus size={14} />
                  </button>
                  <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Login prompt for guests */}
            {showLoginPrompt && !user && (
              <div className="mb-4 bg-brand-500/10 border border-brand-500/30 rounded-xl p-4">
                <p className="text-brand-300 text-sm font-medium mb-3">
                  Create a free account to add items to your cart and checkout.
                </p>
                <div className="flex gap-2">
                  <Link to="/register" className="flex-1 text-center bg-gradient-to-r from-brand-500 to-brand-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-brand-400 hover:to-brand-500 transition-all">
                    Sign Up Free
                  </Link>
                  <Link to="/login" className="flex-1 text-center bg-white/5 border border-white/15 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-white/10 transition-all">
                    Login
                  </Link>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                  added
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                    : product.stock === 0
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    : !user
                    ? 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {!user
                  ? <><LogIn size={18} /> Login to Buy</>
                  : added
                  ? '✓ Added to Cart'
                  : adding
                  ? 'Adding...'
                  : <><ShoppingCart size={18} /> Add to Cart</>
                }
              </button>
              {added && (
                <Link to="/cart" className="flex items-center justify-center px-6 py-4 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-all">
                  View Cart
                </Link>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck,   text: 'Free Delivery over KES 5,000' },
                { icon: Shield,  text: '30-Day Return Policy'         },
                { icon: Package, text: 'Secure Packaging'             },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1.5 p-3 bg-dark-800/40 rounded-xl border border-white/5">
                  <Icon size={16} className="text-brand-400" />
                  <span className="text-gray-500 text-xs leading-tight">{text}</span>
                </div>
              ))}
            </div>
            </div>
          </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="font-display text-2xl font-bold text-white mb-8">Customers also viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {similarProducts.map(p => (
                <Link key={p.id} to={`/products/${p.id}`} className="group">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-dark-800 border border-white/8 mb-3 relative">
                    {p.image_url 
                      ? <img src={p.image_url.startsWith('/static') ? `http://localhost:8000${p.image_url}` : p.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                    }
                  </div>
                  <h3 className="text-white text-sm font-medium group-hover:text-brand-400 transition-colors truncate">{p.name}</h3>
                  <p className="text-brand-400 text-sm font-bold mt-1">KES {p.price?.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const DEMO_PRODUCT = {
  id: 1,
  name: 'Wireless Earbuds Pro',
  description: 'Premium wireless earbuds with active noise cancellation, 24-hour battery life, and crystal-clear audio. Water resistant, touch controls, and USB-C charging. Perfect for work and play.',
  price: 4500,
  stock: 10,
  image_url: null,
  category: { name: 'Electronics' },
};
