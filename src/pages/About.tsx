import React from 'react';
import { motion } from 'motion/react';

export const About = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center justify-center text-center overflow-hidden bg-brand-black">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000"
            alt="Roastery Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-brand-gold font-black uppercase tracking-[0.4em] text-[10px] mb-6 block"
          >
            تراثنا وشغفنا
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-none"
          >
            عن محمصة الدوحة
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="h-1 bg-brand-gold mx-auto"
          ></motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -right-16 -top-16 text-[15rem] font-display font-black text-brand-gray-50 select-none z-0 leading-none opacity-50">
                01
              </div>
              <div className="relative z-10">
                <span className="section-subtitle !text-right">فلسفتنا</span>
                <h2 className="text-5xl md:text-6xl font-black text-brand-black mb-12 leading-tight tracking-tighter">
                  القهوة ليست مجرد مشروب، <br /> بل هي <span className="text-brand-gold">فن وإرث</span>
                </h2>
                <p className="text-brand-gray-500 text-xl leading-relaxed mb-10 font-medium">
                  بدأت رحلتنا في قلب الدوحة، مدفوعين بشغف حقيقي للقهوة المختصة. نحن لسنا مجرد محمصة، بل نحن مجتمع يجمع عشاق القهوة الذين يبحثون عن الجودة والتميز في كل كوب.
                </p>
                <p className="text-brand-gray-500 text-xl leading-relaxed mb-16 font-medium">
                  نحن نسافر حول العالم لاختيار أفضل المحاصيل من المزارع المستدامة، ونعمل مباشرة مع المزارعين لضمان حصولهم على أسعار عادلة وحصولنا على أفضل جودة ممكنة.
                </p>
                <div className="grid grid-cols-2 gap-16 border-t border-brand-gray-100 pt-16">
                  <div className="group">
                    <h4 className="text-6xl font-display font-black text-brand-black mb-3 tracking-tighter group-hover:text-brand-gold transition-colors duration-500">50+</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray-400">محصول فريد</p>
                  </div>
                  <div className="group">
                    <h4 className="text-6xl font-display font-black text-brand-black mb-3 tracking-tighter group-hover:text-brand-gold transition-colors duration-500">10k+</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray-400">عميل سعيد</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden shadow-premium group">
                <img
                  src="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=1000"
                  alt="Roasting Process"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-12 -right-12 bg-brand-black p-16 hidden md:block border-l-8 border-brand-gold shadow-premium"
              >
                <p className="text-3xl font-display font-black text-white uppercase tracking-tighter leading-tight">
                  نحمص بكل حب <br /> <span className="text-brand-gold">منذ ٢٠٢٠</span>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values - Bento Style */}
      <section className="py-32 bg-brand-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-brand-gold font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">قيمنا الأساسية</span>
            <h2 className="text-4xl font-black text-brand-black tracking-tight">ما نؤمن به</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: '01', title: 'الجودة', desc: 'لا نساوم أبداً على جودة المحاصيل وعملية التحميص الدقيقة.' },
              { id: '02', title: 'الاستدامة', desc: 'ندعم الممارسات الزراعية المستدامة والتجارة العادلة مع المزارعين.' },
              { id: '03', title: 'الابتكار', desc: 'نبحث دائماً عن طرق تقنية جديدة لتحسين استخلاص النكهات.' }
            ].map((value, idx) => (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-12 border border-brand-gray-100 hover:border-brand-gold transition-colors group"
              >
                <div className="text-4xl font-black text-brand-gray-100 group-hover:text-brand-gold/20 transition-colors mb-8">
                  {value.id}
                </div>
                <h3 className="text-xl font-black text-brand-black tracking-widest mb-4">{value.title}</h3>
                <p className="text-brand-gray-500 text-sm leading-relaxed font-medium">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
