import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Plus, Share2, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isShared, setIsShared] = useState(false);
  const [showSocials, setShowSocials] = useState(false);

  const productUrl = `${window.location.origin}/product/${product.id}`;
  const shareText = `اكتشف ${product.nameAr} من محمصة الدوحة`;

  const handleGeneralShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: product.nameAr,
      text: product.descriptionAr,
      url: productUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(productUrl);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-[#25D366]',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + productUrl)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-[#1877F2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-[#1DA1F2]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`
    }
  ];

  return (
    <div className="group relative bg-white">
      <div className="relative overflow-hidden aspect-[4/5] bg-brand-gray-50">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.nameAr}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </Link>
        
        {/* Share Section Overlay */}
        <div 
          className="absolute top-4 left-4 z-10 flex flex-col gap-2"
          onMouseEnter={() => setShowSocials(true)}
          onMouseLeave={() => setShowSocials(false)}
        >
          <button
            onClick={handleGeneralShare}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand-black hover:bg-brand-gold hover:text-white transition-all duration-300 shadow-sm"
            title="مشاركة المنتج"
          >
            <AnimatePresence mode="wait">
              {isShared ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Check size={16} />
                </motion.div>
              ) : (
                <motion.div
                  key="share"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Share2 size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {showSocials && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-2"
              >
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand-black ${social.color} hover:text-white transition-all duration-300 shadow-sm`}
                    title={`مشاركة عبر ${social.name}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {product.roastLevelAr && (
          <div className="absolute top-4 right-4 bg-brand-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
            {product.roastLevelAr}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center px-4">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-[13px] font-black text-brand-black uppercase tracking-[0.1em] mb-1 hover:text-brand-gold transition-colors leading-tight">
            {product.nameAr}
          </h3>
          <p className="text-[9px] font-bold text-brand-gray-500 uppercase tracking-[0.3em] mb-4">
            {product.originAr || 'محصول مختص'}
          </p>
          <div className="flex items-center justify-center gap-1.5 font-display font-black text-brand-black text-lg">
            <span>{product.price}</span>
            <span className="text-[10px] font-sans">ريال</span>
          </div>
        </Link>
        
        <div className="mt-6 pt-6 border-t border-brand-gray-50">
          <button
            onClick={() => addToCart(product)}
            className="w-full py-4 bg-brand-black text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-brand-gold transition-all duration-500 flex items-center justify-center gap-2 group/btn"
          >
            <Plus size={14} className="group-hover/btn:rotate-90 transition-transform duration-500" /> 
            إضافة للسلة
          </button>
        </div>
      </div>
    </div>
  );
};
