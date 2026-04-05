import React, { useState } from 'react';
import { PRODUCTS } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, Wrench, Settings, Coffee, Timer, Thermometer, Droplets, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export const Tools = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const toolProducts = PRODUCTS.filter(product => {
    const isTool = product.category === 'tools';
    const matchesSearch = product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isTool && matchesSearch;
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-center overflow-hidden bg-brand-black">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544190855-903b0f393b05?auto=format&fit=crop&q=80&w=2000"
            alt="Coffee Tools Hero"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/60 to-brand-black"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-brand-gold font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">
              معدات وأدوات التحضير
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-none">
              احترافية التحضير <br />
              <span className="text-brand-gold">في منزلك</span>
            </h1>
            <p className="text-lg text-brand-gray-100 mb-12 max-w-2xl mx-auto font-medium leading-relaxed opacity-80">
              نقدم لك أفضل الأدوات العالمية المختارة بعناية لتصل إلى كوب القهوة المثالي بكل دقة وسهولة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-32 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-16">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-72 flex-shrink-0">
              <div className="sticky top-32 space-y-12">
                {/* Search */}
                <div className="glass-panel p-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black mb-6">البحث في الأدوات</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ابحث عن أداة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-4 bg-transparent border-b border-brand-gray-200 focus:outline-none focus:border-brand-gold transition-all text-sm font-medium"
                    />
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-gray-300" size={16} />
                  </div>
                </div>

                {/* Categories/Types */}
                <div className="glass-panel p-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black mb-8">نوع الأداة</h3>
                  <ul className="space-y-6">
                    {['مطاحن', 'أدوات تقطير', 'غلايات', 'موازين', 'إكسسوارات'].map((type) => (
                      <li key={type}>
                        <button className="text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between w-full group text-brand-gray-500 hover:text-brand-black">
                          <span>{type}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-gray-200 scale-0 group-hover:scale-100 transition-all duration-500"></div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quality Badge */}
                <div className="bg-brand-black p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <Settings className="text-brand-gold mb-6 relative z-10" size={24} />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 relative z-10">ضمان الجودة</h4>
                  <p className="text-[10px] text-brand-gray-400 leading-relaxed relative z-10">
                    جميع الأدوات المتوفرة لدينا أصلية ١٠٠٪ ومضمونة من الوكلاء الرسميين.
                  </p>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-12 border-b border-brand-gray-100 pb-8">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-gray-400">المعدات المتاحة:</span>
                  <span className="text-sm font-display font-black text-brand-black">{toolProducts.length} أداة</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-gray-500">
                  <select className="bg-transparent border-none focus:ring-0 cursor-pointer text-brand-black font-black text-[10px] uppercase tracking-widest">
                    <option>الأحدث أولاً</option>
                    <option>السعر: من الأقل</option>
                    <option>السعر: من الأعلى</option>
                  </select>
                </div>
              </div>

              {toolProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
                  {toolProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-brand-gray-50 border border-dashed border-brand-gray-200">
                  <Wrench className="mx-auto text-brand-gray-200 mb-6" size={48} />
                  <p className="text-brand-gray-500 uppercase tracking-[0.3em] text-xs font-black">لم يتم العثور على أدوات</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-8 text-brand-gold font-black text-[10px] uppercase tracking-[0.2em] hover:text-brand-black transition-colors"
                  >
                    عرض جميع الأدوات
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Section */}
      <section className="py-32 bg-brand-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">العناية بالمعدات</span>
              <h2 className="text-5xl font-black text-brand-black mb-8 leading-tight">حافظ على أداء <br /> أدواتك لسنوات</h2>
              <p className="text-brand-gray-500 text-lg leading-relaxed mb-10">
                الاستثمار في أدوات عالية الجودة يتطلب عناية مستمرة. نوفر لك قطع الغيار الأصلية ومحاليل التنظيف المتخصصة لضمان استمرارية جودة كوبك اليومي.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <Wrench className="text-brand-gold flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-brand-black text-sm mb-1">قطع غيار</h4>
                    <p className="text-xs text-brand-gray-500">متوفرة لجميع الماركات العالمية.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Droplets className="text-brand-gold flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-brand-black text-sm mb-1">محاليل تنظيف</h4>
                    <p className="text-xs text-brand-gray-500">آمنة وفعالة لجميع أنواع المكائن.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1594631252845-29fc45865157?auto=format&fit=crop&q=80&w=1000"
                alt="Tools Maintenance"
                className="w-full h-auto shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-gold flex items-center justify-center p-8 text-center hidden md:flex">
                <p className="text-brand-black font-black text-xs uppercase tracking-widest leading-tight">
                  جودة <br /> لا تضاهى
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wholesale Tools CTA */}
      <section className="py-24 bg-brand-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black mb-8 tracking-tighter uppercase">تجهيز المقاهي والمطاعم</h2>
          <p className="text-brand-gray-500 mb-12 max-w-2xl mx-auto text-lg">
            هل تخطط لافتتاح مشروعك الخاص؟ نحن نوفر لك استشارات فنية وتجهيزات كاملة بأفضل الأسعار التنافسية.
          </p>
          <Link 
            to="/wholesale" 
            className="inline-block bg-brand-gold text-brand-black px-12 py-5 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl"
          >
            طلب عرض سعر للمعدات
          </Link>
        </div>
      </section>
    </div>
  );
};
