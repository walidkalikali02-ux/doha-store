import {SavedPaymentMethods} from '@/components/account/SavedPaymentMethods';

export function PaymentMethods() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">طرق الدفع</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة بطاقات الدفع المحفوظة لتسهيل عملية الشراء.
        </p>
      </div>

      <SavedPaymentMethods />
    </div>
  );
}
