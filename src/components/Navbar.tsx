import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shopLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'القهوة', path: '/products?cat=coffee' },
    { name: 'الأدوات', path: '/tools' },
    { name: 'مبيعات الجملة', path: '/wholesale' },
  ];

  const infoLinks = [
    { name: 'المدوّنة', path: '/blog' },
    { name: 'فروعنا', path: '/branches' },
    { name: 'عنَّا', path: '/about' },
  ];

  return (
    <>
      <div className="bg-brand-black text-white py-2.5 text-center relative z-[60]">
        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
          <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap">
            توصيل مجاني للطلبات فوق ٢٥٠ ر.ق
          </p>
          <span className="w-1 h-1 bg-brand-gold rounded-full hidden sm:block" />
          <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap hidden md:block">
            تحميص طازج يومياً • الدوحة
          </p>
        </div>
      </div>

      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'top-4 sm:top-6 px-3 sm:px-4 md:px-8' : 'top-8 sm:top-10 px-0'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto transition-all duration-500 ${
            isScrolled
              ? 'bg-white/80 backdrop-blur-xl shadow-premium border border-brand-gray-100 rounded-full px-4 sm:px-6 md:px-8 py-2'
              : 'bg-white py-4 sm:py-6 px-4 sm:px-6 lg:px-8 border-b border-brand-gray-100'
          }`}
        >
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            <div className="hidden lg:flex items-center gap-10 w-1/3">
              {shopLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[11px] font-medium tracking-wide transition-colors duration-300 hover:text-brand-gold relative group ${
                    location.pathname === link.path ? 'text-brand-gold' : 'text-brand-black'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full ${
                      location.pathname === link.path ? 'w-full' : ''
                    }`}
                  />
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-6 lg:hidden w-1/3 justify-start">
              {shopLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[10px] sm:text-[11px] font-medium tracking-wide transition-colors duration-300 hover:text-brand-gold ${
                    location.pathname === link.path ? 'text-brand-gold' : 'text-brand-black'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex-shrink-0 flex justify-center w-auto lg:w-1/3">
              <Link to="/" className="flex flex-col items-center group relative">
                <motion.div
                  animate={{ scale: isScrolled ? 0.85 : 1 }}
                  transition={{ duration: 0.7 }}
                  className="flex flex-col items-center"
                >
                  <span className="font-display font-black tracking-tighter text-brand-black group-hover:text-brand-gold transition-colors duration-300 leading-none text-lg sm:text-xl md:text-2xl lg:text-3xl">
                    DOHA ROASTERY
                  </span>
                  <span className="font-semibold tracking-[0.3em] sm:tracking-[0.4em] md:tracking-[0.5em] text-brand-gold transition-colors duration-300 text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] mt-1 uppercase">
                    محمصة الدوحة
                  </span>
                </motion.div>
                <div
                  className={`absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-gold rounded-full transition-all duration-300 ${
                    isScrolled ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4 lg:gap-6 w-1/3 justify-end">
              <button className="hover:text-brand-gold transition-colors duration-300 p-1.5 sm:p-2 hover:scale-110">
                <Search size={18} strokeWidth={2.5} />
              </button>
              <Link
                to="/cart"
                className="hover:text-brand-gold transition-colors duration-300 relative p-1.5 sm:p-2 hover:scale-110"
              >
                <ShoppingBag size={18} strokeWidth={2.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 bg-brand-black text-white text-[6px] sm:text-[7px] font-bold min-w-[14px] h-[14px] rounded-full flex items-center justify-center border border-white">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button className="hover:text-brand-gold transition-colors duration-300 p-1.5 sm:p-2 hover:scale-110">
                <User size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex md:hidden items-center justify-between w-full">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 sm:p-3 text-brand-black hover:text-brand-gold transition-colors active:scale-90"
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X size={22} sm size={24} /> : <Menu size={22} sm size={24} />}
              </button>

              <Link to="/" className="flex flex-col items-center">
                <span className="text-base sm:text-lg font-black tracking-tighter text-brand-black">DOHA ROASTERY</span>
                <span className="text-[6px] sm:text-[8px] font-semibold tracking-[0.25em] sm:tracking-[0.35em] text-brand-gold -mt-0.5 sm:-mt-1 uppercase">محمصة الدوحة</span>
              </Link>

              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/cart" className="hover:text-brand-gold transition-colors relative p-2 sm:p-3 active:scale-90">
                  <ShoppingBag size={20} sm size={22} />
                  {totalItems > 0 && (
                    <span className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-brand-black text-white text-[6px] sm:text-[7px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-brand-black/95 backdrop-blur-md z-[70] md:hidden"
              />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[80] md:hidden flex flex-col p-6 sm:p-8"
              >
                <div className="flex justify-between items-center mb-12 sm:mb-16">
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex flex-col items-center">
                    <span className="text-lg sm:text-xl font-black tracking-tighter text-white">DOHA ROASTERY</span>
                    <span className="text-[7px] sm:text-[8px] font-semibold tracking-[0.3em] sm:tracking-[0.35em] text-brand-gold -mt-0.5 sm:-mt-1 uppercase">محمصة الدوحة</span>
                  </Link>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 sm:p-3 text-white hover:text-brand-gold transition-colors"
                  >
                    <X size={28} sm size={32} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex flex-col gap-10 sm:gap-12 overflow-y-auto pb-12">
                  <div className="space-y-5 sm:space-y-6">
                    <p className="text-[9px] sm:text-[10px] font-semibold text-brand-gold uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-60">القائمة</p>
                    <div className="flex flex-col gap-4 sm:gap-5">
                      {[...shopLinks, ...infoLinks].map((link, index) => (
                        <motion.div
                          key={link.path}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          <Link
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block text-2xl sm:text-3xl font-bold tracking-tight transition-colors duration-300 ${
                              location.pathname === link.path ? 'text-brand-gold translate-x-4' : 'text-white hover:text-brand-gold'
                            }`}
                          >
                            {link.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 sm:pt-10 border-t border-white/10 flex flex-col gap-6 sm:gap-8">
                  <div className="flex items-center gap-5 sm:gap-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <User size={22} sm size={24} className="text-brand-gold" />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-medium text-white/50 tracking-[0.1em] sm:tracking-[0.15em]">حسابي</p>
                      <p className="text-sm sm:text-base font-bold text-white leading-snug">تسجيل الدخول</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-sm sm:text-base font-bold text-white tracking-wide" dir="ltr">+974 44 55 66 77</p>
                      <p className="text-[11px] sm:text-xs text-white/40 font-normal leading-relaxed">hello@doharoastery.qa</p>
                    </div>
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-brand-gold hover:text-brand-gold transition-colors cursor-pointer">
                        <span className="text-[9px] sm:text-[10px] font-bold">IG</span>
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-brand-gold hover:text-brand-gold transition-colors cursor-pointer">
                        <span className="text-[9px] sm:text-[10px] font-bold">TW</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};
