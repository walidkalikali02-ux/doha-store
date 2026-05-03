
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-brand-black text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="space-y-8">
            <Link to="/" className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white uppercase">DOHA ROASTERY</span>
              <span className="text-xs font-bold tracking-[0.4em] text-brand-gold -mt-1">محمصة الدوحة</span>
            </Link>
            <p className="text-brand-gray-500 text-sm leading-relaxed max-w-xs">
              نحن نؤمن بأن القهوة هي لغة عالمية تجمع الناس. في محمصة الدوحة، نسعى لتقديم أفضل تجربة قهوة مختصة في قطر.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-brand-gray-500 hover:text-brand-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-brand-gray-500 hover:text-brand-gold transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-brand-gray-500 hover:text-brand-gold transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8">المتجر</h3>
            <ul className="space-y-4 text-sm text-brand-gray-500">
              <li><Link to="/products?cat=coffee" className="hover:text-white transition-colors">القهوة المختصة</Link></li>
              <li><Link to="/tools" className="hover:text-white transition-colors">أدوات التحضير</Link></li>
              <li><Link to="/products?cat=accessories" className="hover:text-white transition-colors">الإكسسوارات</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">جميع المنتجات</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8">الشركة</h3>
            <ul className="space-y-4 text-sm text-brand-gray-500">
              <li><Link to="/about" className="hover:text-white transition-colors">قصتنا</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">تواصل معنا</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-white transition-colors">سياسة الشحن</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8">تواصل معنا</h3>
            <ul className="space-y-6 text-sm text-brand-gray-500">
              <li className="flex items-start gap-4">
                <MapPin size={18} className="text-brand-gold flex-shrink-0" />
                <span>الدوحة، قطر - شارع الكورنيش، مبنى 45</span>
              </li>
              <li className="flex items-start gap-4">
                <Phone size={18} className="text-brand-gold flex-shrink-0" />
                <span>+974 4455 6677</span>
              </li>
              <li className="flex items-start gap-4">
                <Mail size={18} className="text-brand-gold flex-shrink-0" />
                <span>hello@doharoastery.qa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gray-500">
          <p>© 2026 محمصة الدوحة. جميع الحقوق محفوظة.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
