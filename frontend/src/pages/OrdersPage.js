import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { ordersAPI } from '../utils/api';

const STATUS_COLORS = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  paid: 'text-green-400 bg-green-400/10 border-green-400/20',
  processing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  shipped: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  delivered: 'text-brand-400 bg-brand-400/10 border-brand-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await ordersAPI.list();
        setOrders(data);
      } catch { setOrders([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const fmt = (n) => n?.toLocaleString('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-white mb-2">My Orders</h1>
        <p className="text-gray-500 mb-8">{orders.length} orders</p>

        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-28 bg-dark-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <Package size={64} className="text-gray-700 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-8">Start shopping to see your orders here</p>
            <Link to="/products" className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-8 py-3 rounded-full font-semibold">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-dark-800/60 backdrop-blur-sm border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-semibold">Order #{order.id}</span>
                    <span className="text-gray-500 text-xs ml-3">{fmtDate(order.created_at)}</span>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item.id} className="flex flex-col gap-1 items-center">
                      <div className="w-10 h-10 bg-dark-700 rounded-lg flex items-center justify-center text-lg">
                        {item.product?.image_url ? <img src={item.product.image_url} alt="" className="w-full h-full object-cover rounded-lg" /> : '📦'}
                      </div>
                      {item.selected_variants && (
                        <div className="flex flex-col gap-0.5">
                          {Object.entries(item.selected_variants).map(([k, v]) => (
                            <span key={k} className="text-[8px] text-gray-500 whitespace-nowrap">{v}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <span className="text-gray-500 text-xs">+{order.items.length - 3} more</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-brand-400 font-bold font-display">{fmt(order.total_amount)}</span>
                    <span className="text-gray-600 text-xs ml-2">· {order.items?.length} item(s)</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
