import {useEffect, useRef, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {ChevronRight, ShieldCheck, AlertCircle, RefreshCw} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';
import axios from 'axios';

// MyFatoorah Payment Response interface
interface PaymentResponse {
  isSuccess: boolean;
  paymentType: 'ApplePay' | 'GooglePay' | 'Card' | 'StcPay' | string;
  sessionId: string;
  card?: {
    brand: string;
    lastFourDigits: string;
  };
  mobileNumber?: string;
}

// Session Data from API
interface SessionData {
  SessionId: string;
  CountryCode: string;
  CurrencyCode: string;
  Amount: number;
}

declare global {
  interface Window {
    myfatoorah?: {
      init: (config: unknown) => void;
      submitCardPayment: () => void;
      initApplePayPayment: () => void;
      updateAmount: (amount: string) => void;
      submitStcOtp: (otp: string) => void;
    };
  }
}

const PROXY_BASE_URL = 'http://localhost:3001';

export function PaymentDemo() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  const [isScriptLoading, setIsScriptLoading] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>(
    'idle'
  );
  const [lastResponse, setLastResponse] = useState<PaymentResponse | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const addDebug = useCallback((msg: string) => {
    setDebugInfo(prev => prev + '\n' + msg);
    console.log('[PaymentDemo]', msg);
  }, []);

  // Fetch session from backend
  const fetchSession = useCallback(async () => {
    setIsSessionLoading(true);
    setError(null);
    addDebug('Fetching session from backend...');

    try {
      const response = await axios.post(`${PROXY_BASE_URL}/api/myfatoorah/initiate-payment`, {
        InvoiceAmount: 0.25,
        CurrencyIso: 'KWD',
      });

      addDebug('Session response received: ' + JSON.stringify(response.data));

      if (response.data?.Data?.SessionId) {
        setSessionData({
          SessionId: response.data.Data.SessionId,
          CountryCode: 'KWT',
          CurrencyCode: 'KWD',
          Amount: 0.25,
        });
        addDebug('Session ID obtained: ' + response.data.Data.SessionId);
      } else {
        throw new Error('No session ID in response');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch session';
      addDebug('Session fetch error: ' + errorMsg);
      setError('فشل في الحصول على جلسة الدفع: ' + errorMsg);

      // Fallback to demo session for testing
      addDebug('Using fallback demo session...');
      setSessionData({
        SessionId: '465be64b-0197-4eac-8fb7-b832387b3c2',
        CountryCode: 'KWT',
        CurrencyCode: 'KWD',
        Amount: 0.25,
      });
    } finally {
      setIsSessionLoading(false);
    }
  }, [addDebug]);

  const handlePayment = useCallback(
    (response: PaymentResponse) => {
      addDebug('Payment callback received: ' + JSON.stringify(response));
      setLastResponse(response);

      if (response.isSuccess) {
        setPaymentStatus('success');

        // Log based on payment type
        switch (response.paymentType) {
          case 'ApplePay':
            console.log('Apple Pay Response>>', response);
            break;
          case 'GooglePay':
            console.log('Google Pay response >>', response);
            break;
          case 'Card':
            console.log('Card Response >>', response);
            break;
          case 'StcPay':
            console.log('STC Pay response >>', response);
            break;
          default:
            console.log('Unknown payment type >>', response);
        }

        // Redirect after successful payment
        setTimeout(() => {
          navigate('/checkout/confirmation');
        }, 2000);
      } else {
        setPaymentStatus('error');
        setError('فشل في معالجة الدفع: ' + JSON.stringify(response));
      }
    },
    [navigate, addDebug]
  );

  const initializePayment = useCallback(() => {
    if (!window.myfatoorah) {
      addDebug('ERROR: myfatoorah not available on window');
      setError('بوابة الدفع غير متوفرة - لم يتم تحميل السكربت');
      return;
    }

    if (!sessionData) {
      addDebug('ERROR: No session data available');
      setError('لا توجد بيانات جلسة متاحة');
      return;
    }

    addDebug('Initializing MyFatoorah with session: ' + sessionData.SessionId);

    const config = {
      sessionId: sessionData.SessionId,
      countryCode: sessionData.CountryCode,
      currencyCode: sessionData.CurrencyCode,
      amount: sessionData.Amount.toString(),
      callback: handlePayment,
      containerId: 'unified-session',
      paymentOptions: ['Card'],
      supportedNetworks: ['visa', 'masterCard', 'mada', 'amex'],
      language: 'ar',
      settings: {
        card: {
          style: {
            hideNetworkIcons: false,
            cardHeight: '180px',
            input: {
              color: '#000000',
              fontSize: '16px',
              inputHeight: '40px',
              borderColor: '#e5e5e5',
              borderWidth: '2px',
              borderRadius: '0px',
              backgroundColor: '#f9f9f9',
            },
            button: {
              textContent: 'دفع الآن',
              color: 'white',
              backgroundColor: '#c6a355',
              height: '50px',
              borderRadius: '0px',
            },
          },
        },
      },
    };

    try {
      window.myfatoorah.init(config);
      addDebug('MyFatoorah initialized successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addDebug('ERROR initializing MyFatoorah: ' + errorMsg);
      setError('فشل في تهيئة بوابة الدفع: ' + errorMsg);
    }
  }, [sessionData, handlePayment, addDebug]);

  // Load MyFatoorah script
  useEffect(() => {
    if (scriptLoadedRef.current) return;

    addDebug('Loading MyFatoorah script...');
    const script = document.createElement('script');
    script.src = 'https://demo.myfatoorah.com/payment/v1/session.js';
    script.async = true;

    script.onload = () => {
      addDebug('MyFatoorah script loaded successfully');
      scriptLoadedRef.current = true;
      setIsScriptLoading(false);
    };

    script.onerror = e => {
      addDebug('ERROR loading MyFatoorah script: ' + JSON.stringify(e));
      setError('فشل في تحميل سكربت الدفع - تحقق من اتصال الإنترنت');
      setIsScriptLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [addDebug]);

  // Fetch session after script loads
  useEffect(() => {
    if (!isScriptLoading && !sessionData) {
      fetchSession();
    }
  }, [isScriptLoading, sessionData, fetchSession]);

  // Initialize payment when we have both script and session
  useEffect(() => {
    if (!isScriptLoading && !isSessionLoading && sessionData && paymentStatus === 'idle') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializePayment();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isScriptLoading, isSessionLoading, sessionData, paymentStatus, initializePayment]);

  const handleRetry = () => {
    setError(null);
    setPaymentStatus('idle');
    fetchSession();
  };

  const handleCustomSubmit = () => {
    if (window.myfatoorah) {
      addDebug('Submitting card payment...');
      setPaymentStatus('processing');
      window.myfatoorah.submitCardPayment();
    } else {
      setError('بوابة الدفع غير متوفرة');
    }
  };

  const isLoading = isScriptLoading || isSessionLoading;

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <motion.div
        initial={{opacity: 0, y: -20}}
        animate={{opacity: 1, y: 0}}
        className="bg-white border-b border-brand-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/checkout/payment')}
              className="flex items-center gap-2 text-brand-gray-500 hover:text-brand-black transition-colors group"
            >
              <ChevronRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">العودة</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="section-subtitle !mb-0 !text-[8px]">نموذج دفع تجريبي</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          className="bg-white shadow-premium overflow-hidden"
        >
          {/* Demo Banner */}
          <div className="bg-brand-gold/10 border-b border-brand-gold/20 p-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
              <span className="text-sm font-bold text-brand-gold">وضع تجريبي - Demo Mode</span>
            </div>
            <p className="text-center text-xs text-brand-gray-500 mt-1">
              هذا نموذج للدفع باستخدام MyFatoorah Embedded Payment
            </p>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8" ref={containerRef}>
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700">دفع آمن باستخدام MyFatoorah</span>
            </div>

            {/* Payment Info */}
            <div className="text-center mb-8">
              <p className="text-brand-gray-500 text-sm mb-2">المبلغ المستحق</p>
              <p className="text-3xl font-black text-brand-black">
                {sessionData ? sessionData.Amount : '0.25'}{' '}
                {sessionData ? sessionData.CurrencyCode : 'KWD'}
              </p>
              {sessionData && (
                <p className="text-xs text-brand-gray-400 mt-1">
                  جلسة: {sessionData.SessionId.slice(0, 16)}...
                </p>
              )}
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{opacity: 0, height: 0}}
                  animate={{opacity: 1, height: 'auto'}}
                  exit={{opacity: 0, height: 0}}
                  className="bg-red-50 border-r-4 border-red-500 p-4 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-red-800 text-sm">حدث خطأ</p>
                      <p className="text-sm text-red-600">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="mt-2 text-sm text-red-700 underline hover:no-underline flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        إعادة المحاولة
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            {isLoading && (
              <div className="py-12 text-center">
                <motion.div
                  animate={{rotate: 360}}
                  transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
                  className="w-10 h-10 border-3 border-brand-gold border-t-transparent mx-auto mb-4"
                />
                <p className="text-brand-gray-500">
                  {isScriptLoading ? 'جاري تحميل سكربت الدفع...' : 'جاري الحصول على جلسة الدفع...'}
                </p>
              </div>
            )}

            {/* Payment Status */}
            {paymentStatus === 'success' && (
              <motion.div
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                className="bg-green-50 border border-green-200 p-6 text-center mb-6"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">تم الدفع بنجاح!</h3>
                <p className="text-sm text-green-600">نوع الدفع: {lastResponse?.paymentType}</p>
                {lastResponse?.card && (
                  <p className="text-xs text-green-500 mt-1">
                    البطاقة: **** {lastResponse.card.lastFourDigits}
                  </p>
                )}
                <p className="text-xs text-green-500 mt-2">جاري التوجيه إلى صفحة التأكيد...</p>
              </motion.div>
            )}

            {paymentStatus === 'error' && !error && (
              <motion.div
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                className="bg-red-50 border border-red-200 p-6 text-center mb-6"
              >
                <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-red-800 mb-2">فشل الدفع</h3>
                <p className="text-sm text-red-600">
                  حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.
                </p>
                <button
                  onClick={() => setPaymentStatus('idle')}
                  className="mt-4 btn-outline text-xs py-2 px-4"
                >
                  المحاولة مرة أخرى
                </button>
              </motion.div>
            )}

            {/* Payment Container */}
            {!isLoading && paymentStatus !== 'success' && (
              <div className="max-w-md mx-auto">
                <div id="unified-session" className="min-h-[250px]" />
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-brand-gray-50 border border-brand-gray-200">
              <h4 className="font-bold text-brand-black text-sm mb-2">معلومات تجريبية:</h4>
              <ul className="text-xs text-brand-gray-500 space-y-1 list-disc list-inside">
                <li>استخدم بيانات البطاقة التجريبية من MyFatoorah</li>
                <li>رقم البطاقة: 4111111111111111 (Visa)</li>
                <li>تاريخ الانتهاء: أي تاريخ مستقبلي</li>
                <li>CVV: 123</li>
                <li>الدفع حقيقي في وضع الإنتاج</li>
              </ul>
            </div>

            {/* Debug Info (Development Only) */}
            {import.meta.env.DEV && debugInfo && (
              <div className="mt-4 p-3 bg-gray-900 text-green-400 text-xs font-mono overflow-auto max-h-40 rounded">
                <p className="font-bold mb-1">Debug Info:</p>
                <pre>{debugInfo}</pre>
              </div>
            )}

            {/* Custom Submit Button (Optional) */}
            {paymentStatus !== 'success' && !isLoading && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleCustomSubmit}
                  disabled={paymentStatus === 'processing'}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentStatus === 'processing' ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
                        className="w-4 h-4 border-2 border-white border-t-transparent"
                      />
                      جاري المعالجة...
                    </span>
                  ) : (
                    'دفع مخصص (Custom Pay)'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-brand-gray-50 p-4 border-t border-brand-gray-200">
            <div className="flex items-center justify-center gap-4 text-xs text-brand-gray-400">
              <span>مدعوم بواسطة</span>
              <span className="font-bold text-brand-black">MyFatoorah</span>
              <span>•</span>
              <span>Embedded Payment v1</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PaymentDemo;
