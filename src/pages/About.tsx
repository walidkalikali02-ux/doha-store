import { motion } from 'motion/react';
import { Coffee, Factory, Globe2, Sparkles, Users2 } from 'lucide-react';

const highlights = [
  {
    icon: Factory,
    title: 'التحميص اليومي',
    desc: 'نحمّص يوميًا للحفاظ على الثبات والانتعاش في كل دفعة.',
  },
  {
    icon: Coffee,
    title: 'تجربة من الطرفين',
    desc: 'نفهم القهوة من الإنتاج إلى التقديم لأننا نعمل داخل المحمصة والمقهى معًا.',
  },
  {
    icon: Users2,
    title: 'ثقة السوق',
    desc: 'نخدم مقاهي وعملاء يقدّرون الجودة الثابتة والطعم المتوازن.',
  },
];

export const About = () => {
  return (
    <div className="bg-brand-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.22),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_32%),linear-gradient(135deg,_#111111_0%,_#1a120a_55%,_#0b0b0b_100%)]" />
          <motion.div
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.22 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2000"
              alt="Doha Roastery coffee background"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        <div className="relative mx-auto flex min-h-[72vh] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
                <Sparkles size={12} />
                About us
              </span>
              <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
                عن دوحة روستري
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                بدأنا بهدف واحد: تقديم قهوة استثنائية في قطر. نبني التجربة من التحميص إلى
                التقديم، ونعمل كل يوم على أن تكون النتيجة ثابتة، واضحة، ومميزة.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl shadow-2xl shadow-black/30 sm:p-8"
            >
              <div className="grid gap-4">
                {[
                  { label: 'Daily roast', value: 'Fresh batches every day' },
                  { label: 'Cafés operated', value: 'Multiple coffee shops' },
                  { label: 'Focus', value: 'Quality, consistency, taste' },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white/90">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f2e8] text-brand-black">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mb-12 flex items-center gap-3 text-brand-gold">
            <Globe2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.35em]">Bilingual story</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7 }}
              className="rounded-[2rem] border border-brand-gray-100 bg-white p-8 shadow-[0_20px_60px_rgba(17,17,17,0.08)] sm:p-10"
              dir="rtl"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
                العربية
              </p>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-brand-black sm:text-4xl">
                عن دوحة روستري
              </h2>
              <div className="mt-8 space-y-6 text-lg leading-9 text-brand-gray-500">
                <p>بدأت دوحة روستري بهدف واحد — تقديم قهوة استثنائية في قطر.</p>
                <p>
                  نحمّص يوميًا ونشغّل عدة مقاهي، لذلك نفهم القهوة من جميع جوانبها — من الإنتاج
                  إلى التجربة.
                </p>
                <p>
                  اليوم نفخر بتوريد القهوة لعملاء ومقاهي تهتم بالجودة والثبات في الطعم.
                </p>
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="rounded-[2rem] border border-brand-gray-100 bg-brand-black p-8 shadow-[0_20px_60px_rgba(17,17,17,0.15)] sm:p-10"
              dir="ltr"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
                English
              </p>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                About Doha Roastery
              </h2>
              <div className="mt-8 space-y-6 text-lg leading-9 text-white/75">
                <p>Doha Roastery was built with one goal — to serve exceptional coffee across Qatar.</p>
                <p>
                  From roasting beans daily to operating multiple coffee shops, we understand
                  coffee from both sides — production and experience.
                </p>
                <p>
                  Today, we proudly supply cafés and customers who value quality, consistency,
                  and taste.
                </p>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      <section className="bg-brand-black">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10 max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-gold">
              What defines us
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Why people work with Doha Roastery
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7 backdrop-blur-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-6 text-xl font-black tracking-tight text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/70">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
