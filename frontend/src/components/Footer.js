import { Link } from 'react-router-dom';
import { 
  Package, Instagram, Twitter, Facebook, Mail, 
  Phone, ShieldCheck, Truck, ArrowRight, Heart
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-white/8 bg-dark-900/50 backdrop-blur-sm pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform">
                <Package size={18} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">Shop<span className="text-brand-400">Kenya</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Kenya's premium destination for quality products. Experience seamless shopping with fast delivery and secure M-Pesa payments.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/shopkenya" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:border-brand-400/50 transition-all">
                <Instagram size={16} />
              </a>
              <a href="https://twitter.com/shopkenya" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:border-brand-400/50 transition-all">
                <Twitter size={16} />
              </a>
              <a href="https://facebook.com/shopkenya" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:border-brand-400/50 transition-all">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Explore Shop</h4>
            <ul className="space-y-4">
              {[
                { name: 'All Products',   to: '/products' },
                { name: 'Featured Items', to: '/products?featured=true' },
                { name: 'New Arrivals',   to: '/products?sort=newest' },
                { name: 'Special Offers', to: '/products?on_sale=true' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-gray-400 hover:text-brand-400 text-sm transition-colors flex items-center gap-2 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Customer Support</h4>
            <ul className="space-y-4">
              {[
                { name: 'My Account',        to: '/orders' },
                { name: 'Order Tracking',   to: '/orders' },
                { name: 'Shipping Policy',  to: '/support/shipping' },
                { name: 'Returns & Refunds',to: '/support/returns' },
                { name: 'Privacy Policy',   to: '/support/privacy' },
                { name: 'FAQs',             to: '/support/faq' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-gray-400 hover:text-brand-400 text-sm transition-colors flex items-center gap-2 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Section */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold mb-6">Safe & Secure</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/8">
                <ShieldCheck className="text-green-400 mt-0.5" size={18} />
                <div>
                  <p className="text-white text-xs font-semibold">Secure Payments</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">MPESA & Card payments are encrypted</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/8">
                <Truck className="text-brand-400 mt-0.5" size={18} />
                <div>
                  <p className="text-white text-xs font-semibold">Fast Delivery</p>
                  <p className="text-gray-500 text-[10px] mt-0.5">Delivery across Kenya in 24-48 hours</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/8 flex items-center gap-2 text-gray-500 text-xs font-medium">
              <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white font-black text-[10px]">M</div>
              <span>Verified M-PESA Merchant</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
          <p>© {currentYear} ShopKenya. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <Heart size={12} className="text-red-500 fill-red-500" />
            <span>for Kenya</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
