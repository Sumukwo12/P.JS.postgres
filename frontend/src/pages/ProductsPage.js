import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await productsAPI.categories();
        setCategories(data);
      } catch { setCategories(DEMO_CATEGORIES); }
    })();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedCategory) params.category_id = selectedCategory;
        const { data } = await productsAPI.list(params);
        setProducts(data);
      } catch {
        setProducts(DEMO_PRODUCTS.filter(p => {
          if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
          if (selectedCategory && p.category_id !== parseInt(selectedCategory)) return false;
          return true;
        }));
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.category_id = selectedCategory;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-white mb-2">All Products</h1>
          <p className="text-gray-500">{loading ? 'Loading...' : `${products.length} products found`}</p>
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-dark-800/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-400/60 transition-all backdrop-blur-sm"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                <X size={14} />
              </button>
            )}
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-dark-800/60 border border-white/10 hover:border-brand-400/40 text-gray-300 px-4 py-3 rounded-xl transition-all backdrop-blur-sm sm:w-auto"
          >
            <SlidersHorizontal size={16} />
            <span className="text-sm">Filters</span>
            {selectedCategory && <span className="w-2 h-2 bg-brand-400 rounded-full" />}
          </button>
          {(search || selectedCategory) && (
            <button onClick={clearFilters} className="text-brand-400 text-sm hover:text-brand-300 px-3">Clear all</button>
          )}
        </div>

        {/* Category filters */}
        {showFilters && (
          <div className="mb-8 p-4 bg-dark-800/50 rounded-xl border border-white/8 backdrop-blur-sm">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-medium">Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!selectedCategory ? 'bg-brand-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id.toString() ? 'bg-brand-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="bg-dark-800/50 rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-white text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="bg-brand-500 text-white px-6 py-2.5 rounded-full text-sm hover:bg-brand-400 transition-colors">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

const DEMO_CATEGORIES = [
  { id: 1, name: 'Electronics' }, { id: 2, name: 'Fashion' },
  { id: 3, name: 'Beauty' }, { id: 4, name: 'Home & Kitchen' },
  { id: 5, name: 'Sports' },
];

const DEMO_PRODUCTS = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  name: ['Wireless Earbuds Pro', 'Leather Handbag', 'Face Serum Kit', 'Coffee Maker', 'Running Shoes', 'Novel Collection', 'Smart Watch', 'Yoga Mat', 'Laptop Stand', 'Sunglasses', 'Blender Pro', 'Sneakers', 'Perfume Set', 'Table Lamp', 'Backpack', 'Headphones'][i],
  price: [4500, 8900, 2200, 6500, 5500, 1200, 12000, 1800, 3200, 4100, 7800, 6200, 3500, 2800, 4900, 8500][i],
  stock: [10, 3, 20, 7, 15, 50, 2, 30, 8, 12, 5, 18, 25, 9, 14, 6][i],
  image_url: null,
  category_id: (i % 5) + 1,
  category: { name: DEMO_CATEGORIES[i % 5].name },
}));
