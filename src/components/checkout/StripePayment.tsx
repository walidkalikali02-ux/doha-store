import {useState} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, PaymentElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {Button} from '@/components/common/Button';

// Initialize Stripe.js
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface StripePaymentProps {
  clientSecret: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function StripePayment({clientSecret, onSuccess, onError}: StripePaymentProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  // Provide defaults to satisfy exactOptionalPropertyTypes
  const handleSuccess = onSuccess || (() => {});
  const handleError = onError || ((_: string) => {});

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm onSuccess={handleSuccess} onError={handleError} />
    </Elements>
  );
}

interface CheckoutFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function CheckoutForm({onSuccess, onError}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const {error} = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmation`,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? 'An error occurred');
      onError?.(error.message ?? 'An error occurred');
    } else {
      onSuccess?.();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} disabled={!stripe || isLoading} size="lg">
        Pay Now
      </Button>
    </form>
  );
}
