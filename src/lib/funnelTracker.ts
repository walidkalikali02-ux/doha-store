import {analytics} from './analytics';
import {CUSTOM_EVENTS} from './analytics/ga4Config';

type FunnelStep = {
  stepName: string;
  stepNumber: number;
  requiredFields: string[];
};

type Funnel = {
  name: string;
  steps: FunnelStep[];
};

interface FunnelProgressData {
  funnelName: string;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  timestamp: string;
  additionalData?: Record<string, unknown>;
}

interface FunnelConversionData {
  funnelName: string;
  completedSteps: number;
  totalSteps: number;
  startedAt: string;
  completedAt: string;
  droppedAtStep?: number;
  droppedAtStepName?: string | undefined;
}

const FUNNELS: Record<string, Funnel> = {
  checkout: {
    name: 'checkout_funnel',
    steps: [
      {
        stepName: 'viewed_cart',
        stepNumber: 0,
        requiredFields: ['cart_value', 'item_count'],
      },
      {
        stepName: 'began_checkout',
        stepNumber: 1,
        requiredFields: ['cart_value', 'item_count'],
      },
      {
        stepName: 'completed_shipping',
        stepNumber: 2,
        requiredFields: ['shipping_method', 'cart_value'],
      },
      {
        stepName: 'completed_payment',
        stepNumber: 3,
        requiredFields: ['payment_method', 'cart_value'],
      },
      {
        stepName: 'completed_review',
        stepNumber: 4,
        requiredFields: ['cart_value', 'item_count'],
      },
      {
        stepName: 'purchase',
        stepNumber: 5,
        requiredFields: ['transaction_id', 'value', 'currency'],
      },
    ],
  },
  registration: {
    name: 'registration_funnel',
    steps: [
      {
        stepName: 'viewed_registration',
        stepNumber: 0,
        requiredFields: [],
      },
      {
        stepName: 'started_registration',
        stepNumber: 1,
        requiredFields: ['email'],
      },
      {
        stepName: 'submitted_registration',
        stepNumber: 2,
        requiredFields: ['email'],
      },
      {
        stepName: 'email_verification_sent',
        stepNumber: 3,
        requiredFields: ['email'],
      },
      {
        stepName: 'registration_complete',
        stepNumber: 4,
        requiredFields: ['user_id'],
      },
    ],
  },
  product_discovery: {
    name: 'product_discovery_funnel',
    steps: [
      {
        stepName: 'viewed_homepage',
        stepNumber: 0,
        requiredFields: [],
      },
      {
        stepName: 'viewed_product_list',
        stepNumber: 1,
        requiredFields: ['category'],
      },
      {
        stepName: 'viewed_product',
        stepNumber: 2,
        requiredFields: ['product_id', 'product_name'],
      },
      {
        stepName: 'added_to_cart',
        stepNumber: 3,
        requiredFields: ['product_id', 'product_name', 'quantity'],
      },
    ],
  },
  account_management: {
    name: 'account_management_funnel',
    steps: [
      {
        stepName: 'viewed_account',
        stepNumber: 0,
        requiredFields: [],
      },
      {
        stepName: 'edited_profile',
        stepNumber: 1,
        requiredFields: ['user_id'],
      },
      {
        stepName: 'saved_profile',
        stepNumber: 2,
        requiredFields: ['user_id'],
      },
    ],
  },
};

class FunnelTracker {
  private activeFunnels: Map<string, {startedAt: string; currentStep: number}> = new Map();

  startFunnel(funnelId: string, initialData?: Record<string, unknown>): void {
    const funnel = FUNNELS[funnelId];
    if (!funnel) {
      console.warn(`Unknown funnel: ${funnelId}`);
      return;
    }

    this.activeFunnels.set(funnelId, {
      startedAt: new Date().toISOString(),
      currentStep: 0,
    });

    const firstStep = funnel.steps[0];
    if (!firstStep) {
      return;
    }

    analytics.trackEvent({
      eventName: 'funnel_started',
      eventCategory: 'funnel',
      eventLabel: funnel.name,
      additionalData: {
        funnel_name: funnel.name,
        funnel_id: funnelId,
        total_steps: funnel.steps.length,
        first_step: firstStep.stepName,
        ...initialData,
      },
    });
  }

  advanceStep(funnelId: string, stepName: string, data?: Record<string, unknown>): void {
    const funnel = FUNNELS[funnelId];
    const progress = this.activeFunnels.get(funnelId);

    if (!funnel || !progress) {
      console.warn(`Funnel not started: ${funnelId}`);
      return;
    }

    const stepIndex = funnel.steps.findIndex(s => s.stepName === stepName);
    if (stepIndex === -1) {
      console.warn(`Unknown step: ${stepName} in funnel: ${funnelId}`);
      return;
    }

    const step = funnel.steps[stepIndex];
    if (!step) {
      return;
    }

    progress.currentStep = stepIndex + 1;

    analytics.trackEvent({
      eventName: 'funnel_step_completed',
      eventCategory: 'funnel',
      eventLabel: funnel.name,
      eventValue: stepIndex + 1,
      additionalData: {
        funnel_name: funnel.name,
        funnel_id: funnelId,
        step_number: step.stepNumber,
        step_name: step.stepName,
        total_steps: funnel.steps.length,
        progress_percentage: ((stepIndex + 1) / funnel.steps.length) * 100,
        ...data,
      },
    });
  }

