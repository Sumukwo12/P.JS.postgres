import { useState, useEffect } from 'react';
import {
  Users, ShoppingBag, Package, TrendingUp, Edit2, Trash2,
  Plus, X, Loader, Lock, Eye, EyeOff, LogOut, ChevronDown,
  ImagePlus, Tag, FileText, Hash, Layers, Monitor, FileUp, Download, Settings, ListPlus
} from 'lucide-react';
import { adminAPI, productsAPI, authAPI } from '../utils/api';

const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

// ─── Admin Login ────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.login({ email, password });
      if (!data.user.is_admin) {
        setError('Access denied. This portal is for administrators only.');
        setLoading(false);
        return;
      }
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-brand-500/30">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-500 text-sm">ShopKenya — Restricted Access</p>
        </div>

        <div className="bg-dark-800/70 backdrop-blur-xl border border-white/8 rounded-2xl p-8">
          <div className="flex items-center gap-2 bg-brand-500/8 border border-brand-500/20 rounded-xl px-4 py-3 mb-6">
            <Lock size={13} className="text-brand-400 flex-shrink-0" />
            <span className="text-brand-400 text-xs">Administrator credentials required</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@shopkenya.com"
                required
                className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-400/60 focus:bg-dark-700 transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-400/60 focus:bg-dark-700 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-1">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/25 disabled:opacity-60 mt-2"
            >
              {loading ? <Loader size={18} className="animate-spin" /> : <><Lock size={16} /> Sign In to Admin</>}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Not an admin? <a href="/" className="text-brand-400 hover:text-brand-300">Return to shop</a>
        </p>
      </div>
    </div>
  );
}

