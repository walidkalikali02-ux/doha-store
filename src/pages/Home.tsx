import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Coffee, Zap, ShieldCheck, ChevronLeft, Star, Quote, PlayCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../types';
import { ProductCard } from '../components/ProductCard';

import { InstagramFeed } from '../components/InstagramFeed';

export const Home = () => {
  const featuredProducts = PRODUCTS.slice(0, 8);

  const testimonials = [
    {
      name: 'أحمد محمد',
      text: 'أفضل قهوة مختصة جربتها في قطر. التحميص دائماً طازج والنكهات واضحة جداً.',
      rating: 5
    },
    {
      name: 'سارة خالد',
      text: 'أدوات التحضير عندهم متنوعة وذات جودة عالية. خدمة العملاء ممتازة وسريعة.',
      rating: 5
    },
    {
      name: 'محمد علي',
      text: 'اشتراك القهوة الشهري مريح جداً، كل شهر يوصلني محصول جديد ومميز.',
      rating: 4
    }
  ];

  const guides = [
    {
      title: 'دليل تحضير V60',
      image: 'https://images.unsplash.com/photo-1544190855-903b0f393b05?auto=format&fit=crop&q=80&w=800',
      time: '5 دقائق'
    },
    {
      title: 'سر التحميص المثالي',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800',
      time: '8 دقائق'
    },
    {
      title: 'كيف تختار طاحونتك؟',
      image: 'https://images.unsplash.com/photo-1594631252845-29fc45865157?auto=format&fit=crop&q=80&w=800',
      time: '6 دقائق'
    }
  ];

  return (
    <div className="flex flex-col">
      <section className="relative min-h-[80vh] bg-[#FAFAF8] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 order-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="inline-block text-brand-gold text-sm tracking-[0.2em] uppercase mb-6 font-semibold">
                  محمصة الدوحة المختصة
                </span>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#1a1a1a] leading-[1.05] mb-8 tracking-tight">
                  نحصل على أفضل
                  <br />
                  <span className="text-brand-gold">القهوة</span>
                </h1>
                
                <p className="text-lg text-[#2a2a2a] leading-relaxed mb-10 max-w-lg font-medium">
                  نختار أفضل المحاصيل من المزارعين مباشرة ونحمصها بشغف لتقديم تجربة قهوة استثنائية في كل رشفة.
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
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center bg-white rounded-full px-6 py-5 gap-4 shadow-lg border border-gray-100">
                  <button className="w-14 h-14 bg-[#0F766E] hover:bg-[#0D5D57] rounded-full flex items-center justify-center text-white transition-colors duration-300 flex-shrink-0 shadow-md">
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

      {/* Categories Grid */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="section-subtitle">تصفح المجموعات</span>
            <h2 className="section-title">اختر رحلتك مع القهوة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Link to="/products?cat=coffee" className="group relative h-[600px] overflow-hidden bg-brand-gray-100 shadow-premium hover:shadow-premium-hover transition-all duration-700">
              <img
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1000"
                alt="Coffee Beans"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-black/30 group-hover:bg-brand-black/50 transition-colors duration-700"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">أفضل المحاصيل</span>
                <h2 className="text-5xl font-black mb-6 uppercase tracking-widest leading-none">القهوة المختصة</h2>
                <div className="overflow-hidden">
                  <span className="text-xs font-black border-b-2 border-brand-gold pb-1 translate-y-full group-hover:translate-y-0 transition-transform duration-700 block">تسوق الآن</span>
                </div>
              </div>
            </Link>
            <Link to="/tools" className="group relative h-[600px] overflow-hidden bg-brand-gray-100 shadow-premium hover:shadow-premium-hover transition-all duration-700">
              <img
                src="https://images.unsplash.com/photo-1544190855-903b0f393b05?auto=format&fit=crop&q=80&w=1000"
                alt="Coffee Tools"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-black/30 group-hover:bg-brand-black/50 transition-colors duration-700"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">أدوات احترافية</span>
                <h2 className="text-5xl font-black mb-6 uppercase tracking-widest leading-none">أدوات التحضير</h2>
                <div className="overflow-hidden">
                  <span className="text-xs font-black border-b-2 border-brand-gold pb-1 translate-y-full group-hover:translate-y-0 transition-transform duration-700 block">تسوق الآن</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-brand-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="section-subtitle">المحاصيل المختارة</span>
            <h2 className="section-title">الأكثر مبيعاً هذا الأسبوع</h2>
            <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-24 text-center">
            <Link to="/products" className="btn-outline border-brand-gray-200 hover:border-brand-black">
              عرض جميع المنتجات
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
                src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=1000"
                alt="Roasting Process"
                className="w-full h-auto shadow-premium relative z-10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -left-6 bg-brand-black p-8 text-white z-20 hidden md:block shadow-premium">
                <p className="text-4xl font-display font-black leading-none mb-1">10+</p>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-gold">سنوات من الخبرة</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="section-subtitle !text-right">فلسفتنا</span>
              <h2 className="text-5xl md:text-6xl font-black text-brand-black mb-10 leading-tight tracking-tighter">الدقة في كل <br /> تفاصيل التحميص</h2>
              <p className="text-brand-gray-500 text-lg leading-relaxed mb-12 font-medium">
                في محمصة الدوحة، نعتمد على أحدث التقنيات مع لمسة فنية بشرية. كل محصول يتم اختباره وتطوير ملف تحميص خاص به لإبراز أفضل ما فيه من نكهات وإيحاءات طبيعية.
              </p>
              <ul className="space-y-8">
                <li className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-brand-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold transition-colors duration-500">
                    <Coffee size={20} className="text-brand-black group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-brand-black mb-1 uppercase tracking-wider">اختيار مباشر</h4>
                    <p className="text-sm text-brand-gray-500 leading-relaxed">نتعامل مباشرة مع المزارعين لضمان الجودة والاستدامة والعدالة في التجارة.</p>
                  </div>
                </li>
                <li className="flex items-start gap-6 group">
                  <div className="w-12 h-12 bg-brand-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold transition-colors duration-500">
                    <Zap size={20} className="text-brand-black group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-brand-black mb-1 uppercase tracking-wider">تحميص حسب الطلب</h4>
                    <p className="text-sm text-brand-gray-500 leading-relaxed">نضمن لك نضارة القهوة من خلال التحميص المستمر بكميات صغيرة يومياً.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription CTA */}
      <section className="py-32 bg-brand-gold relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-black/5 -skew-x-12 translate-x-1/4"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="max-w-2xl text-center lg:text-right">
              <span className="text-[10px] font-black text-brand-black uppercase tracking-[0.5em] mb-4 block">خدمة حصرية</span>
              <h2 className="text-5xl md:text-7xl font-black text-brand-black mb-8 uppercase tracking-tighter leading-none">اشتراك القهوة <br /> الشهري</h2>
              <p className="text-brand-black/80 text-xl mb-12 leading-relaxed font-medium">
                لا تنقطع أبداً عن قهوتك المفضلة. اشترك الآن واحصل على محاصيل مختارة تصلك لباب منزلك شهرياً بخصم حصري وتوصيل مجاني.
              </p>
              <Link to="/products" className="btn-primary !bg-brand-black !text-white hover:!bg-white hover:!text-brand-black shadow-premium">
                اكتشف الباقات
              </Link>
            </div>
            <div className="w-full lg:w-1/3 aspect-square bg-brand-black/10 rounded-full flex items-center justify-center border-8 border-brand-black/5 relative group">
              <div className="absolute inset-0 rounded-full border-2 border-brand-black/20 animate-ping opacity-20"></div>
              <Coffee size={140} className="text-brand-black opacity-30 group-hover:scale-110 transition-transform duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* Brewing Guides */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="section-subtitle">أكاديمية الدوحة</span>
            <h2 className="section-title">أدلة التحضير الاحترافية</h2>
            <p className="text-brand-gray-500 uppercase tracking-[0.3em] text-[10px] mt-4">تعلم فن تحضير القهوة المختصة في المنزل</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {guides.map((guide, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -15 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/3] overflow-hidden mb-8 shadow-premium group-hover:shadow-premium-hover transition-all duration-500">
                  <img src={guide.image} alt={guide.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-brand-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px]">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <PlayCircle size={32} className="text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {guide.time}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-brand-black mb-2 uppercase tracking-tight group-hover:text-brand-gold transition-colors">{guide.title}</h3>
                <div className="w-10 h-0.5 bg-brand-gold group-hover:w-full transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-brand-gray-50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <div className="grid grid-cols-6 gap-20 -rotate-12 translate-y-[-20%]">
            {[...Array(24)].map((_, i) => (
              <Coffee key={i} size={100} className="text-brand-black" />
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="section-subtitle">آراء العملاء</span>
            <h2 className="section-title">ماذا يقول عشاق القهوة</h2>
            <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((t, index) => (
              <div key={index} className="bg-white p-12 shadow-premium hover:shadow-premium-hover transition-all duration-500 border border-brand-gray-100 relative group">
                <Quote className="absolute top-8 left-8 text-brand-gray-50 group-hover:text-brand-gold/10 transition-colors duration-500" size={60} />
                <div className="flex gap-1.5 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < t.rating ? 'fill-brand-gold text-brand-gold' : 'text-brand-gray-200'} />
                  ))}
                </div>
                <p className="text-brand-gray-500 italic mb-10 leading-relaxed text-lg relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-gray-50 flex items-center justify-center font-black text-brand-gold text-xs">
                    {t.name[0]}
                  </div>
                  <h4 className="font-black text-brand-black uppercase tracking-[0.2em] text-xs">{t.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* Newsletter */}
      <section className="py-32 bg-brand-black text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale" />
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <span className="section-subtitle !text-brand-gold">النشرة البريدية</span>
          <h2 className="text-5xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-none">انضم إلى مجتمعنا</h2>
          <p className="text-brand-gray-500 mb-16 text-xl max-w-2xl mx-auto leading-relaxed font-medium">احصل على آخر الأخبار، العروض الحصرية، ونصائح التحضير الاحترافية مباشرة في بريدك.</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="بريدك الإلكتروني"
              className="flex-1 px-8 py-5 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-gold transition-all duration-500 backdrop-blur-sm font-medium"
            />
            <button className="btn-primary !bg-brand-gold !text-brand-black hover:!bg-white shadow-premium">
              اشترك الآن
            </button>
          </form>
          <p className="mt-8 text-[10px] text-brand-gray-500 uppercase tracking-[0.3em]">نحن نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.</p>
        </div>
      </section>
    </div>
  );
};
