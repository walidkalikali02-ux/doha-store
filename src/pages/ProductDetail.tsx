
import {useParams, useNavigate} from 'react-router-dom';
import {useCart} from '../hooks/useCartLegacy';
import {ShoppingBag, ChevronRight, Coffee, MapPin, Thermometer, Droplets} from 'lucide-react';
import {motion} from 'motion/react';

import {ProductCard} from '../components/ProductCard';
import {useStoreProducts} from '@/utils/storeProducts';

export const ProductDetail = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {addToCart} = useCart();
  const products = useStoreProducts();

  const product = products.find(p => p.id === id);

  const relatedProducts = products.filter(
    p => p.category === product?.category && p.id !== product?.id
  ).slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
        <h2 className="text-2xl font-black text-brand-black mb-6 uppercase tracking-tighter">
          المنتج غير موجود
        </h2>
        <button onClick={() => navigate('/products')} className="btn-primary">
          العودة للمتجر
        </button>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gray-500 mb-12">
          <button
            onClick={() => navigate('/')}
            className="hover:text-brand-black transition-colors"
          >
            الرئيسية
          </button>
          <ChevronRight size={12} />
          <button
            onClick={() => navigate('/products')}
            className="hover:text-brand-black transition-colors"
          >
            المتجر
          </button>
          <ChevronRight size={12} />
          <span className="text-brand-black">{product.nameAr}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              className="aspect-[4/5] bg-brand-gray-50 overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.nameAr}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="border-b border-brand-gray-200 pb-10 mb-10">
              <span className="text-brand-gold font-bold text-xs uppercase tracking-[0.3em] mb-4 block">
                {product.category === 'coffee' ? 'القهوة المختصة' : 'أدوات التحضير'}
              </span>
              <h1 className="text-5xl font-black text-brand-black mb-6 uppercase tracking-tighter leading-tight">
                {product.nameAr}
              </h1>
              <div className="flex items-center gap-2 mb-8">
                <span className="text-3xl font-black text-brand-black">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'QAR',
                    maximumFractionDigits: 0,
                  }).format(product.price)}
                </span>
              </div>
              <p className="text-brand-gray-500 text-lg leading-relaxed">{product.descriptionAr}</p>
            </div>

            {product.category === 'coffee' && (
              <div className="grid grid-cols-2 gap-y-10 gap-x-12 mb-12">
                <div className="flex items-start gap-4">
                  <MapPin className="text-brand-gold flex-shrink-0" size={24} />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray-500 mb-1">
                      المنشأ
                    </h4>
                    <p className="font-bold text-brand-black">{product.originAr}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Thermometer className="text-brand-gold flex-shrink-0" size={24} />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray-500 mb-1">
                      التحميص
                    </h4>
                    <p className="font-bold text-brand-black">{product.roastLevelAr}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Coffee className="text-brand-gold flex-shrink-0" size={24} />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray-500 mb-1">
                      السلالة
                    </h4>
                    <p className="font-bold text-brand-black">أرابيكا 100%</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Droplets className="text-brand-gold flex-shrink-0" size={24} />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray-500 mb-1">
                      المعالجة
                    </h4>
                    <p className="font-bold text-brand-black">مغسولة / مجففة</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <button
                onClick={() => addToCart(product)}
                className="w-full btn-primary flex items-center justify-center gap-3"
              >
                <ShoppingBag size={20} /> إضافة إلى السلة
              </button>

              <div className="pt-10 border-t border-brand-gray-200">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray-500 mb-4">
                  تفاصيل إضافية
                </h4>
                <ul className="space-y-2 text-sm text-brand-gray-500">
                  <li className="flex justify-between">
                    <span>الوزن</span>
                    <span className="font-bold text-brand-black">250 جرام</span>
                  </li>
                  <li className="flex justify-between">
                    <span>تاريخ التحميص</span>
                    <span className="font-bold text-brand-black">طازج أسبوعياً</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{opacity: 0, y: 40}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.8}}
            className="mt-32 border-t border-brand-gray-100 pt-24"
          >
            <div className="text-center mb-16">
              <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">
                اكتشف المزيد
              </span>
              <h2 className="text-4xl font-black text-brand-black tracking-tight">
                قد يعجبك أيضاً
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};
