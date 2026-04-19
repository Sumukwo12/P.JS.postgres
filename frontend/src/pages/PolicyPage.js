import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Shield, ChevronRight, ArrowLeft, Loader, 
  Clock, FileText, AlertCircle 
} from 'lucide-react';
import { policiesAPI } from '../utils/api';

export default function PolicyPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null); // Can be a policy object or array of policies
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (slug) {
          const res = await policiesAPI.get(slug);
          setData(res.data);
        } else {
          const res = await policiesAPI.list();
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.response?.data?.detail || 'Document not found');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <Loader size={40} className="text-brand-400 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading documents...</p>
      </div>
    );
  }

  // --- List View (All Policies) ---
  if (!slug) {
    const policies = Array.isArray(data) ? data : [];
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-400">
              <Shield size={32} />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Legal & Policy Center</h1>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Transparency and trust are at the heart of ShopKenya. Browse our official documents below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-gray-600">No policies found. Contact support for assistance.</p>
              </div>
            ) : policies.map(p => (
              <Link 
                key={p.id} 
                to={`/policies/${p.slug}`}
                className="group bg-dark-800/60 backdrop-blur-xl border border-white/8 p-8 rounded-3xl hover:border-brand-500/40 hover:bg-brand-500/5 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-brand-500/10 flex items-center justify-center mb-6 text-gray-400 group-hover:text-brand-400 transition-colors">
                  <FileText size={20} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  {p.title}
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-brand-400" />
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                  {p.content}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={12} />
                  Updated: {new Date(p.updated_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
              <ArrowLeft size={16} />
              <span>Back to Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Detail View (Specific Policy) ---
  if (error || !data) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-400">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Document Not Found</h1>
          <p className="text-gray-400 mb-8 mx-auto">The content you requested is currently unavailable.</p>
          <Link to="/policies" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-semibold transition-all">
            <ArrowLeft size={18} />
            <span>Legal Center</span>
          </Link>
        </div>
      </div>
    );
  }

  const policy = data;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link to="/policies" className="hover:text-white transition-colors">Legal</Link>
          <ChevronRight size={10} />
          <span className="text-brand-400">{policy.title}</span>
        </nav>

        {/* Header */}
        <div className="bg-dark-800/60 backdrop-blur-xl border border-white/8 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-400">
            <Shield size={200} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-white/8">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 text-brand-400">
                  <FileText size={24} />
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
                  {policy.title}
                </h1>
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    Last updated: {new Date(policy.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <div className="space-y-6">
                {policy.content.split('\n').map((para, i) => (
                  para.trim() ? (
                    <p key={i} className="text-gray-400 text-lg leading-relaxed">
                      {para}
                    </p>
                  ) : <br key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-brand-500/10 to-transparent border border-brand-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Have questions about this policy?</p>
              <p className="text-gray-500 text-xs mt-0.5">Contact our legal team for clarification.</p>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20">
            Contact Support
          </button>
        </div>

        <Link to="/policies" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mt-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Legal Center</span>
        </Link>
      </div>
    </div>
  );
}
