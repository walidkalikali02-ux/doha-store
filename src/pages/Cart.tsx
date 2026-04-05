import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-white">
        <div className="w-20 h-20 bg-brand-gray-50 text-brand-gray-200 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-3xl font-black text-brand-black mb-4 uppercase tracking-tighter">سلة التسوق فارغة</h2>
        <p className="text-brand-gray-500 mb-10 text-center max-w-md">يبدو أنك لم تضف أي منتجات إلى سلتك بعد. استكشف محاصيلنا المختصة وأدواتنا الرائعة.</p>
        <Link to="/products" className="btn-primary">
          ابدأ التسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-brand-black mb-4 uppercase tracking-tighter">سلة التسوق</h1>
          <div className="w-20 h-1 bg-brand-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="border-t border-brand-gray-200">
              {cart.map(item => (
                <div
                  key={item.id}
                  className="py-8 border-b border-brand-gray-200 flex flex-col sm:flex-row items-center gap-8"
                >
                  <Link to={`/product/${item.id}`} className="w-32 h-40 flex-shrink-0 bg-brand-gray-50 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.nameAr}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  
                  <div className="flex-1 text-center sm:text-right">
                    <Link to={`/product/${item.id}`} className="block">
                      <h3 className="text-lg font-black text-brand-black uppercase tracking-wider mb-1 hover:text-brand-gold transition-colors">
                        {item.nameAr}
                      </h3>
                      <p className="text-xs text-brand-gray-500 uppercase tracking-widest mb-4">
                        {item.originAr || 'محصول مختص'}
                      </p>
                    </Link>
                    
                    <div className="flex items-center justify-center sm:justify-start gap-6">
                      <div className="flex items-center border border-brand-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-brand-gray-50 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-brand-gray-50 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-bold text-brand-gray-500 hover:text-red-500 uppercase tracking-widest transition-colors"
                      >
                        إزالة
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-lg font-black text-brand-black">
                    {item.price * item.quantity} ريال
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10">
              <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-brand-gray-500 hover:text-brand-black transition-colors">
                <ChevronLeft size={16} /> العودة للمتجر
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-brand-gray-50 p-8 sticky top-32">
              <h2 className="text-xl font-black text-brand-black mb-8 uppercase tracking-tighter">ملخص الطلب</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-brand-gray-500 uppercase tracking-widest">
                  <span>المجموع الفرعي</span>
                  <span>{totalPrice} ريال</span>
                </div>
                <div className="flex justify-between text-sm text-brand-gray-500 uppercase tracking-widest">
                  <span>الشحن</span>
                  <span className="text-brand-gold font-bold">مجاني</span>
                </div>
                <div className="border-t border-brand-gray-200 pt-6 flex justify-between font-black text-2xl text-brand-black">
                  <span>الإجمالي</span>
                  <span>{totalPrice} ريال</span>
                </div>
              </div>
              <button className="w-full btn-primary">
                إتمام الطلب
              </button>
              <div className="mt-8 space-y-4">
                <p className="text-[10px] text-brand-gray-500 text-center leading-relaxed">
                  بإتمامك للطلب، أنت توافق على الشروط والأحكام الخاصة بمحمصة الدوحة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
