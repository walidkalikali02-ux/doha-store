import {useEffect, useRef, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {ChevronRight, ShieldCheck, AlertCircle, RefreshCw, CheckCircle, Lock} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';

// =============================================================================
// MyFatoorah Embedded Payment Demo
// Following: https://docs.myfatoorah.com/docs/embedded-integration-steps
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
  CustomerTokens: unknown[];
}

// Execute Payment Response
interface ExecutePaymentResponse {
  IsSuccess: boolean;
  Message: string;
  Data?: {
    InvoiceId: number;
    IsDirectPayment: boolean;
    PaymentURL: string;
    CustomerReference: string;
    UserDefinedField: string | null;
    RecurringId: string;
  };
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

// API Configuration
const API_CONFIG = {
  // Use your actual backend URL
  baseUrl: 'http://localhost:3001',
  // Test environment
  scriptUrl: 'https://demo.myfatoorah.com/payment/v1/session.js',
};

export function EmbeddedPaymentDemo() {
  const navigate = useNavigate();
  const scriptLoadedRef = useRef(false);
  const [isScriptLoading, setIsScriptLoading] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>(
    'idle'
  );
  const [lastResponse, setLastResponse] = useState<PaymentResponse | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    const logEntry = `[${timestamp}] ${msg}`;
    setLogs(prev => [...prev, logEntry]);
    console.log('[EmbeddedPayment]', logEntry);
  }, []);

  // ==========================================================================
  // STEP 1: Call InitiateSession endpoint
  // ==========================================================================
  const initiateSession = useCallback(async () => {
    setIsSessionLoading(true);
    setError(null);
    addLog('=== STEP 1: Calling InitiateSession endpoint ===');

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/myfatoorah/initiate-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CustomerReference: 'cust-001',
          NotificationOption: 'LNK',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addLog('InitiateSession response: ' + JSON.stringify(data, null, 2));

      if (data.IsSuccess && data.Data?.SessionId) {
        setSessionData(data.Data);
        addLog(`✓ SessionId obtained: ${data.Data.SessionId}`);
        addLog(`✓ CountryCode: ${data.Data.CountryCode}`);
      } else {
        throw new Error(data.Message || 'Failed to get session');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`✗ InitiateSession failed: ${errorMsg}`);
      setError(`فشل في إنشاء جلسة الدفع: ${errorMsg}`);

      // Fallback to demo session for testing
      addLog('Using demo session ID for testing...');
      setSessionData({
        SessionId: '465be64b-0197-4eac-8fb7-b832387b3c2',
        CountryCode: 'KWT',
        CustomerTokens: [],
      });
    } finally {
      setIsSessionLoading(false);
    }
  }, [addLog]);

  // ==========================================================================
  // STEP 2: Include the Javascript library
  // ==========================================================================
  useEffect(() => {
    if (scriptLoadedRef.current) return;

    addLog('=== STEP 2: Loading MyFatoorah JavaScript library ===');
    addLog(`Loading from: ${API_CONFIG.scriptUrl}`);

    const script = document.createElement('script');
    script.src = API_CONFIG.scriptUrl;
    script.async = true;

    script.onload = () => {
      addLog('✓ MyFatoorah script loaded successfully');
      scriptLoadedRef.current = true;
      setIsScriptLoading(false);
    };

    script.onerror = () => {
      addLog('✗ Failed to load MyFatoorah script');
      setError('فشل في تحميل مكتبة الدفع');
      setIsScriptLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [addLog]);

  // ==========================================================================
  // STEP 6: Call the ExecutePayment Endpoint (defined before Step 5 to avoid circular dependency)
  // ==========================================================================
  const executePayment = useCallback(
    async (sessionId: string, paymentType: string) => {
      setIsExecuting(true);
      addLog('=== STEP 6: Calling ExecutePayment endpoint ===');
      addLog(`Using SessionId: ${sessionId}`);

      try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/myfatoorah/execute-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            SessionId: sessionId,
            InvoiceValue: 0.25,
            CustomerName: 'Test Customer',
            CustomerEmail: 'test@example.com',
            CustomerMobile: '+96550000000',
            CallBackUrl: `${window.location.origin}/checkout/confirmation`,
            ErrorUrl: `${window.location.origin}/checkout/payment-demo?error=1`,
            Language: 'AR',
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ExecutePaymentResponse = await response.json();
        addLog('ExecutePayment response: ' + JSON.stringify(data, null, 2));

        if (data.IsSuccess && data.Data?.PaymentURL) {
          addLog(`✓ PaymentURL received: ${data.Data.PaymentURL}`);
          setPaymentUrl(data.Data.PaymentURL);

          // For Card/Google Pay, we can show iframe
          if (paymentType === 'Card' || paymentType === 'GooglePay') {
            setShowIframe(true);
          } else {
            // For Apple Pay/STC Pay, redirect
            window.location.href = data.Data.PaymentURL;
          }
        } else {
          throw new Error(data.Message || 'ExecutePayment failed');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        addLog(`✗ ExecutePayment failed: ${errorMsg}`);
        setError(`فشل في تنفيذ الدفع: ${errorMsg}`);
      } finally {
        setIsExecuting(false);
      }
    },
    [addLog]
  );

  // ==========================================================================
  // STEP 5: Handle the callback function
  // ==========================================================================
  const handlePaymentCallback = useCallback(
    (response: PaymentResponse) => {
      addLog('=== STEP 5: Payment Callback Received ===');
      addLog('Response: ' + JSON.stringify(response, null, 2));

      setLastResponse(response);

      if (response.isSuccess) {
        setPaymentStatus('success');
        addLog(`✓ Payment successful via ${response.paymentType}`);

        // Log based on payment type
        switch (response.paymentType) {
          case 'ApplePay':
            addLog('Apple Pay completed');
            break;
          case 'GooglePay':
            addLog('Google Pay completed');
            break;
          case 'Card':
            addLog(`Card payment completed - Brand: ${response.card?.brand}`);
            break;
          case 'StcPay':
            addLog('STC Pay completed');
            break;
          default:
            addLog(`Unknown payment type: ${response.paymentType}`);
        }

        // STEP 6: Call ExecutePayment
        executePayment(response.sessionId, response.paymentType);
      } else {
        setPaymentStatus('error');
        addLog('✗ Payment failed');
        setError('فشل في معالجة الدفع');
      }
    },
    [addLog, executePayment]
  );

  // ==========================================================================
  // STEP 4: Configure the Embedded Payment
  // ==========================================================================
  const initializePayment = useCallback(() => {
    if (!window.myfatoorah) {
      addLog('✗ MyFatoorah library not available');
      setError('مكتبة الدفع غير متوفرة');
      return;
    }

    if (!sessionData) {
      addLog('✗ No session data available');
      setError('لا توجد بيانات جلسة');
      return;
    }

    addLog('=== STEP 4: Configuring Embedded Payment ===');

    const config = {
      // SessionId from InitiateSession
      sessionId: sessionData.SessionId,
      // CountryCode from InitiateSession
      countryCode: sessionData.CountryCode,
      // Currency code
      currencyCode: 'KWD',
      // Amount to display
      amount: '0.250',
      // Callback function after payment
      callback: handlePaymentCallback,
      // Container div id (STEP 3)
      containerId: 'embedded-payment-container',
      // Payment methods to display
      paymentOptions: ['Card', 'GooglePay', 'ApplePay', 'STCPay'],
      // Supported card networks
      supportedNetworks: ['visa', 'masterCard', 'mada', 'amex'],
      // Language
      language: 'ar',
    };

    try {
      window.myfatoorah.init(config);
      addLog('✓ Embedded Payment initialized successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`✗ Initialization failed: ${errorMsg}`);
      setError(`فشل في تهيئة بوابة الدفع: ${errorMsg}`);
    }
  }, [sessionData, addLog, handlePaymentCallback]);

  // Initialize session when script loads
  useEffect(() => {
    if (!isScriptLoading && !sessionData) {
      initiateSession();
    }
  }, [isScriptLoading, sessionData, initiateSession]);

  // Initialize embedded payment when we have session
  useEffect(() => {
    if (!isScriptLoading && !isSessionLoading && sessionData && paymentStatus === 'idle') {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializePayment();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isScriptLoading, isSessionLoading, sessionData, paymentStatus, initializePayment]);

  // Listen for 3DS redirect message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      try {
        const message = JSON.parse(event.data);

        // Check if sender is MF-3DSecure
        if (message.sender === 'MF-3DSecure' && message.url) {
          addLog('3DS Redirect URL received: ' + message.url);

          // Extract payment ID from URL
          const urlParams = new URLSearchParams(new URL(message.url).search);
          const paymentId = urlParams.get('paymentId');

          if (paymentId) {
            addLog('Payment ID: ' + paymentId);
            // Close iframe and check payment status
            setShowIframe(false);
            // Navigate to confirmation
            navigate('/checkout/confirmation?paymentId=' + paymentId);
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage, false);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate, addLog]);

  const handleRetry = () => {
    setError(null);
    setPaymentStatus('idle');
    setPaymentUrl(null);
    setShowIframe(false);
    initiateSession();
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
              <span className="text-sm font-medium hidden sm:inline">العودة للدفع</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="section-subtitle !mb-0 !text-[8px]">Embedded Payment Demo</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Payment Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              className="bg-white shadow-premium overflow-hidden"
            >
              {/* Integration Steps Banner */}
              <div className="bg-gradient-to-r from-brand-black to-brand-brown p-4">
                <h1 className="text-white font-bold text-lg">MyFatoorah Embedded Payment</h1>
                <p className="text-brand-gold text-sm">Following Official Integration Steps</p>
              </div>

              <div className="p-6">
                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">PCI DSS Compliant</span>
                </div>

                {/* Payment Info */}
                <div className="text-center mb-6">
                  <p className="text-brand-gray-500 text-sm mb-1">المبلغ المستحق</p>
                  <p className="text-2xl font-black text-brand-black">0.250 KWD</p>
                  {sessionData && (
                    <p className="text-xs text-brand-gray-400 mt-1">
                      Session: {sessionData.SessionId.slice(0, 20)}...
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
                      {isScriptLoading
                        ? 'جاري تحميل مكتبة الدفع (Step 2)...'
                        : 'جاري إنشاء جلسة الدفع (Step 1)...'}
                    </p>
                  </div>
                )}

                {/* Payment Success */}
                {paymentStatus === 'success' && !showIframe && (
                  <motion.div
                    initial={{opacity: 0, scale: 0.9}}
                    animate={{opacity: 1, scale: 1}}
                    className="bg-green-50 border border-green-200 p-6 text-center mb-6"
                  >
                    <div className="w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-green-800 mb-2">تم الدفع بنجاح!</h3>
                    <p className="text-sm text-green-600">نوع الدفع: {lastResponse?.paymentType}</p>
                    {isExecuting && (
                      <p className="text-xs text-green-500 mt-2">جاري تنفيذ المعاملة...</p>
                    )}
                  </motion.div>
                )}

                {/* ==========================================================================
                    STEP 3: Define a div element
                    ========================================================================== */}
                {!isLoading && paymentStatus !== 'success' && !showIframe && (
                  <div className="max-w-md mx-auto">
                    <p className="text-xs text-brand-gray-400 text-center mb-2">
                      Step 3: Payment Container
                    </p>
                    <div
                      id="embedded-payment-container"
                      className="min-h-[300px] border-2 border-dashed border-brand-gray-200 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-brand-gray-400 text-sm">
                        سيتم تحميل نموذج الدفع هنا
                      </span>
                    </div>
                  </div>
                )}

                {/* 3DS Iframe */}
                {showIframe && paymentUrl && (
                  <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    className="border-2 border-brand-gold rounded-lg overflow-hidden"
                  >
                    <div className="bg-brand-gold text-white p-2 text-center text-sm font-bold">
                      3D Secure Verification
                    </div>
                    <iframe
                      src={paymentUrl}
                      className="w-full h-[400px]"
                      title="3D Secure Payment"
                    />
                  </motion.div>
                )}

                {/* Test Card Info */}
                <div className="mt-6 p-4 bg-brand-gray-50 border border-brand-gray-200 rounded-lg">
                  <h4 className="font-bold text-brand-black text-sm mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand-gold" />
                    بيانات البطاقة للاختبار:
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
            </motion.div>
          </div>

          {/* Integration Steps & Logs */}
          <div className="space-y-6">
            {/* Integration Steps */}
            <motion.div
              initial={{opacity: 0, x: 20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: 0.2}}
              className="bg-white shadow-premium p-4"
            >
              <h3 className="font-bold text-brand-black mb-4">خطوات التكامل</h3>
              <div className="space-y-3">
                {[
                  {
                    step: 1,
                    title: 'InitiateSession',
                    desc: 'Call endpoint to get SessionId',
                    done: !!sessionData,
                  },
                  {
                    step: 2,
                    title: 'Load Library',
                    desc: 'Include MyFatoorah JS library',
                    done: !isScriptLoading,
                  },
                  {
                    step: 3,
                    title: 'Create Container',
                    desc: 'Define div for payment form',
                    done: !isLoading,
                  },
                  {
                    step: 4,
                    title: 'Configure',
                    desc: 'Initialize with config object',
                    done: !isLoading && !!sessionData,
                  },
                  {
                    step: 5,
                    title: 'Handle Callback',
                    desc: 'Process payment response',
                    done: !!lastResponse,
                  },
                  {
                    step: 6,
                    title: 'ExecutePayment',
                    desc: 'Complete the transaction',
                    done: !!paymentUrl,
                  },
                ].map(item => (
                  <div
                    key={item.step}
                    className={`flex items-start gap-3 p-2 rounded ${
                      item.done ? 'bg-green-50' : 'bg-brand-gray-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 flex items-center justify-center text-xs font-bold ${
                        item.done
                          ? 'bg-green-500 text-white'
                          : 'bg-brand-gray-200 text-brand-gray-500'
                      }`}
                    >
                      {item.done ? '✓' : item.step}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-bold ${item.done ? 'text-green-800' : 'text-brand-black'}`}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-brand-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Logs */}
            <motion.div
              initial={{opacity: 0, x: 20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: 0.3}}
              className="bg-gray-900 text-green-400 p-4 font-mono text-xs overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">Debug Logs</span>
                <button onClick={() => setLogs([])} className="text-gray-500 hover:text-white">
                  مسح
                </button>
              </div>
              <div className="h-48 overflow-y-auto space-y-1">
                {logs.length === 0 ? (
                  <span className="text-gray-500">Waiting for logs...</span>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="border-b border-gray-800 pb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Documentation Link */}
            <motion.a
              href="https://docs.myfatoorah.com/docs/embedded-integration-steps"
              target="_blank"
              rel="noopener noreferrer"
              initial={{opacity: 0, x: 20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: 0.4}}
              className="block bg-brand-gold/10 border border-brand-gold/20 p-4 text-center hover:bg-brand-gold/20 transition-colors"
            >
              <p className="text-sm font-bold text-brand-gold">View Documentation</p>
              <p className="text-xs text-brand-gray-500">docs.myfatoorah.com</p>
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmbeddedPaymentDemo;
