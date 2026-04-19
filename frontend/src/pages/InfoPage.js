import { useParams, Link } from 'react-router-dom';
import { 
  Shield, Truck, RotateCcw, HelpCircle, 
  ChevronRight, ArrowLeft 
} from 'lucide-react';

const CONTENT = {
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    color: 'text-blue-400',
    text: `Your privacy is important to us. ShopKenya is committed to protecting the data you share with us. We use your information only to facilitate your orders and improve your shopping experience. We never sell your personal data to third parties.`
  },
  shipping: {
    title: 'Shipping & Delivery',
    icon: Truck,
    color: 'text-brand-400',
    text: `We deliver across Kenya within 24-48 hours. Orders within Nairobi are often delivered the same day. Shipping is FREE for orders above KES 5,000. For orders below that, a flat rate of KES 300 applies.`
  },
  returns: {
    title: 'Returns & Refunds',
    icon: RotateCcw,
    color: 'text-red-400',
    text: `Not satisfied with your purchase? You can return any item in its original condition within 30 days for a full refund or exchange. Contact our support team to initiate a return.`
  },
  faq: {
    title: 'FAQs',
    icon: HelpCircle,
    color: 'text-green-400',
    text: `Common questions: \n- Do you accept M-Pesa? Yes, it's our primary payment method.\n- Can I pay on delivery? We currently prioritize secure digital payments via STK push.\n- Where is your store? We are an online-first retailer based in Nairobi.`
  }
};

export default function InfoPage() {
  const { type } = useParams();
  const info = CONTENT[type] || CONTENT.privacy;
  const Icon = info.icon;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8 overflow-hidden whitespace-nowrap">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-gray-300">Support</span>
          <ChevronRight size={10} />
          <span className="text-brand-400">{info.title}</span>
        </nav>

        {/* Header */}
        <div className="bg-dark-800/60 backdrop-blur-xl border border-white/8 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className={`absolute top-0 right-0 p-8 opacity-10 ${info.color}`}>
            <Icon size={120} />
          </div>
          
          <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${info.color}`}>
              <Icon size={24} />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              {info.title}
            </h1>
            <div className="w-20 h-1 bg-brand-500 rounded-full mb-8" />
            
            <div className="space-y-6">
              {info.text.split('\n').map((para, i) => (
                <p key={i} className="text-gray-400 text-lg leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-brand-500/5 border border-brand-500/20 rounded-2xl">
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="text-white font-medium">Still have questions?</p>
              <p className="text-gray-500 text-xs">Our support team is ready to help 24/7.</p>
            </div>
          </div>
          <Link to="/products" className="w-full sm:w-auto px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/20 text-center">
            Contact Support
          </Link>
        </div>

        <Link to="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mt-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Shopping</span>
        </Link>
      </div>
    </div>
  );
}
