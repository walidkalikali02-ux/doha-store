/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Tools } from './pages/Tools';
import { Cart } from './pages/Cart';
import { ProductDetail } from './pages/ProductDetail';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { CartProvider } from './context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans selection:bg-gold-500 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/wholesale" element={<div className="py-24 text-center text-3xl font-black">مبيعات الجملة - قريباً</div>} />
                <Route path="/blog" element={<div className="py-24 text-center text-3xl font-black">المدونة - قريباً</div>} />
                <Route path="/branches" element={<div className="py-24 text-center text-3xl font-black">فروعنا - قريباً</div>} />
                {/* Fallback for other routes */}
                <Route path="*" element={<Home />} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}
