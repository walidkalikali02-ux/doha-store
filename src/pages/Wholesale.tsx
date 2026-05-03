import {motion} from 'motion/react';
import {
  ArrowRight,
  Coffee,
  Instagram,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  BadgePercent,
} from 'lucide-react';
import {Link} from 'react-router-dom';

const wholesaleHighlights = [
  {
    icon: Coffee,
    title: 'قهوة مخصصة للجملة',
    desc: 'اختيارات مخصصة للمقاهي والمطاعم بعطور متوازنة وثبات في الجودة.',
  },
  {
    icon: Truck,
    title: 'توريد منتظم',
    desc: 'تسليم متكرر ومواعيد واضحة لضمان توفر المنتج في الوقت المناسب.',
  },
  {
    icon: ShieldCheck,
    title: 'ثبات في الطعم',
    desc: 'نحافظ على نفس البروفايل في كل دفعة حتى تبقى التجربة ثابتة لعملائك.',
  },
  {
    icon: Users,
    title: 'دعم للمقاهي',
    desc: 'نساعدك في اختيار البن، الإعداد، والتشغيل بما يناسب علامتك التجارية.',
  },
];

const offers = [
  'أسعار خاصة للكميات الكبيرة',
  'تحميص حسب الطلب',
  'تخصيص النكهات والبروفايل',
  'توصيل داخل قطر',
  'استشارات لتجهيز قائمة القهوة',
  'تدريب أساسي للباريستا عند الطلب',
];

export const Wholesale = () => {
  return (
    <div className="bg-brand-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.18),_transparent_35%),linear-gradient(135deg,_#111111_0%,_#1a120a_55%,_#0b0b0b_100%)]" />
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=2000"
            alt="Wholesale coffee background"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div
              initial={{opacity: 0, y: 24}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.8}}
              className="max-w-3xl"
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
                <Sparkles size={12} />
                Wholesale
              </span>
              <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                مبيعات الجملة
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                نقدم حلول جملة للمقاهي، المطاعم، والفنادق التي تبحث عن قهوة ثابتة، مميزة، وسهلة
                الاعتماد عليها في التشغيل اليومي.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="https://wa.me/97444556677?text=Hello%20Doha%20Roastery%2C%20I%20am%20interested%20in%20wholesale%20coffee%20supply."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-6 py-4 font-black text-black transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={18} />
                  تواصل عبر WhatsApp
                </a>
                <a
                  href="https://www.instagram.com/doha.roastery/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-4 font-black text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  <Instagram size={18} />
                  Instagram
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 28}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.8, delay: 0.15}}
              className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl shadow-2xl shadow-black/30 sm:p-8"
            >
              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
                    WhatsApp
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">+974 4455 6677</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    أسرع وسيلة لطلب عرض سعر أو بدء التوريد.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
                    Instagram
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">@doha.roastery</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    تابع أحدث المحاصيل، التحميص، والعروض.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
                    Offer
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Pricing, roasting, supply, and training
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f2e8] text-brand-black">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mb-12 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
              About wholesale
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-brand-black sm:text-4xl">
              عرض الجملة من دوحة روستري
            </h2>
            <p className="mt-5 text-lg leading-8 text-brand-gray-500">
              إذا كنت تدير مقهى أو مطعمًا أو فندقًا، فنحن نوفر لك توريدًا ثابتًا وقهوة تناسب
              هوية مكانك وتوقعات عملائك.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.3}}
              transition={{duration: 0.7}}
              className="grid gap-4 sm:grid-cols-2"
            >
              {wholesaleHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[1.75rem] border border-brand-gray-100 bg-white p-7 shadow-[0_18px_50px_rgba(17,17,17,0.08)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-6 text-xl font-black tracking-tight text-brand-black">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-brand-gray-500">{item.desc}</p>
                  </div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true, amount: 0.3}}
              transition={{duration: 0.7, delay: 0.1}}
              className="rounded-[2rem] border border-brand-gray-100 bg-brand-black p-8 text-white shadow-[0_20px_60px_rgba(17,17,17,0.16)]"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
                What is included
              </p>
              <h3 className="mt-4 text-3xl font-black tracking-tight">ما الذي نقدمه؟</h3>
              <div className="mt-8 space-y-4">
                {offers.map((offer) => (
                  <div key={offer} className="flex items-start gap-3">
                    <BadgePercent size={18} className="mt-1 text-brand-gold" />
                    <p className="text-sm leading-7 text-white/80">{offer}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-sm font-semibold text-white">
                  نبدأ عادةً من تواصل أولي سريع ثم نحدد:
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-white/75">
                  <li>• نوع البن المناسب لمكانك</li>
                  <li>• حجم الطلب والتوريد</li>
                  <li>• مستوى التحميص والنكهات</li>
                  <li>• خطة الأسعار والاتفاق التجاري</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-brand-black">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm sm:p-12">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
              Contact
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              جاهز لبدء طلب الجملة؟
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70">
              أرسل لنا رسالة على WhatsApp أو تابعنا على Instagram وسنرد عليك بأقرب وقت مع
              تفاصيل العرض المناسب لعملك.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/97444556677?text=Hello%20Doha%20Roastery%2C%20please%20send%20me%20your%20wholesale%20offer."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-6 py-4 font-black text-black transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle size={18} />
                WhatsApp
                <ArrowRight size={16} />
              </a>
              <a
                href="https://www.instagram.com/doha.roastery/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-4 font-black text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                <Instagram size={18} />
                Instagram
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-transparent px-6 py-4 font-black text-white transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                تواصل عام
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
