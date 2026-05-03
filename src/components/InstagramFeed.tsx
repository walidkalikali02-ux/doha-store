
import { motion } from 'motion/react';
import { Instagram, Heart, MessageCircle } from 'lucide-react';
import roastingImage from '../images/1.jpeg';
import image2 from '../images/2.jpg';
import image3 from '../images/3.jpg';
import image4 from '../images/4.jpg';

const INSTAGRAM_POSTS = [
  {
    id: 1,
    image: roastingImage,
    caption: 'Behind the roast',
    likes: '1.2k',
    comments: '45'
  },
  {
    id: 2,
    image: image2,
    caption: 'Fresh beans',
    likes: '850',
    comments: '22'
  },
  {
    id: 3,
    image: image3,
    caption: 'Brew ritual',
    likes: '2.1k',
    comments: '89'
  },
  {
    id: 4,
    image: image4,
    caption: 'Roastery details',
    likes: '1.5k',
    comments: '34'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=600',
    caption: 'Café moment',
    likes: '3.2k',
    comments: '120'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=600',
    caption: 'Daily ritual',
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
            <p className="text-brand-gray-500 font-display font-black tracking-[0.3em] text-xs">@doha.roastery</p>
            <a 
              href="https://www.instagram.com/doha.roastery/" 
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
            <motion.a
              key={post.id}
              href="https://www.instagram.com/doha.roastery/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: post.id * 0.1 }}
              className="group relative aspect-square overflow-hidden bg-brand-gray-100 cursor-pointer"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4">
                <Instagram size={24} className="text-white mb-2" />
                <p className="text-white font-semibold text-xs tracking-[0.2em] uppercase">
                  {post.caption}
                </p>
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
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
