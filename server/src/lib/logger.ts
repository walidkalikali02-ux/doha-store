import { createHmac, randomUUID } from 'crypto';

declare global {
  interface Request {
    id?: string;
  }
}

export interface LogContext {
  requestId: string;
  userId?: string;
  orderId?: string;
}

export interface OrderCreationLog {
  requestId: string;
  event: 'order_created';
  orderId: string;
  customerId: string | null;
  guestEmailHash: string | null;
  total: number;
  itemCount: number;
  timestamp: string;
}

export interface TrackingLookupLog {
  requestId: string;
  event: 'tracking_lookup';
  orderNumber: string;
  guestEmailHash: string | null;
  found: boolean;
  timestamp: string;
}

export interface StatusTransitionLog {
  requestId: string;
  event: 'status_transition';
  orderId: string;
  fromStatus: string;
  toStatus: string;
  actor: string;
  note?: string;
  timestamp: string;
}

export interface DiscountValidationLog {
  requestId: string;
  event: 'discount_validation';
  code: string;
  valid: boolean;
  reason?: string;
  orderId?: string;
  timestamp: string;
}

export interface ShippingRateRequestLog {
  requestId: string;
  event: 'shipping_rate_request';
  addressZone: string;
  methodSelected: string;
  cost: number;
  timestamp: string;
}

export interface DiscountUseLog {
  requestId: string;
  event: 'discount_use_increment';
  discountId: string;
  code: string;
  orderId?: string;
  timestamp: string;
}

export interface ErrorLog {
  requestId: string;
  event: 'error';
  orderId?: string;
  errorCode: string;
  errorMessage: string;
  stack?: string;
  timestamp: string;
}

export interface InfoLog {
  requestId: string;
  event: string;
  message: string;
  [key: string]: unknown;
}

export type LogEntry = OrderCreationLog | StatusTransitionLog | ErrorLog | InfoLog | TrackingLookupLog | DiscountValidationLog | ShippingRateRequestLog | DiscountUseLog;

function hashEmail(email: string): string {
  return createHmac('sha256', 'logging-secret').update(email.toLowerCase()).digest('hex').substring(0, 16);
}

export function hashGuestEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  return hashEmail(email);
}

function getRequestId(req?: unknown): string {
  if (req && typeof req === 'object' && 'id' in req) {
    return (req as { id?: string }).id || randomUUID();
  }
  return randomUUID();
}

function createLogEntry(entry: Record<string, unknown>): LogEntry {
  const requestId = entry.requestId as string || getRequestId();
  return {
    ...entry,
    requestId,
    timestamp: (entry.timestamp as string) || new Date().toISOString(),
  } as LogEntry;
}

export function logOrderCreation(params: {
  orderId: string;
  customerId: string | null;
  guestEmail: string | null;
  total: number;
  itemCount: number;
  requestId?: string;
}): void {
  const entry = createLogEntry({
    event: 'order_created',
    orderId: params.orderId,
    customerId: params.customerId,
    guestEmailHash: hashGuestEmail(params.guestEmail),
    total: params.total,
    itemCount: params.itemCount,
  });
  console.log(JSON.stringify(entry));
}

export function logTrackingLookup(params: {
  orderNumber: string;
  guestEmail: string | null;
  found: boolean;
  requestId?: string;
}): void {
  const entry = createLogEntry({
    event: 'tracking_lookup',
    orderNumber: params.orderNumber,
    guestEmailHash: hashGuestEmail(params.guestEmail),
    found: params.found,
  });
  console.log(JSON.stringify(entry));
}

export function logStatusTransition(params: {
  orderId: string;
  fromStatus: string;
  toStatus: string;
  actor: string;
  note?: string;
  requestId?: string;
}): void {
  const entry = createLogEntry({
    event: 'status_transition',
    orderId: params.orderId,
    fromStatus: params.fromStatus,
    toStatus: params.toStatus,
    actor: params.actor,
    note: params.note,
  });
  console.log(JSON.stringify(entry));
}

export function logInfo(params: {
  event: string;
  message: string;
  requestId?: string;
  eventId?: string;
}): void {
  const { event, message, requestId, eventId } = params;
  const entry = createLogEntry({
    event,
    message,
    requestId,
    eventId: eventId || randomUUID(),
  });
  console.log(JSON.stringify(entry));
}

export function logError(params: {
  errorCode: string;
  errorMessage: string;
  orderId?: string;
  stack?: string;
  requestId?: string;
  eventId?: string;
}): void {
  const entry = createLogEntry({
    event: 'error',
    errorCode: params.errorCode,
    errorMessage: params.errorMessage,
    orderId: params.orderId,
    stack: params.stack,
    eventId: params.eventId || randomUUID(),
  });
  console.error(JSON.stringify(entry));
}

export function logDiscountValidation(params: {
  code: string;
  valid: boolean;
  reason?: string;
  discountId?: string;
  orderId?: string;
  requestId?: string;
}): void {
  const entry = createLogEntry({
    event: 'discount_validation',
    code: params.code,
    valid: params.valid,
    reason: params.reason,
    discountId: params.discountId,
    orderId: params.orderId,
  });
  console.log(JSON.stringify(entry));
}

export function logShippingRateRequest(params: {
  addressZone: string;
  methodSelected: string;
  cost: number;
  requestId?: string;
}): void {
  const entry = createLogEntry({
    event: 'shipping_rate_request',
    addressZone: params.addressZone,
    methodSelected: params.methodSelected,
    cost: params.cost,
  });
  console.log(JSON.stringify(entry));
}

export function logDiscountUse(params: {
  discountId: string;
  code: string;
  orderId?: string;
  requestId?: string;
}): void {
  const entry = createLogEntry({
    event: 'discount_use_increment',
    discountId: params.discountId,
    code: params.code,
    orderId: params.orderId,
  });
  console.log(JSON.stringify(entry));
}

export function getLogger(req?: unknown) {
  const requestId = getRequestId(req);

  return {
    logOrderCreation: (params: Omit<Parameters<typeof logOrderCreation>[0], 'requestId'>) => {
      logOrderCreation({ ...params, requestId });
    },
    logStatusTransition: (params: Omit<Parameters<typeof logStatusTransition>[0], 'requestId'>) => {
      logStatusTransition({ ...params, requestId });
    },
    logError: (params: Omit<Parameters<typeof logError>[0], 'requestId'>) => {
      logError({ ...params, requestId });
    },
    logInfo: (params: Omit<Parameters<typeof logInfo>[0], 'requestId'>) => {
      logInfo({ ...params, requestId });
    },
    logDiscountValidation: (params: Omit<Parameters<typeof logDiscountValidation>[0], 'requestId'>) => {
      logDiscountValidation({ ...params, requestId });
    },
    logShippingRateRequest: (params: Omit<Parameters<typeof logShippingRateRequest>[0], 'requestId'>) => {
      logShippingRateRequest({ ...params, requestId });
    },
    logDiscountUse: (params: Omit<Parameters<typeof logDiscountUse>[0], 'requestId'>) => {
      logDiscountUse({ ...params, requestId });
    },
    requestId,
  };
}

export default {
  logOrderCreation,
  logStatusTransition,
  logError,
  logInfo,
  logTrackingLookup,
  logDiscountValidation,
  logShippingRateRequest,
  logDiscountUse,
  hashGuestEmail,
  getLogger,
};