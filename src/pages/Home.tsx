
import {motion} from 'motion/react';
import {ArrowLeft, Coffee, Zap, Search} from 'lucide-react';
import {Link} from 'react-router-dom';
import {ProductCard} from '../components/ProductCard';
import roastingImage from '../images/1.jpeg';
import toolsImage from '../images/tools.webp';
import {useStoreProducts} from '@/utils/storeProducts';

import {InstagramFeed} from '../components/InstagramFeed';
import {SupabaseTest} from '../components/SupabaseTest';

export const Home = () => {
  const featuredProducts = useStoreProducts().slice(0, 8);

  return (
    <div className="flex flex-col">
      <SupabaseTest />
      <section className="relative min-h-[80vh] bg-[#FAFAF8] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 order-1">
              <motion.div
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8, delay: 0.2}}
              >
                <span className="inline-block text-brand-gold text-sm tracking-[0.2em] uppercase mb-6 font-semibold">
                  محمصة الدوحة المختصة
                </span>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] leading-[1.1] mb-8 tracking-tight">
                  قهوة مختصة تُحمّص
                  <br />
                  <span className="text-brand-gold">يوميًا في الدوحة</span>
                </h1>

                <p className="text-lg text-[#2a2a2a] leading-relaxed mb-10 max-w-lg font-medium">
                  نحضّرها يوميًا لعشاق القهوة والمقاهي. من محمصتنا إلى كوبك
                </p>

                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 bg-brand-gold text-[#141414] px-8 py-4 font-bold rounded-full hover:shadow-[0_8px_24px_rgba(198,163,85,0.4)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  اكتشف منتجاتنا
                  <ArrowLeft size={18} />
                </Link>
              </motion.div>
            </div>

            <div className="lg:col-span-5 order-2">
              <motion.div
                initial={{opacity: 0, x: 30}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: 0.8, delay: 0.3}}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center bg-white rounded-full px-6 py-5 gap-4 shadow-lg border border-gray-100">
                  <button className="w-14 h-14 bg-brand-gold hover:bg-[#b8944a] rounded-full flex items-center justify-center text-black transition-colors duration-300 flex-shrink-0 shadow-md">
                    <Search size={22} strokeWidth={2.5} />
                  </button>
                  <input
                    type="text"
                    placeholder="يبحث..."
                    className="flex-1 bg-transparent text-right text-lg text-[#1a1a1a] placeholder-[#999] outline-none font-medium tracking-wide"
                    dir="rtl"
                  />
                </div>
                <p className="text-sm text-[#666] text-center font-medium">
                  ابحث عن القهوة المفضلة لديك
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-subtitle">المحاصيل المختارة</span>
            <h2 className="section-title">الأكثر مبيعاً هذا الأسبوع</h2>
            <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/products"
              className="btn-outline border-brand-gray-200 hover:border-brand-black"
            >
              عرض جميع المنتجات
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="section-subtitle">تصفح المجموعات</span>
            <h2 className="section-title">اختر رحلتك مع القهوة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Link
              to="/products?cat=coffee"
              className="group relative h-[600px] overflow-hidden bg-brand-gray-100 shadow-premium hover:shadow-premium-hover transition-all duration-700"
            >
              <img
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1000"
                alt="Coffee Beans"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-black/30 group-hover:bg-brand-black/50 transition-colors duration-700"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                  أفضل المحاصيل
                </span>
                <h2 className="text-5xl font-black mb-6 uppercase tracking-widest leading-none">
                  القهوة المختصة
                </h2>
                <div className="overflow-hidden">
                  <span className="text-xs font-black border-b-2 border-brand-gold pb-1 translate-y-full group-hover:translate-y-0 transition-transform duration-700 block">
                    تسوق الآن
                  </span>
                </div>
              </div>
            </Link>
            <Link
              to="/tools"
              className="group relative h-[600px] overflow-hidden bg-brand-gray-100 shadow-premium hover:shadow-premium-hover transition-all duration-700"
            >
              <img
                src={toolsImage}
                alt="Coffee Tools"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-brand-black/30 group-hover:bg-brand-black/50 transition-colors duration-700"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                  أدوات احترافية
                </span>
                <h2 className="text-5xl font-black mb-6 uppercase tracking-widest leading-none">
                  أدوات التحضير
                </h2>
                <div className="overflow-hidden">
                  <span className="text-xs font-black border-b-2 border-brand-gold pb-1 translate-y-full group-hover:translate-y-0 transition-transform duration-700 block">
                    تسوق الآن
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-40 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl"></div>
              <img
                src={roastingImage}
                alt="Roasting Process"
                className="w-full h-auto shadow-premium relative z-10"
              />
              <div className="absolute -bottom-6 -left-6 bg-brand-black p-8 text-white z-20 hidden md:block shadow-premium">
                <p className="text-4xl font-display font-black leading-none mb-1">10+</p>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-gold">
                  سنوات من الخبرة
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="section-subtitle !text-right">فلسفتنا</span>
              <h2 className="text-5xl md:text-6xl font-black text-brand-black mb-10 leading-tight tracking-tighter">
                الدقة في كل <br /> تفاصيل التحميص
              </h2>
              <p className="text-brand-gray-500 text-lg leading-relaxed mb-12 font-medium">
                في محمصة الدوحة، نعتمد على أحدث التقنيات مع لمسة فنية بشرية. كل محصول يتم اختباره
                وتطوير ملف تحميص خاص به لإبراز أفضل ما فيه من نكهات وإيحاءات طبيعية.
              </p>
              <ul className="space-y-8">
                <li className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-brand-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold transition-colors duration-500">
                    <Coffee
                      size={20}
                      className="text-brand-black group-hover:text-white transition-colors duration-500"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-brand-black mb-1 uppercase tracking-wider">
                      اختيار مباشر
                    </h4>
                    <p className="text-sm text-brand-gray-500 leading-relaxed">
                      نتعامل مباشرة مع المزارعين لضمان الجودة والاستدامة والعدالة في التجارة.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-brand-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold transition-colors duration-500">
                    <Zap
                      size={20}
                      className="text-brand-black group-hover:text-white transition-colors duration-500"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-brand-black mb-1 uppercase tracking-wider">
                      تحميص حسب الطلب
                    </h4>
                    <p className="text-sm text-brand-gray-500 leading-relaxed">
                      نضمن لك نضارة القهوة من خلال التحميص المستمر بكميات صغيرة يومياً.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Doha Roastery */}
      <section className="py-24 bg-brand-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-gold text-xs font-black uppercase tracking-[0.3em] mb-4 block">
              لمحة عنا
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              لماذا دوحة روستري
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {icon: '☕', title: 'توريد للمقاهي', desc: 'نورد القهوة لمقاهي في مختلف أنحاء قطر'},
              {icon: '🏪', title: 'فروعنا', desc: 'أكثر من 5 فروع تعمل يوميًا'},
              {icon: '🔥', title: 'تحميص يومي', desc: 'تحميص يومي داخل الدوحة'},
              {icon: '⭐', title: 'ثقة عملائنا', desc: 'ثقة الاف العملاء'},
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-brand-gold/10 rounded-full flex items-center justify-center group-hover:bg-brand-gold/20 transition-colors duration-500">
                  <span className="text-4xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-black mb-3 uppercase tracking-wider">{item.title}</h3>
                <p className="text-brand-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <InstagramFeed />
    </div>
  );
};
