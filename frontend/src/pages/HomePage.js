import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, CreditCard, ChevronDown } from 'lucide-react';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';

const HERO_WORDS = ['Fashion', 'Electronics', 'Beauty', 'Home', 'Sports'];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroProducts, setHeroProducts] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(i => (i + 1) % HERO_WORDS.length), 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes, hRes] = await Promise.all([
          productsAPI.list(),
          productsAPI.categories(),
          productsAPI.list({ is_featured: true })
        ]);
        setProducts(pRes.data.slice(0, 8));
        setCategories(cRes.data);
        setHeroProducts(hRes.data);
      } catch (e) {
        // Use demo data
        setProducts(DEMO_PRODUCTS);
        setCategories(DEMO_CATEGORIES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="min-h-screen">
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
          {(heroProducts.length > 0 ? heroProducts : (products.length > 0 ? products : DEMO_PRODUCTS)).slice(0, 6).map((p, idx) => {
            const distance = 300 + (idx * 70);
            const duration = 25 + (idx * 5);
            const width = 120 + (idx * 20);
            const aspectRatio = idx % 2 === 0 ? 'aspect-square' : 'aspect-[4/5]';
            const delay = idx * -4;

            return (
              <div
                key={p.id}
                className={`absolute animate-orbit shadow-2xl shadow-brand-500/10 ${aspectRatio}`}
                style={{
                  '--distance': `${distance}px`,
                  '--duration': `${duration}s`,
                  animationDelay: `${delay}s`,
                  width: width,
                }}
              >
                <div className="w-full h-full rounded-2xl border border-white/10 overflow-hidden bg-dark-800 rotate-animation transition-transform hover:scale-110 duration-500">
                  {p.image_url
                    ? <img src={p.image_url.startsWith('/static') ? `http://localhost:8000${p.image_url}` : p.image_url} alt="" className="w-full h-full object-cover opacity-70" />
                    : <div className="w-full h-full flex items-center justify-center bg-brand-500/5 text-3xl">🛍️</div>
                  }
                </div>
              </div>
            );
          })}
        </div>

        {/* Cursor-reactive glow */}
        <div
          className="absolute pointer-events-none rounded-full transition-all duration-100 z-10"
          style={{
            width: 300,
            height: 300,
            left: cursorPos.x - 150,
            top: cursorPos.y - 150,
            background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)',
          }}
        />

        {/* Floating badge */}
        <div className="relative z-20 inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 mb-8 text-brand-400 text-sm font-medium backdrop-blur-sm">
          <Zap size={13} className="fill-brand-400" />
          Kenya's Premier Shopping Destination
        </div>


        <h1 className="relative z-20 font-display text-5xl md:text-7xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          Discover
          <br />
          <span className="relative">
            <span className="bg-gradient-to-r from-brand-400 via-orange-300 to-brand-500 bg-clip-text text-transparent transition-all duration-500">
              {HERO_WORDS[wordIndex]}
            </span>
          </span>
          <br />
          <span className="text-gray-400">You'll Love</span>
        </h1>

        <p className="relative z-20 text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Shop thousands of products with secure M-Pesa payments. Fast delivery across Kenya, guaranteed quality every time.
        </p>

        <div className="relative z-20 flex flex-col sm:flex-row gap-4 items-center">
          <Link
            to="/products"
            className="group flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white px-8 py-4 rounded-full font-semibold text-base shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Shop Now
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>

        {/* Stats */}
        <div className="relative z-20 flex items-center gap-8 mt-16 flex-wrap justify-center">
          {[['10K+', 'Products'], ['50K+', 'Happy Customers'], ['99%', 'Satisfaction'], ['24/7', 'Support']].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold font-display text-white">{val}</div>
              <div className="text-gray-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600">
          <span className="text-xs">Scroll</span>
          <ChevronDown size={16} className="animate-bounce" />
        </div>
      </section>



      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-white">Browse Categories</h2>
              <Link to="/products" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">All <ArrowRight size={14} /></Link>
            </div>
            <div className="flex gap-3 flex-wrap">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category_id=${cat.id}`}
                  className="bg-dark-800/60 border border-white/10 hover:border-brand-500/40 hover:bg-brand-500/10 text-gray-300 hover:text-brand-400 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="py-10 px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">Featured Products</h2>
              <p className="text-gray-500 text-sm mt-1">Handpicked for you</p>
            </div>
            <Link to="/products" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1 group">
              View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-dark-800/50 rounded-2xl aspect-square animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>


      {/* FEATURES */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: 'Fast Delivery', desc: 'Countrywide shipping' },
            { icon: Shield, title: 'Secure Payment', desc: 'M-Pesa & cards' },
            { icon: CreditCard, title: 'Easy Returns', desc: '30-day policy' },
            { icon: Zap, title: '24/7 Support', desc: 'Always here for you' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group bg-dark-800/50 backdrop-blur-sm border border-white/8 rounded-2xl p-6 text-center hover:border-brand-500/30 transition-all duration-300 hover:bg-dark-700/50">
              <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-500/20 transition-colors">
                <Icon size={22} className="text-brand-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
              <p className="text-gray-500 text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const DEMO_CATEGORIES = [
  { id: 1, name: 'Electronics' }, { id: 2, name: 'Fashion' },
  { id: 3, name: 'Beauty' }, { id: 4, name: 'Home & Kitchen' },
  { id: 5, name: 'Sports' }, { id: 6, name: 'Books' },
];

const DEMO_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: ['Wireless Earbuds Pro', 'Leather Handbag', 'Face Serum Kit', 'Coffee Maker', 'Running Shoes', 'Novel Collection', 'Smart Watch', 'Yoga Mat'][i],
  price: [4500, 8900, 2200, 6500, 5500, 1200, 12000, 1800][i],
  stock: [10, 3, 20, 7, 15, 50, 2, 30][i],
  image_url: null,
  category: { name: DEMO_CATEGORIES[i % 6].name },
}));
