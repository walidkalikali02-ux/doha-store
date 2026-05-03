import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Shield, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useCheckoutActions } from '@/stores';
import { analytics } from '@/lib/analytics';

const GUEST_EMAIL_KEY = 'roastery_guest_email';

interface EmailFormErrors {
  email?: string;
}

export function GuestCheckout() {
  const navigate = useNavigate();
  const formId = useId();
  const emailInputId = `${formId}-email`;
  const emailErrorId = `${formId}-email-error`;

  const { setGuestData, setCurrentStep } = useCheckoutActions();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<EmailFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'البريد الإلكتروني مطلوب';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return 'البريد الإلكتروني غير صالح';
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateEmail(email);
    if (error) {
      setErrors({ email: error });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();

      sessionStorage.setItem(GUEST_EMAIL_KEY, trimmedEmail);

      setGuestData({
        email: trimmedEmail,
        firstName: '',
        lastName: '',
        phone: '',
      });

      analytics.trackEvent({
        eventName: 'guest_email_submitted',
        eventCategory: 'checkout',
        additionalData: {
          email_provided: true,
        },
      });

      setEmailSubmitted(true);

      await new Promise(resolve => setTimeout(resolve, 800));

      navigate('/checkout/shipping');
    } catch {
      setErrors({ email: 'حدث خطأ. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-brand-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 text-brand-gray-500 hover:text-brand-black transition-colors group"
            >
              <ArrowRight className="h-5 w-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">العودة للسلة</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-brand-black">دوحة روستري</span>
            </div>

            <div className="w-20" />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {!emailSubmitted ? (
            <motion.div
              key="email-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Title */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-brand-gold" />
                </div>
                <h1 className="text-3xl font-black text-brand-black mb-2">
                  أدخل بريدك الإلكتروني
                </h1>
                <p className="text-sm text-brand-gray-500">
                  سنستخدم بريدك لتتبع طلبك وإرسال تحديثات الشحن
                </p>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-xs text-brand-gray-500">
                  <Shield className="w-4 h-4 text-brand-gold" />
                  <span>بيانات آمنة</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-gray-500">
                  <Mail className="w-4 h-4 text-brand-gold" />
                  <span>تتبع الطلب</span>
                </div>
              </div>

              {/* Email Form */}
              <form
                onSubmit={handleSubmit}
                noValidate
                aria-describedby={errors.email ? emailErrorId : undefined}
              >
                <div className="bg-white rounded-lg shadow-premium p-8">
                  <div>
                    <label
                      htmlFor={emailInputId}
                      className="block text-sm font-bold text-brand-black mb-2 uppercase tracking-wider"
                    >
                      البريد الإلكتروني
                      <span className="text-red-500 mr-1" aria-hidden="true">*</span>
                      <span className="sr-only">(مطلوب)</span>
                    </label>
                    <input
                      type="email"
                      id={emailInputId}
                      name="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-4 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors ${
                        errors.email
                          ? 'border-red-500 bg-red-50'
                          : 'border-brand-gray-200 hover:border-brand-gray-300'
                      }`}
                      dir="ltr"
                      autoComplete="email"
                      autoFocus
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? emailErrorId : undefined}
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          id={emailErrorId}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-2 text-sm text-red-600 flex items-center gap-1"
                          role="alert"
                        >
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-brand-gold text-white text-lg font-bold rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          aria-hidden="true"
                        />
                        <span>جاري المتابعة...</span>
                      </>
                    ) : (
                      <>
                        <span>متابعة</span>
                        <ArrowRight className="w-5 h-5 rotate-180" />
                      </>
                    )}
                  </button>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-brand-gold/5 border border-brand-gold/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-brand-gray-600">
                      <p className="font-medium text-brand-black mb-1">ملاحظة</p>
                      <p>
                        كضيف، ستتلقى تحديثات طلبك عبر البريد الإلكتروني.
                        لا حاجة لإنشاء حساب — اطلب بسهولة وأتبع طلبك مباشرة.
                      </p>
                    </div>
                  </div>
                </div>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-brand-gray-500">
                  لديك حساب بالفعل؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      const redirect = encodeURIComponent('/checkout/shipping');
                      navigate(`/login?redirect=${redirect}`);
                    }}
                    className="text-brand-gold hover:underline font-medium"
                  >
                    سجل دخولك
                  </button>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-premium p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-brand-black mb-2">تم!</h2>
              <p className="text-sm text-brand-gray-500">جاري التحويل إلى صفحة الشحن...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function getStoredGuestEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(GUEST_EMAIL_KEY);
}

export function clearStoredGuestEmail(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(GUEST_EMAIL_KEY);
}

export default GuestCheckout;