// ─── Product Form Modal ──────────────────────────────────────────────────────
function ProductFormModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || '',
    image_url: product?.image_url || '',
    category_id: product?.category_id || (product?.category?.id) || '',
    is_featured: product?.is_featured || false,
    variants_str: product?.variants ? Object.entries(product.variants).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ') : '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(product?.image_url || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id) { setError('Please select a category.'); return; }
    setSaving(true); setError('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      formData.append('category_id', form.category_id);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (form.image_url) {
        formData.append('image_url', form.image_url);
      }
      
      formData.append('is_featured', form.is_featured);
      
      if (form.variants_str) {
        const variants = {};
        form.variants_str.split(';').forEach(pair => {
          const [key, val] = pair.split(':').map(s => s.trim());
          if (key && val) variants[key] = val.split(',').map(s => s.trim());
        });
        formData.append('variants_json', JSON.stringify(variants));
      } else {
        formData.append('variants_json', 'null');
      }

      if (product) {
        const { data } = await productsAPI.update(product.id, formData);
        onSave(data, 'update');
      } else {
        const { data } = await productsAPI.create(formData);
        onSave(data, 'create');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/85 backdrop-blur-sm">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div>
            <h3 className="text-white font-semibold text-base">{product ? 'Edit Product' : 'Add New Product'}</h3>
            <p className="text-gray-500 text-xs mt-0.5">{product ? `Editing: ${product.name}` : 'Fill in details to add a product to your store'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/8 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
              <Tag size={11} /> Product Name *
            </label>
            <input
              required value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Wireless Bluetooth Earbuds Pro"
              className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-400/60 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
              <Layers size={11} /> Category *
            </label>
            <div className="relative">
              <select
                value={form.category_id} onChange={e => set('category_id', e.target.value)}
                className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-400/60 appearance-none transition-all"
              >
                <option value="">— Select a category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
              <FileText size={11} /> Description
            </label>
            <textarea
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe the product — features, materials, dimensions, use-case, warranty..."
              rows={4}
              className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-400/60 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                <Hash size={11} /> Price (KES) *
              </label>
              <input
                required type="number" min="1" step="0.01" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="4500"
                className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-400/60 transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
                <Hash size={11} /> Stock *
              </label>
              <input
                required type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)}
                placeholder="50"
                className="w-full bg-dark-700/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-brand-400/60 transition-all"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">
              <ImagePlus size={11} /> Product Image
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="block w-full border-2 border-dashed border-white/10 hover:border-brand-500/50 rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-brand-500/5 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1 text-gray-500 group-hover:text-brand-400">
                    <ImagePlus size={20} />
                    <span className="text-xs font-medium">{imageFile ? imageFile.name : 'Click to upload image'}</span>
                  </div>
                </label>
              </div>

              {(preview || form.image_url) && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-dark-700 flex-shrink-0">
                  <img src={preview.startsWith('blob:') ? preview : (preview.startsWith('/') ? `http://localhost:8000${preview}` : preview)}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>
            <p className="text-gray-600 text-[10px] mt-2">Max size: 5MB. Formats: JPG, PNG, WEBP.</p>
          </div>

          <div className="space-y-4 pt-2">
            <label className="flex items-center gap-1.5 text-gray-400 text-xs font-medium uppercase tracking-wider">
              <ListPlus size={11} /> Variants (Sizes, Colors, etc.)
            </label>
            <div className="bg-white/5 border border-white/8 rounded-xl p-4">
              <input
                value={form.variants_str} onChange={e => set('variants_str', e.target.value)}
                placeholder="e.g. Color: Red, Blue; Size: S, M, L"
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder-gray-600 mb-2"
              />
              <p className="text-[10px] text-gray-500 italic">Format: Key: Val1, Val2; Key2: Val1, Val2</p>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl p-4">
              <div className="flex-1">
                <h4 className="text-white text-sm font-medium">Feature in Home Hero</h4>
                <p className="text-gray-500 text-xs mt-0.5">Show this product in the background orbit</p>
              </div>
              <button
                type="button"
                onClick={() => set('is_featured', !form.is_featured)}
                className={`w-12 h-6 rounded-full transition-all relative ${form.is_featured ? 'bg-brand-500 shadow-lg shadow-brand-500/20' : 'bg-dark-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_featured ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 py-3 rounded-xl font-medium text-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-brand-500/20 disabled:opacity-60">
              {saving ? <Loader size={16} className="animate-spin" /> : product ? <><Edit2 size={14} /> Save Changes</> : <><Plus size={14} /> Add Product</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Bulk Import Modal ───────────────────────────────────────────────────────
function BulkImportModal({ onSave, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true); setError('');
    try {
      const { data } = await productsAPI.bulkCreate(file);
      setResult(data);
      if (data.detail) onSave();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload CSV.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "name,description,price,stock,category_id,is_featured,image_url\nSample Product,Awesome desc,4500,50,1,true,https://example.com/img.jpg";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'template.csv'; a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/85 backdrop-blur-sm">
      <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div><h3 className="text-white font-semibold">Bulk Import</h3><p className="text-gray-500 text-xs">Upload product CSV</p></div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-6">
          {!result ? (
            <form onSubmit={handleUpload} className="space-y-4">
              <button type="button" onClick={downloadTemplate} className="text-brand-400 text-xs flex items-center gap-1 mb-4"><Download size={12}/> Download Template</button>
              <label className="block w-full border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-brand-500/30">
                <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="hidden" />
                <FileUp size={32} className="mx-auto text-gray-500 mb-2" />
                <span className="text-sm text-gray-400">{file ? file.name : 'Select CSV file'}</span>
              </label>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <button type="submit" disabled={!file || uploading} className="w-full bg-brand-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
                {uploading ? <Loader className="animate-spin mx-auto" /> : 'Start Import'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <h4 className="text-white font-bold mb-2">Done!</h4>
              <p className="text-gray-400 text-sm mb-6">{result.detail}</p>
              <button onClick={onClose} className="w-full bg-white/10 text-white py-3 rounded-xl">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [adminUser, setAdminUser] = useState(() => { try { const s = localStorage.getItem('admin_user'); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [notice, setNotice] = useState('');

  const notify = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };
  const fmt = (n) => n?.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });

  useEffect(() => {
    if (!adminUser) return;
    (async () => {
      try {
        const [s, o, p, u, c] = await Promise.all([
          adminAPI.stats(), adminAPI.orders(), productsAPI.list(), adminAPI.users(), productsAPI.categories()
        ]);
        setStats(s.data); setOrders(o.data); setProducts(p.data); setUsers(u.data); setCategories(c.data);
      } catch {
        setStats({ total_users: 42, total_orders: 128, total_products: 16, total_revenue: 4580000 });
        setCategories([
          { id: 1, name: 'Electronics' }, { id: 2, name: 'Fashion' }, { id: 3, name: 'Beauty' },
          { id: 4, name: 'Home & Kitchen' }, { id: 5, name: 'Sports' }, { id: 6, name: 'Books' },
        ]);
      } finally { setLoading(false); }
    })();
  }, [adminUser]);

  const handleLogout = () => { localStorage.removeItem('admin_token'); localStorage.removeItem('admin_user'); setAdminUser(null); };

  const handleProductSaved = (saved, action) => {
    if (action === 'create') {
      setProducts(p => [saved, ...p]);
      if (stats) setStats(s => ({ ...s, total_products: s.total_products + 1 }));
      notify(`✅ "${saved.name}" added successfully!`);
    } else {
      setProducts(p => p.map(x => x.id === saved.id ? saved : x));
      notify(`✅ "${saved.name}" updated.`);
    }
    setShowForm(false); setEditProd(null);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productsAPI.delete(id);
      setProducts(p => p.filter(x => x.id !== id));
      if (stats) setStats(s => ({ ...s, total_products: s.total_products - 1 }));
      notify(`🗑️ "${name}" deleted.`);
    } catch { notify('❌ Failed to delete product.'); }
  };

  const handleStatus = async (id, status) => {
    try {
      await adminAPI.updateOrderStatus(id, status);
      setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
      notify(`✅ Order #${id} → ${status}`);
    } catch { notify('❌ Failed to update status.'); }
  };

  const filtered = products.filter(p => {
    const catId = p.category?.id?.toString() || p.category_id?.toString();
    return (!filterCat || catId === filterCat) && (!searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()));
  });

  if (!adminUser) return <AdminLogin onLogin={setAdminUser} />;
  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><Loader size={32} className="text-brand-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      {notice && (
        <div className="fixed top-24 right-4 z-50 bg-dark-700/95 border border-white/15 text-white text-sm px-5 py-3 rounded-xl shadow-xl backdrop-blur-sm animate-fade-in">
          {notice}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Welcome back, <span className="text-brand-400 font-medium">{adminUser.name}</span></p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-dark-800/50 p-1 rounded-xl w-fit border border-white/8">
          {['overview', 'products', 'orders', 'users', 'hero'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{t}</button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.total_users, icon: Users, bg: 'bg-blue-500/15', txt: 'text-blue-400' },
              { label: 'Total Orders', value: stats.total_orders, icon: ShoppingBag, bg: 'bg-purple-500/15', txt: 'text-purple-400' },
              { label: 'Products', value: stats.total_products, icon: Package, bg: 'bg-green-500/15', txt: 'text-green-400' },
              { label: 'Revenue', value: fmt(stats.total_revenue), icon: TrendingUp, bg: 'bg-brand-500/15', txt: 'text-brand-400' },
            ].map(({ label, value, icon: Icon, bg, txt }) => (
              <div key={label} className="bg-dark-800/60 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                  <Icon size={20} className={txt} />
                </div>
                <div className="text-2xl font-bold font-display text-white">{value}</div>
                <div className="text-gray-500 text-sm mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search products..."
                className="flex-1 bg-dark-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-400/60 transition-all" />
              <div className="relative">
                <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                  className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm appearance-none pr-8 focus:outline-none cursor-pointer">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              <button onClick={() => { setEditProd(null); setShowForm(true); }}
                className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-500/20 whitespace-nowrap">
                <Plus size={16} /> Add Product
              </button>
              <button onClick={() => setShowBulk(true)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap">
                <FileUp size={16} /> Import CSV
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>

            <div className="bg-dark-800/40 border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/8">
                      {['Product', 'Category', 'Description', 'Price', 'Stock', 'Actions'].map(h => (
                        <th key={h} className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.length === 0
                      ? <tr><td colSpan={6} className="text-center py-12 text-gray-600">No products found</td></tr>
                      : filtered.map(p => (
                        <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-lg overflow-hidden bg-dark-700 flex-shrink-0 flex items-center justify-center border border-white/5">
                                {p.image_url
                                  ? <img src={p.image_url.startsWith('/static') ? `http://localhost:8000${p.image_url}` : p.image_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                                  : <Package size={18} className="text-gray-600" />}
                              </div>
                              <span className="text-white text-sm font-medium line-clamp-1 max-w-[130px]">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                              {p.category?.name || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                              {p.description || <span className="text-gray-600 italic">No description</span>}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-brand-400 text-sm font-bold font-display whitespace-nowrap">
                              {p.price?.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.stock > 10 ? 'text-green-400 bg-green-400/10' : p.stock > 0 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10'}`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditProd(p); setShowForm(true); }} className="p-2 text-gray-400 hover:text-brand-400 hover:bg-brand-400/10 rounded-lg transition-all" title="Edit">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="bg-dark-800/40 border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.length === 0
                    ? <tr><td colSpan={6} className="text-center py-12 text-gray-600">No orders yet</td></tr>
                    : orders.map(o => (
                      <tr key={o.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3 text-white text-sm font-semibold">#{o.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(o.user?.name || 'U')[0].toUpperCase()}
                            </div>
                            <span className="text-gray-300 text-sm">{o.user?.name || o.phone}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{o.items?.length || 0}</td>
                        <td className="px-4 py-3 text-brand-400 text-sm font-bold">{fmt(o.total_amount)}</td>
                        <td className="px-4 py-3">
                          <select value={o.status} onChange={e => handleStatus(o.id, e.target.value)}
                            className="bg-dark-700 border border-white/10 rounded-lg text-white text-xs px-2 py-1.5 focus:outline-none cursor-pointer">
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(o.created_at).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-dark-800/40 border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {['User', 'Email', 'Phone', 'Role', 'Joined'].map(h => (
                      <th key={h} className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.length === 0
                    ? <tr><td colSpan={5} className="text-center py-12 text-gray-600">No users found</td></tr>
                    : users.map(u => (
                      <tr key={u.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold">
                              {u.name[0].toUpperCase()}
                            </div>
                            <span className="text-white text-sm font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{u.email}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{u.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${u.is_admin ? 'text-brand-400 bg-brand-400/10 border-brand-400/20' : 'text-gray-400 bg-white/5 border-white/10'}`}>
                            {u.is_admin ? 'Admin' : 'Customer'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(u.created_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Hero Tab Content */}
        {tab === 'hero' && (
          <div className="space-y-6">
            <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Monitor className="text-brand-400" /> Hero Section Decorator
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                  The orbiting images on your homepage are pulled from your "Featured" products. 
                  Upload high-quality, transparent or clean background images here to make your hero section look premium.
                </p>
              </div>
              <button 
                onClick={() => { setEditProd(null); setShowForm(true); }}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/25"
              >
                <ImagePlus size={18} /> Upload Product to Hero
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.filter(p => p.is_featured).map(p => (
                <div key={p.id} className="relative group bg-dark-800/60 border border-white/8 rounded-2xl p-3 aspect-square flex flex-col items-center justify-center hover:border-brand-500/30 transition-all">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-dark-700/50 mb-2">
                    <img src={p.image_url?.startsWith('/static') ? `http://localhost:8000${p.image_url}` : p.image_url} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center px-1">{p.name}</span>
                  <button 
                    onClick={async () => {
                      const formData = new FormData();
                      formData.append('name', p.name);
                      formData.append('price', p.price);
                      formData.append('stock', p.stock);
                      formData.append('category_id', p.category_id || p.category?.id);
                      formData.append('is_featured', 'false');
                      await productsAPI.update(p.id, formData);
                      setProducts(curr => curr.map(x => x.id === p.id ? { ...x, is_featured: false } : x));
                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                    title="Remove from Hero"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <button 
                onClick={() => { setEditProd(null); setShowForm(true); }}
                className="border-2 border-dashed border-white/10 rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-brand-500/30 hover:text-brand-400 transition-all hover:bg-brand-500/5"
              >
                <Plus size={24} />
                <span className="text-xs font-medium">Add Image</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <ProductFormModal
          product={editProd}
          categories={categories}
          onSave={handleProductSaved}
          onClose={() => { setShowForm(false); setEditProd(null); }}
        />
      )}

      {showBulk && (
        <BulkImportModal
          onSave={async () => {
            const { data } = await productsAPI.list();
            setProducts(data);
          }}
          onClose={() => setShowBulk(false)}
        />
      )}
    </div>
  );
}
