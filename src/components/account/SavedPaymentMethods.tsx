import {useState, useEffect} from 'react';
import {CreditCard, Plus, Trash2, Check, Loader2} from 'lucide-react';
import {api} from '@/services/api';

interface SavedCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  stripePaymentMethodId: string;
}

interface SetupIntentResponse {
  clientSecret: string;
  setupIntentId: string;
}

export function SavedPaymentMethods() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCard, setAddingCard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await api.get<{cards: SavedCard[]}>('/payment-methods');
      setCards(response.cards ?? []);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
      setError('فشل في تحميل بطاقات الدفع');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    try {
      setAddingCard(true);
      setError(null);

      const response = await api.post<SetupIntentResponse>('/payment-methods/setup-intent', {});
      const {clientSecret} = response;

      const stripe = (
        window as unknown as {
          Stripe?: (key: string) => {
            confirmCardSetup: (
              secret: string,
              data: unknown
            ) => Promise<{error?: {message: string}}>;
          };
        }
      ).Stripe;
      if (!stripe) {
        throw new Error('Stripe غير محمل');
      }

      const stripeInstance = stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);
      if (!stripeInstance) {
        throw new Error('فشل في تهيئة Stripe');
      }

      const result = await stripeInstance.confirmCardSetup(clientSecret, {
        payment_method: {
          card: {element: undefined},
          billing_details: {},
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      await fetchCards();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في إضافة البطاقة';
      setError(message);
    } finally {
      setAddingCard(false);
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      await api.patch(`/payment-methods/${cardId}/default`, {});
      setCards(prev =>
        prev.map(card => ({
          ...card,
          isDefault: card.id === cardId,
        }))
      );
    } catch (err) {
      setError('فشل في تعيين البطاقة الافتراضية');
      console.error(err);
    }
  };

  const handleDelete = async (cardId: string) => {
    try {
      await api.delete(`/payment-methods/${cardId}`);
      setCards(prev => prev.filter(card => card.id !== cardId));
    } catch (err) {
      setError('فشل في حذف البطاقة');
      console.error(err);
    }
  };

  const cardBrandColors: Record<string, string> = {
    visa: 'bg-blue-600',
    mastercard: 'bg-orange-500',
    amex: 'bg-blue-400',
    discover: 'bg-orange-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-coffee-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">البطاقات المحفوظة</h2>
        <button
          type="button"
          onClick={handleAddCard}
          disabled={addingCard}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-coffee-600 text-white hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addingCard ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري الإضافة...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              إضافة بطاقة
            </>
          )}
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">لا توجد بطاقات محفوظة</h3>
          <p className="mt-2 text-sm text-gray-500">أضف بطاقة دفع لتسهيل عملية الشراء.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cards.map(card => (
            <div key={card.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${cardBrandColors[card.brand] ?? 'bg-gray-600'}`}>
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} •••• {card.last4}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      تنتهي {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
                    </p>
                    {card.isDefault && (
                      <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        البطاقة الافتراضية
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!card.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(card.id)}
                      className="text-sm text-coffee-600 hover:text-coffee-500"
                    >
                      تعيين كافتراضية
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(card.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    aria-label="حذف البطاقة"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900">ملاحظة أمنية</h3>
        <p className="mt-1 text-sm text-gray-600">
          معلومات الدفع مشفرة ومحفوظة بأمان. نستخدم Stripe لمعالجة الدفع ولا نخزن أرقام البطاقات
          كاملة أو رمز التحقق.
        </p>
      </div>
    </div>
  );
}
