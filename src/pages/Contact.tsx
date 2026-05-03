
import {Mail, Phone, MapPin, Send} from 'lucide-react';
import {motion} from 'motion/react';

export const Contact = () => {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center text-center overflow-hidden bg-brand-black">
        <motion.div
          initial={{scale: 1.1, opacity: 0}}
          animate={{scale: 1, opacity: 0.5}}
          transition={{duration: 1.5}}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000"
            alt="Contact Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.span
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.5}}
            className="text-brand-gold font-black uppercase tracking-[0.4em] text-[10px] mb-6 block"
          >
            نحن هنا لخدمتك
          </motion.span>
          <motion.h1
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.7}}
            className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-none"
          >
            تواصل معنا
          </motion.h1>
          <motion.div
            initial={{width: 0}}
            animate={{width: 80}}
            transition={{delay: 1, duration: 0.8}}
            className="h-1 bg-brand-gold mx-auto"
          ></motion.div>
        </div>
      </section>

      <section className="py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-32">
            {/* Contact Info */}
            <motion.div
              initial={{opacity: 0, x: 30}}
              whileInView={{opacity: 1, x: 0}}
              viewport={{once: true}}
              className="space-y-20"
            >
              <div>
                <span className="section-subtitle !text-right">تواصل مباشر</span>
                <h3 className="text-3xl font-black text-brand-black mb-16 tracking-tighter uppercase">
                  معلومات الاتصال
                </h3>
                <div className="space-y-16">
                  {[
                    {
                      icon: MapPin,
                      title: 'موقعنا الرئيسي',
                      content: 'الدوحة، قطر - شارع الكورنيش، مبنى ٤٥',
                    },
                    {icon: Phone, title: 'الخط الساخن', content: '+٩٧٤ ٤٤٥٥ ٦٦٧٧'},
                    {icon: Mail, title: 'البريد الإلكتروني', content: 'hello@doharoastery.qa'},
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-10 group">
                      <div className="w-16 h-16 bg-brand-gray-50 flex items-center justify-center group-hover:bg-brand-gold transition-all duration-500 shadow-sm group-hover:shadow-premium">
                        <item.icon
                          className="text-brand-black group-hover:text-white transition-colors duration-500"
                          size={24}
                        />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray-400 mb-3">
                          {item.title}
                        </h4>
                        <p className="text-brand-black font-display font-black text-xl tracking-tight">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black mb-10 border-b border-brand-gray-100 pb-4">
                  ساعات العمل
                </h3>
                <ul className="space-y-8 text-sm">
                  <li className="flex justify-between items-center">
                    <span className="font-black text-brand-gray-400 uppercase tracking-[0.2em] text-[10px]">
                      السبت - الخميس
                    </span>
                    <span className="font-display font-black text-brand-black">
                      ٨:٠٠ ص - ١٠:٠٠ م
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-black text-brand-gray-400 uppercase tracking-[0.2em] text-[10px]">
                      الجمعة
                    </span>
                    <span className="font-display font-black text-brand-black">
                      ٤:٠٠ م - ١١:٠٠ م
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              className="lg:col-span-2"
            >
              <span className="section-subtitle !text-right">راسلنا</span>
              <h3 className="text-3xl font-black text-brand-black mb-16 tracking-tighter uppercase">
                أرسل لنا رسالة
              </h3>
              <form className="space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray-400 mb-4 block group-focus-within:text-brand-gold transition-colors">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      className="w-full py-5 bg-transparent border-b border-brand-gray-200 focus:outline-none focus:border-brand-gold transition-all text-lg font-bold placeholder:text-brand-gray-200"
                      placeholder="أدخل اسمك هنا"
                    />
                  </div>
                  <div className="relative group">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray-400 mb-4 block group-focus-within:text-brand-gold transition-colors">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      className="w-full py-5 bg-transparent border-b border-brand-gray-200 focus:outline-none focus:border-brand-gold transition-all text-lg font-bold placeholder:text-brand-gray-200"
                      placeholder="example@mail.com"
                    />
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray-400 mb-4 block group-focus-within:text-brand-gold transition-colors">
                    الموضوع
                  </label>
                  <input
                    type="text"
                    className="w-full py-5 bg-transparent border-b border-brand-gray-200 focus:outline-none focus:border-brand-gold transition-all text-lg font-bold placeholder:text-brand-gray-200"
                    placeholder="كيف يمكننا مساعدتك؟"
                  />
                </div>
                <div className="relative group">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray-400 mb-4 block group-focus-within:text-brand-gold transition-colors">
                    الرسالة
                  </label>
                  <textarea
                    rows={6}
                    className="w-full py-5 bg-transparent border-b border-brand-gray-200 focus:outline-none focus:border-brand-gold transition-all text-lg font-bold resize-none placeholder:text-brand-gray-200"
                    placeholder="اكتب رسالتك هنا..."
                  ></textarea>
                </div>
                <button className="btn-primary !px-16 !py-6 shadow-premium hover:shadow-premium-hover group flex items-center gap-6">
                  <span>إرسال الرسالة</span>
                  <Send
                    size={18}
                    className="group-hover:translate-x-[-8px] group-hover:translate-y-[-4px] transition-transform duration-500"
                  />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
