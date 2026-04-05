import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Heart, MessageCircle } from 'lucide-react';

const INSTAGRAM_POSTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600',
    likes: '1.2k',
    comments: '45'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=600',
    likes: '850',
    comments: '22'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1544190855-903b0f393b05?auto=format&fit=crop&q=80&w=600',
    likes: '2.1k',
    comments: '89'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=600',
    likes: '1.5k',
    comments: '34'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=600',
    likes: '3.2k',
    comments: '120'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=600',
    likes: '980',
    comments: '15'
  }
];

export const InstagramFeed = () => {
  return (
    <section className="py-32 bg-white border-t border-brand-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <div className="text-right">
            <span className="section-subtitle !text-right">مجتمعنا على التواصل</span>
            <h2 className="section-title !text-right !mb-0">
              تابعونا على <br />
              <span className="text-brand-gold">إنستغرام</span>
            </h2>
          </div>
          <div className="flex flex-col items-end gap-6">
            <p className="text-brand-gray-500 font-display font-black tracking-[0.3em] text-xs">@DohaRoastery</p>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary shadow-premium hover:shadow-premium-hover"
            >
              <Instagram size={16} /> تابعنا الآن
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {INSTAGRAM_POSTS.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: post.id * 0.1 }}
              className="group relative aspect-square overflow-hidden bg-brand-gray-100 cursor-pointer"
            >
              <img
                src={post.image}
                alt={`Instagram Post ${post.id}`}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4">
                <Instagram size={24} className="text-white mb-2" />
                <div className="flex gap-6 text-white font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <Heart size={14} className="fill-white" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} className="fill-white" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
