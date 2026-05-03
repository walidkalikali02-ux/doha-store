import { useState } from 'react';

export function useCheckout() {
  const [step, setStep] = useState(0);

  return {
    step,
    setStep,
    isProcessing: false,
  };
}

export default useCheckout;