  completeFunnel(funnelId: string, data?: Record<string, unknown>): FunnelConversionData | null {
    const funnel = FUNNELS[funnelId];
    const progress = this.activeFunnels.get(funnelId);

    if (!funnel || !progress) {
      return null;
    }

    const conversionData: FunnelConversionData = {
      funnelName: funnel.name,
      completedSteps: progress.currentStep,
      totalSteps: funnel.steps.length,
      startedAt: progress.startedAt,
      completedAt: new Date().toISOString(),
    };

    analytics.trackEvent({
      eventName: 'funnel_completed',
      eventCategory: 'funnel',
      eventLabel: funnel.name,
      eventValue: funnel.steps.length,
      additionalData: {
        ...conversionData,
        ...data,
      },
    });

    analytics.trackEvent({
      eventName: CUSTOM_EVENTS.PURCHASE,
      eventCategory: 'ecommerce',
      eventLabel: `funnel_${funnelId}_completed`,
      additionalData: {
        funnel_name: funnel.name,
        funnel_id: funnelId,
        total_steps: funnel.steps.length,
        ...data,
      },
    });

    this.activeFunnels.delete(funnelId);

    return conversionData;
  }

  dropFromFunnel(
    funnelId: string,
    reason?: string,
    data?: Record<string, unknown>
  ): FunnelConversionData | null {
    const funnel = FUNNELS[funnelId];
    const progress = this.activeFunnels.get(funnelId);

    if (!funnel || !progress) {
      return null;
    }

    const droppedStep = funnel.steps[progress.currentStep - 1];

    const conversionData: FunnelConversionData = {
      funnelName: funnel.name,
      completedSteps: progress.currentStep,
      totalSteps: funnel.steps.length,
      startedAt: progress.startedAt,
      completedAt: new Date().toISOString(),
      droppedAtStep: progress.currentStep,
      droppedAtStepName: droppedStep?.stepName,
    };

    analytics.trackEvent({
      eventName: 'funnel_dropped',
      eventCategory: 'funnel',
      eventLabel: funnel.name,
      additionalData: {
        ...conversionData,
        drop_reason: reason,
        ...data,
      },
    });

    this.activeFunnels.delete(funnelId);

    return conversionData;
  }

  getFunnelProgress(funnelId: string): FunnelProgressData | null {
    const funnel = FUNNELS[funnelId];
    const progress = this.activeFunnels.get(funnelId);

    if (!funnel || !progress) {
      return null;
    }

    const currentStep = funnel.steps[progress.currentStep - 1];

    return {
      funnelName: funnel.name,
      currentStep: progress.currentStep,
      totalSteps: funnel.steps.length,
      stepName: currentStep?.stepName ?? 'unknown',
      timestamp: progress.startedAt,
    };
  }

  getActiveFunnels(): string[] {
    return Array.from(this.activeFunnels.keys());
  }
}

export const funnelTracker = new FunnelTracker();

export const trackCheckoutFunnel = {
  start: (data?: Record<string, unknown>) => {
    funnelTracker.startFunnel('checkout', data);
  },
  viewCart: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('checkout', 'viewed_cart', data);
  },
  beginCheckout: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('checkout', 'began_checkout', data);
  },
  completeShipping: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('checkout', 'completed_shipping', data);
  },
  completePayment: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('checkout', 'completed_payment', data);
  },
  completeReview: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('checkout', 'completed_review', data);
  },
  complete: (data?: Record<string, unknown>) => {
    return funnelTracker.completeFunnel('checkout', data);
  },
  drop: (reason?: string, data?: Record<string, unknown>) => {
    return funnelTracker.dropFromFunnel('checkout', reason, data);
  },
};

export const trackRegistrationFunnel = {
  start: (data?: Record<string, unknown>) => {
    funnelTracker.startFunnel('registration', data);
  },
  viewRegistration: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('registration', 'viewed_registration', data);
  },
  startRegistration: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('registration', 'started_registration', data);
  },
  submitRegistration: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('registration', 'submitted_registration', data);
  },
  emailVerificationSent: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('registration', 'email_verification_sent', data);
  },
  complete: (data?: Record<string, unknown>) => {
    return funnelTracker.completeFunnel('registration', data);
  },
  drop: (reason?: string, data?: Record<string, unknown>) => {
    return funnelTracker.dropFromFunnel('registration', reason, data);
  },
};

export const trackProductDiscovery = {
  start: (data?: Record<string, unknown>) => {
    funnelTracker.startFunnel('product_discovery', data);
  },
  viewHomepage: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('product_discovery', 'viewed_homepage', data);
  },
  viewProductList: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('product_discovery', 'viewed_product_list', data);
  },
  viewProduct: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('product_discovery', 'viewed_product', data);
  },
  addToCart: (data?: Record<string, unknown>) => {
    funnelTracker.advanceStep('product_discovery', 'added_to_cart', data);
  },
  complete: (data?: Record<string, unknown>) => {
    return funnelTracker.completeFunnel('product_discovery', data);
  },
  drop: (reason?: string, data?: Record<string, unknown>) => {
    return funnelTracker.dropFromFunnel('product_discovery', reason, data);
  },
};

export type {FunnelProgressData, FunnelConversionData};
