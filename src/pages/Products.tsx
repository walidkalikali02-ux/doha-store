import {useState, useEffect} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {ProductCard} from '../components/ProductCard';
import {
  Search,
  Coffee,
  Thermometer,
  Timer,
  Droplets,
  Calendar,
  Truck,
  Gift,
  ArrowRight,
} from 'lucide-react';
import {motion} from 'motion/react';
import {Link} from 'react-router-dom';
import {useStoreProducts} from '@/utils/storeProducts';

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('cat') || 'all';
  const products = useStoreProducts();

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    {id: 'all', name: 'الكل'},
    {id: 'coffee', name: 'القهوة المختصة'},
    {id: 'tools', name: 'أدوات التحضير', redirect: '/tools'},
    {id: 'accessories', name: 'إكسسوارات'},
  ];

  return (
    <div className="py-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <span className="section-subtitle">المتجر الإلكتروني</span>
          <h1 className="section-title">المحاصيل المختصة</h1>
          <div className="w-16 h-0.5 bg-brand-gold mx-auto mt-6"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-16">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-72 flex-shrink-0">
            <div className="sticky top-32 space-y-12">
              {/* Search */}
              <div className="glass-panel p-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black mb-6">
                  البحث
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث عن محصول..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full py-4 bg-transparent border-b border-brand-gray-200 focus:outline-none focus:border-brand-gold transition-all text-sm font-medium"
                  />
                  <Search
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-gray-300"
                    size={16}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="glass-panel p-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black mb-8">
                  الأقسام
                </h3>
                <ul className="space-y-6">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => {
                          if (cat.redirect) {
                            navigate(cat.redirect);
                          } else {
                            setSelectedCategory(cat.id);
                            setSearchParams({cat: cat.id});
                          }
                        }}
                        className={`text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between w-full group ${
                          selectedCategory === cat.id
                            ? 'text-brand-gold'
                            : 'text-brand-gray-500 hover:text-brand-black'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <div
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                            selectedCategory === cat.id
                              ? 'bg-brand-gold scale-100'
                              : 'bg-brand-gray-200 scale-0 group-hover:scale-100'
                          }`}
                        ></div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Info Card */}
              <div className="bg-brand-black p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <Truck className="text-brand-gold mb-6 relative z-10" size={24} />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 relative z-10">
                  توصيل سريع
                </h4>
                <p className="text-[10px] text-brand-gray-400 leading-relaxed relative z-10">
                  توصيل مجاني للطلبات فوق ٢٠٠ ريال قطري داخل الدوحة.
                </p>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-12 border-b border-brand-gray-100 pb-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-gray-400">
                  النتائج:
                </span>
                <span className="text-sm font-display font-black text-brand-black">
                  {filteredProducts.length} منتج
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-gray-500">
                <select className="bg-transparent border-none focus:ring-0 cursor-pointer text-brand-black font-black text-[10px] uppercase tracking-widest">
                  <option>الأحدث أولاً</option>
                  <option>السعر: من الأقل</option>
                  <option>السعر: من الأعلى</option>
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-brand-gray-50 border border-dashed border-brand-gray-200">
                <Coffee className="mx-auto text-brand-gray-200 mb-6" size={48} />
                <p className="text-brand-gray-500 uppercase tracking-[0.3em] text-xs font-black">
                  لم يتم العثور على نتائج
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSearchParams({cat: 'all'});
                  }}
                  className="mt-8 text-brand-gold font-black text-[10px] uppercase tracking-[0.2em] hover:text-brand-black transition-colors"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Section */}
        <motion.section
          initial={{opacity: 0}}
          whileInView={{opacity: 1}}
          viewport={{once: true}}
          className="mt-32 bg-brand-black p-12 md:p-20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-brand-gold font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">
                اشتراك القهوة
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                قهوتك المفضلة <br /> <span className="text-brand-gold">تصلك تلقائياً</span>
              </h2>
              <p className="text-brand-gray-400 mb-10 text-lg leading-relaxed">
                اشترك الآن واحصل على خصم 15% على جميع طلبياتك الدورية. اختر نوع القهوة والكمية
                والجدول الزمني الذي يناسبك.
              </p>
              <button className="bg-brand-gold text-brand-black px-10 py-4 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-colors flex items-center gap-4 group">
                ابدأ اشتراكك الآن
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                {
                  icon: Calendar,
                  title: 'جدولة مرنة',
                  desc: 'اختر التوصيل كل أسبوع أو أسبوعين أو شهر.',
                },
                {icon: Truck, title: 'توصيل مجاني', desc: 'جميع اشتراكات القهوة تشمل توصيل مجاني.'},
                {
                  icon: Gift,
                  title: 'هدايا حصرية',
                  desc: 'احصل على عينات مجانية من المحاصيل الجديدة.',
                },
                {icon: Coffee, title: 'إلغاء سهل', desc: 'يمكنك إيقاف أو إلغاء اشتراكك في أي وقت.'},
              ].map((item, idx) => (
                <div key={idx} className="bg-white/5 p-8 border border-white/10">
                  <item.icon className="text-brand-gold mb-4" size={24} />
                  <h4 className="text-white font-black text-sm mb-2 tracking-widest uppercase">
                    {item.title}
                  </h4>
                  <p className="text-brand-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Brewing Guide Section */}
        <motion.section
          initial={{opacity: 0, y: 40}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.8}}
          className="mt-32 border-t border-brand-gray-100 pt-24"
        >
          <div className="text-center mb-16">
            <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">
              نصائح التحضير
            </span>
            <h2 className="text-4xl font-black text-brand-black tracking-tight">
              دليل كوب القهوة المثالي
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              {
                icon: Coffee,
                title: 'الوزن',
                desc: 'استخدم ميزان دقيق لوزن القهوة والماء (نسبة 1:15 مثالية).',
              },
              {
                icon: Thermometer,
                title: 'الحرارة',
                desc: 'درجة حرارة الماء المثالية بين 90-94 درجة مئوية.',
              },
              {
                icon: Timer,
                title: 'الوقت',
                desc: 'وقت الاستخلاص يجب أن يكون بين 2:30 إلى 3:00 دقائق.',
              },
              {
                icon: Droplets,
                title: 'المياه',
                desc: 'استخدم مياه مفلترة للحصول على نكهة صافية وخالية من الشوائب.',
              },
            ].map((tip, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-16 h-16 bg-brand-gray-50 flex items-center justify-center mx-auto mb-6 group-hover:bg-brand-gold transition-colors duration-500">
                  <tip.icon
                    className="text-brand-black group-hover:text-white transition-colors"
                    size={24}
                  />
                </div>
                <h4 className="text-sm font-black text-brand-black mb-3 tracking-widest">
                  {tip.title}
                </h4>
                <p className="text-brand-gray-500 text-xs leading-relaxed font-medium">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Wholesale CTA */}
        <motion.section
          initial={{opacity: 0, y: 30}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          className="mt-32 bg-brand-gray-50 p-12 text-center"
        >
          <h2 className="text-3xl font-black text-brand-black mb-6 tracking-tight">
            هل تملك مقهى أو مطعم؟
          </h2>
          <p className="text-brand-gray-500 mb-10 max-w-2xl mx-auto font-medium">
            نحن نوفر حلولاً متكاملة لمبيعات الجملة، من توريد القهوة الطازجة إلى تدريب الباريستا
            وتوفير المعدات.
          </p>
          <Link
            to="/wholesale"
            className="inline-block border-2 border-brand-black text-brand-black px-12 py-4 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-black hover:text-white transition-all"
          >
            استفسر عن مبيعات الجملة
          </Link>
        </motion.section>

        {/* Newsletter Section */}
        <section className="mt-32 py-24 border-t border-brand-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-black text-brand-black mb-4 tracking-tight">
              انضم إلى قائمتنا البريدية
            </h2>
            <p className="text-brand-gray-500 mb-10 text-sm font-medium">
              كن أول من يعلم عن المحاصيل الجديدة، العروض الحصرية، وورش العمل.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 px-6 py-4 bg-brand-gray-50 border-none focus:ring-2 focus:ring-brand-gold outline-none text-sm font-bold"
              />
              <button className="bg-brand-black text-white px-10 py-4 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-gold transition-colors">
                اشترك الآن
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
