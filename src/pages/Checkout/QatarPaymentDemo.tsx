import {useEffect, useRef, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Lock,
  CreditCard,
} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';

// =============================================================================
// MyFatoorah Embedded Payment - Qatar Environment
// Script: https://qa.myfatoorah.com/payment/v1/session.js
// =============================================================================

// Payment Response from MyFatoorah callback
interface PaymentResponse {
  isSuccess: boolean;
  paymentType: 'ApplePay' | 'GooglePay' | 'Card' | 'StcPay' | string;
  sessionId: string;
  card?: {
    brand: string;
    lastFourDigits?: string;
  };
  mobileNumber?: string;
}

// Session Data from InitiateSession API
interface SessionData {
  SessionId: string;
  CountryCode: string;
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

// API Configuration - Qatar Environment
const API_CONFIG = {
  baseUrl: 'http://localhost:3001',
  // Qatar Production Environment
  scriptUrl: 'https://qa.myfatoorah.com/payment/v1/session.js',
};

export function QatarPaymentDemo() {
  const navigate = useNavigate();
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastResponse, setLastResponse] = useState<PaymentResponse | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-QA');
    const logEntry = `[${timestamp}] ${msg}`;
    setLogs(prev => [...prev.slice(-20), logEntry]); // Keep last 20 logs
    console.log('[MyFatoorah]', logEntry);
  }, []);

  // Step 1: Get Session from backend
  const initiateSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    addLog('Getting SessionId from backend...');

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/myfatoorah/initiate-session`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          CustomerReference: 'demo-customer-001',
          NotificationOption: 'LNK',
        }),
      });

      const data = await response.json();
      addLog('Session response: ' + JSON.stringify(data));

      if (data.IsSuccess && data.Data?.SessionId) {
        setSessionData({
          SessionId: data.Data.SessionId,
          CountryCode: data.Data.CountryCode || 'QAT',
        });
        addLog('✓ SessionId: ' + data.Data.SessionId);
      } else {
        // Fallback demo session
        addLog('Using demo session...');
        setSessionData({
          SessionId: 'demo-session-12345',
          CountryCode: 'QAT',
        });
      }
    } catch (err) {
      addLog('Session error: ' + (err instanceof Error ? err.message : 'Unknown'));
      // Fallback for demo
      setSessionData({
        SessionId: 'demo-session-12345',
        CountryCode: 'QAT',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  // Step 2: Load MyFatoorah Script
  useEffect(() => {
    if (scriptRef.current) return;

    addLog('Loading MyFatoorah script from Qatar environment...');
    const script = document.createElement('script');
    script.src = API_CONFIG.scriptUrl;
    script.async = true;

    script.onload = () => {
      addLog('✓ Script loaded successfully');
      setIsScriptLoaded(true);
    };

    script.onerror = () => {
      addLog('✗ Failed to load script');
      setError('فشل في تحميل سكربت الدفع');
    };

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, [addLog]);

  // Initialize session when script loads
  useEffect(() => {
    if (isScriptLoaded && !sessionData) {
      initiateSession();
    }
  }, [isScriptLoaded, sessionData, initiateSession]);

  // Payment callback function
  const paymentCallback = useCallback(
    (response: PaymentResponse) => {
      addLog('Payment callback: ' + JSON.stringify(response));
      setLastResponse(response);

      if (response.isSuccess) {
        setPaymentStatus('success');
        addLog('✓ Payment successful!');
      } else {
        setPaymentStatus('error');
        setError('فشل في الدفع');
      }
    },
    [addLog]
  );

  // Step 3: Initialize MyFatoorah
  useEffect(() => {
    if (!isScriptLoaded || !sessionData || !window.myfatoorah) return;

    addLog('Initializing MyFatoorah...');

    const config = {
      sessionId: sessionData.SessionId,
      countryCode: sessionData.CountryCode,
      currencyCode: 'QAR',
      amount: '10.00',
      callback: paymentCallback,
      containerId: 'embedded-payment',
      paymentOptions: ['ApplePay', 'GooglePay', 'Card', 'STCPay'],
    };

    try {
      window.myfatoorah.init(config);
      addLog('✓ MyFatoorah initialized');
    } catch (err) {
      addLog('Init error: ' + (err instanceof Error ? err.message : 'Unknown'));
      setError('فشل في تهيئة الدفع');
    }
  }, [isScriptLoaded, sessionData, paymentCallback, addLog]);

  const handleRetry = () => {
    setError(null);
    setPaymentStatus('idle');
    initiateSession();
  };

  const isReady = isScriptLoaded && sessionData && !isLoading;

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
              className="flex items-center gap-2 text-brand-gray-500 hover:text-brand-black transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
              <span className="text-sm font-medium">العودة</span>
            </button>
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">
              Qatar Environment Demo
            </span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          className="bg-white shadow-premium overflow-hidden"
        >
          {/* Qatar Banner */}
          <div className="bg-[#8B1538] p-4 text-center">
            <h1 className="text-white font-bold text-xl">MyFatoorah Qatar</h1>
            <p className="text-white/80 text-sm">qa.myfatoorah.com</p>
          </div>

          <div className="p-6">
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700">دفع آمن - Qatar Environment</span>
            </div>

            {/* Amount */}
            <div className="text-center mb-6">
              <p className="text-brand-gray-500 text-sm mb-1">المبلغ</p>
              <p className="text-3xl font-black text-brand-black">10.00 QAR</p>
              {sessionData && (
                <p className="text-xs text-brand-gray-400 mt-1">
                  Session: {sessionData.SessionId.slice(0, 15)}...
                </p>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{opacity: 0, height: 0}}
                  animate={{opacity: 1, height: 'auto'}}
                  exit={{opacity: 0, height: 0}}
                  className="bg-red-50 border-r-4 border-red-500 p-4 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold text-red-800 text-sm">خطأ</p>
                      <p className="text-sm text-red-600">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="mt-2 text-sm text-red-700 underline flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        إعادة المحاولة
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading */}
            {(isLoading || !isReady) && (
              <div className="py-12 text-center">
                <motion.div
                  animate={{rotate: 360}}
                  transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
                  className="w-10 h-10 border-3 border-brand-gold border-t-transparent mx-auto mb-4"
                />
                <p className="text-brand-gray-500">
                  {!isScriptLoaded ? 'جاري تحميل السكربت...' : 'جاري إنشاء الجلسة...'}
                </p>
              </div>
            )}

            {/* Success */}
            {paymentStatus === 'success' && (
              <motion.div
                initial={{opacity: 0, scale: 0.9}}
                animate={{opacity: 1, scale: 1}}
                className="bg-green-50 border border-green-200 p-6 text-center mb-6"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">تم الدفع بنجاح!</h3>
                <p className="text-sm text-green-600">{lastResponse?.paymentType}</p>
              </motion.div>
            )}

            {/* Payment Container */}
            {isReady && paymentStatus !== 'success' && (
              <div className="max-w-md mx-auto">
                <p className="text-xs text-brand-gray-400 text-center mb-2">نموذج الدفع</p>
                {/* 
                  MyFatoorah Embedded Payment Container
                  Script: https://qa.myfatoorah.com/payment/v1/session.js
                */}
                <div
                  id="embedded-payment"
                  className="min-h-[300px] border-2 border-brand-gray-200 p-4"
                >
                  <div className="flex flex-col items-center justify-center h-full text-brand-gray-400">
                    <CreditCard className="h-12 w-12 mb-2" />
                    <p>جاري تحميل نموذج الدفع...</p>
                    <p className="text-xs mt-1">MyFatoorah Qatar</p>
                  </div>
                </div>
              </div>
            )}

            {/* Test Info */}
            <div className="mt-6 p-4 bg-brand-gray-50 border border-brand-gray-200">
              <h4 className="font-bold text-brand-black text-sm mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand-gold" />
                معلومات الاختبار:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-brand-gray-600">
                <div>
                  <span className="font-bold">الرقم:</span> 4111111111111111
                </div>
                <div>
                  <span className="font-bold">النوع:</span> Visa
                </div>
                <div>
                  <span className="font-bold">التاريخ:</span> 12/25
                </div>
                <div>
                  <span className="font-bold">CVV:</span> 123
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-brand-gray-50 p-4 border-t border-brand-gray-200">
            <div className="flex items-center justify-center gap-2 text-xs text-brand-gray-400">
              <span>مدعوم بواسطة</span>
              <span className="font-bold text-brand-black">MyFatoorah Qatar</span>
            </div>
          </div>
        </motion.div>

        {/* Logs */}
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: 0.3}}
          className="mt-4 bg-gray-900 text-green-400 p-3 font-mono text-xs"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold">Logs</span>
            <button onClick={() => setLogs([])} className="text-gray-500 hover:text-white text-xs">
              مسح
            </button>
          </div>
          <div className="h-24 overflow-y-auto space-y-0.5">
            {logs.map((log, i) => (
              <div key={i} className="text-[10px] border-b border-gray-800 pb-0.5">
                {log}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default QatarPaymentDemo;
