type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
type ErrorCategory = 'validation' | 'payment' | 'network' | 'auth' | 'database' | 'unknown';

interface AppErrorOptions {
  message?: string | undefined;
  messageAr?: string | undefined;
  code?: string | undefined;
  statusCode?: number | undefined;
  severity?: ErrorSeverity | undefined;
  category?: ErrorCategory | undefined;
  cause?: Error | undefined;
  context?: Record<string, unknown> | undefined;
  recoverable?: boolean | undefined;
}

const ERROR_MESSAGES_AR: Record<string, string> = {
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات',
  INVALID_EMAIL: 'البريد الإلكتروني غير صالح',
  INVALID_PHONE: 'رقم الهاتف غير صالح',
  INVALID_PASSWORD: 'كلمة المرور غير صالحة',
  INVALID_NAME: 'الاسم غير صالح',
  INVALID_ADDRESS: 'العنوان غير صالح',
  INVALID_CARD: 'بطاقة الدفع غير صالحة',
  INVALID_AMOUNT: 'المبلغ غير صالح',
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  MIN_LENGTH: 'يجب أن يكون على الأقل {min} أحرف',
  MAX_LENGTH: 'يجب ألا يتجاوز {max} أحرف',
  PAYMENT_ERROR: 'خطأ في عملية الدفع',
  PAYMENT_DECLINED: 'تم رفض عملية الدفع',
  PAYMENT_TIMEOUT: 'انتهت مهلة عملية الدفع',
  PAYMENT_CANCELLED: 'تم إلغاء عملية الدفع',
  INSUFFICIENT_FUNDS: 'رصيد غير كافٍ',
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  NETWORK_TIMEOUT: 'انتهت مهلة الاتصال',
  NETWORK_OFFLINE: 'أنت غير متصل بالإنترنت',
  AUTH_ERROR: 'خطأ في المصادقة',
  AUTH_UNAUTHORIZED: 'غير مصرح لك بالوصول',
  AUTH_FORBIDDEN: 'محظور',
  AUTH_TOKEN_EXPIRED: 'انتهت صلاحية الجلسة',
  AUTH_INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  DATABASE_ERROR: 'خطأ في قاعدة البيانات',
  DATABASE_CONNECTION: 'خطأ في الاتصال بقاعدة البيانات',
  DATABASE_QUERY: 'خطأ في الاستعلام',
  NOT_FOUND: 'العنصر غير موجود',
  ALREADY_EXISTS: 'العنصر موجود بالفعل',
  UNKNOWN_ERROR: 'خطأ غير متوقع',
  SERVER_ERROR: 'خطأ في الخادم',
};

function getArabicMessage(code: string): string {
  return ERROR_MESSAGES_AR[code] ?? 'خطأ غير متوقع';
}

class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly messageAr: string;
  public readonly context: Record<string, unknown>;
  public readonly recoverable: boolean;
  public readonly timestamp: Date;
  public readonly cause: Error | undefined;

  constructor(options: AppErrorOptions = {}) {
    const code = options.code ?? 'UNKNOWN_ERROR';
    super(options.message ?? getArabicMessage(code));
    this.name = 'AppError';
    this.code = code;
    this.statusCode = options.statusCode ?? 500;
    this.severity = options.severity ?? 'medium';
    this.category = options.category ?? 'unknown';
    this.messageAr = options.messageAr ?? getArabicMessage(code) ?? 'خطأ غير متوقع';
    this.context = options.context ?? {};
    this.recoverable = options.recoverable ?? false;
    this.timestamp = new Date();
    this.cause = options.cause;

    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      messageAr: this.messageAr,
      code: this.code,
      statusCode: this.statusCode,
      severity: this.severity,
      category: this.category,
      context: this.context,
      recoverable: this.recoverable,
      timestamp: this.timestamp.toISOString(),
      cause: this.cause?.message,
    };
  }

  toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }

  toUserMessage(): string {
    if (import.meta.env.DEV) {
      return `${this.messageAr} (${this.code})`;
    }
    return this.messageAr;
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}

class ValidationError extends AppError {
  public readonly field: string;
  public readonly value: unknown | undefined;

  constructor(field: string, options: AppErrorOptions = {}) {
    const code = options.code ?? 'VALIDATION_ERROR';
    super({
      message: options.message ?? `Validation failed for field: ${field}`,
      messageAr: options.messageAr ?? getArabicMessage(code),
      code,
      statusCode: options.statusCode ?? 400,
      severity: options.severity ?? 'low',
      category: 'validation',
      context: {field, ...options.context},
      recoverable: options.recoverable ?? true,
      cause: options.cause,
    });
    this.name = 'ValidationError';
    this.field = field;
    this.value = options.context?.value;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  static invalidEmail(value?: string): ValidationError {
    return new ValidationError('email', {
      code: 'INVALID_EMAIL',
      context: {value},
    });
  }

  static invalidPhone(value?: string): ValidationError {
    return new ValidationError('phone', {
      code: 'INVALID_PHONE',
      context: {value},
    });
  }

  static invalidPassword(): ValidationError {
    return new ValidationError('password', {code: 'INVALID_PASSWORD'});
  }

  static requiredField(field: string): ValidationError {
    return new ValidationError(field, {code: 'REQUIRED_FIELD'});
  }

  static minLength(field: string, min: number, value?: string): ValidationError {
    return new ValidationError(field, {
      code: 'MIN_LENGTH',
      context: {min, value},
    });
  }

  static maxLength(field: string, max: number, value?: string): ValidationError {
    return new ValidationError(field, {
      code: 'MAX_LENGTH',
      context: {max, value},
    });
  }

  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }
}

class PaymentError extends AppError {
  public readonly paymentId: string | undefined;
  public readonly amount: number | undefined;
  public readonly currency: string | undefined;

  constructor(options: AppErrorOptions = {}) {
    const code = options.code ?? 'PAYMENT_ERROR';
    super({
      message: options.message ?? getArabicMessage(code),
      messageAr: options.messageAr ?? getArabicMessage(code),
      code,
      statusCode: options.statusCode ?? 402,
      severity: options.severity ?? 'high',
      category: 'payment',
      recoverable: options.recoverable ?? false,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'PaymentError';
    this.paymentId = options.context?.paymentId as string | undefined;
    this.amount = options.context?.amount as number | undefined;
    this.currency = options.context?.currency as string | undefined;

    Object.setPrototypeOf(this, PaymentError.prototype);
  }

  static declined(reason?: string): PaymentError {
    return new PaymentError({
      code: 'PAYMENT_DECLINED',
      context: {reason},
    });
  }

  static timeout(paymentId?: string): PaymentError {
    return new PaymentError({
      code: 'PAYMENT_TIMEOUT',
      severity: 'medium',
      recoverable: true,
      context: {paymentId},
    });
  }

  static cancelled(): PaymentError {
    return new PaymentError({
      code: 'PAYMENT_CANCELLED',
      severity: 'low',
      recoverable: true,
    });
  }

  static insufficientFunds(amount: number, currency: string): PaymentError {
    return new PaymentError({
      code: 'INSUFFICIENT_FUNDS',
      context: {amount, currency},
    });
  }

  static invalidCard(cardType?: string): PaymentError {
    return new PaymentError({
      code: 'INVALID_CARD',
      context: {cardType},
    });
  }

  static isPaymentError(error: unknown): error is PaymentError {
    return error instanceof PaymentError;
  }
}

class NetworkError extends AppError {
  public readonly endpoint: string | undefined;
  public readonly method: string | undefined;

  constructor(options: AppErrorOptions = {}) {
    const code = options.code ?? 'NETWORK_ERROR';
    super({
      message: options.message ?? getArabicMessage(code),
      messageAr: options.messageAr ?? getArabicMessage(code),
      code,
      statusCode: options.statusCode ?? 503,
      severity: options.severity ?? 'medium',
      category: 'network',
      recoverable: options.recoverable ?? true,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'NetworkError';
    this.endpoint = options.context?.endpoint as string | undefined;
    this.method = options.context?.method as string | undefined;

    Object.setPrototypeOf(this, NetworkError.prototype);
  }

  static timeout(endpoint?: string): NetworkError {
    return new NetworkError({
      code: 'NETWORK_TIMEOUT',
      context: {endpoint},
    });
  }

  static offline(): NetworkError {
    return new NetworkError({
      code: 'NETWORK_OFFLINE',
      recoverable: true,
    });
  }

  static connectionFailed(endpoint: string, cause?: Error): NetworkError {
    return new NetworkError({
      code: 'NETWORK_ERROR',
      context: {endpoint},
      cause,
    });
  }

  static isNetworkError(error: unknown): error is NetworkError {
    return error instanceof NetworkError;
  }
}

class AuthError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    const code = options.code ?? 'AUTH_ERROR';
    super({
      message: options.message ?? getArabicMessage(code),
      messageAr: options.messageAr ?? getArabicMessage(code),
      code,
      statusCode: options.statusCode ?? 401,
      severity: options.severity ?? 'medium',
      category: 'auth',
      recoverable: options.recoverable ?? true,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'AuthError';

    Object.setPrototypeOf(this, AuthError.prototype);
  }

  static unauthorized(): AuthError {
    return new AuthError({code: 'AUTH_UNAUTHORIZED'});
  }

  static forbidden(): AuthError {
    return new AuthError({
      code: 'AUTH_FORBIDDEN',
      statusCode: 403,
      recoverable: false,
    });
  }

  static tokenExpired(): AuthError {
    return new AuthError({code: 'AUTH_TOKEN_EXPIRED'});
  }

  static invalidCredentials(): AuthError {
    return new AuthError({code: 'AUTH_INVALID_CREDENTIALS'});
  }

  static isAuthError(error: unknown): error is AuthError {
    return error instanceof AuthError;
  }
}

class DatabaseError extends AppError {
  constructor(options: AppErrorOptions = {}) {
    const code = options.code ?? 'DATABASE_ERROR';
    super({
      message: options.message ?? getArabicMessage(code),
      messageAr: options.messageAr ?? getArabicMessage(code),
      code,
      statusCode: options.statusCode ?? 500,
      severity: options.severity ?? 'high',
      category: 'database',
      recoverable: options.recoverable ?? false,
      context: options.context,
      cause: options.cause,
    });
    this.name = 'DatabaseError';

    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  static connection(cause?: Error): DatabaseError {
    return new DatabaseError({
      code: 'DATABASE_CONNECTION',
      cause,
    });
  }

  static query(cause?: Error): DatabaseError {
    return new DatabaseError({
      code: 'DATABASE_QUERY',
      cause,
    });
  }

  static notFound(resource: string): DatabaseError {
    return new DatabaseError({
      code: 'NOT_FOUND',
      statusCode: 404,
      severity: 'low',
      context: {resource},
    });
  }

  static alreadyExists(resource: string): DatabaseError {
    return new DatabaseError({
      code: 'ALREADY_EXISTS',
      statusCode: 409,
      severity: 'low',
      context: {resource},
    });
  }

  static isDatabaseError(error: unknown): error is DatabaseError {
    return error instanceof DatabaseError;
  }
}

function handleError(
  error: unknown,
  options: {
    logToConsole?: boolean | undefined;
    throwError?: boolean | undefined;
    context?: Record<string, unknown> | undefined;
  } = {}
): AppError {
  const logToConsole = options.logToConsole ?? true;
  const throwError = options.throwError ?? false;
  const context = options.context ?? {};

  let appError: AppError;

  if (AppError.isAppError(error)) {
    return new AppError({
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      severity: error.severity,
      category: error.category,
      messageAr: error.messageAr,
      context: {...error.context, ...context},
      recoverable: error.recoverable,
      cause: error.cause,
    });
  } else if (error instanceof Error) {
    appError = new AppError({
      message: error.message,
      code: 'UNKNOWN_ERROR',
      cause: error,
      context,
    });
  } else {
    appError = new AppError({
      message: 'Unknown error',
      code: 'UNKNOWN_ERROR',
      context: {original: error, ...context},
    });
  }

  if (logToConsole) {
    logErrorToConsole(appError);
  }

  if (throwError) {
    throw appError;
  }

  return appError;
}

function logErrorToConsole(error: AppError): void {
  const logData = {
    timestamp: error.timestamp.toISOString(),
    name: error.name,
    code: error.code,
    message: error.message,
    messageAr: error.messageAr,
    severity: error.severity,
    category: error.category,
    context: error.context,
    recoverable: error.recoverable,
    cause: error.cause?.message,
  };

  switch (error.severity) {
    case 'critical':
      console.error('[CRITICAL]', logData);
      break;
    case 'high':
      console.error('[ERROR]', logData);
      break;
    case 'medium':
      console.warn('[WARN]', logData);
      break;
    case 'low':
      console.info('[INFO]', logData);
      break;
  }
}

function getUserFriendlyMessage(error: unknown): string {
  const appError = handleError(error, {logToConsole: false});
  return appError.toUserMessage();
}

function isRecoverable(error: unknown): boolean {
  const appError = handleError(error, {logToConsole: false});
  return appError.recoverable;
}

function getErrorCode(error: unknown): string {
  const appError = handleError(error, {logToConsole: false});
  return appError.code;
}

function getErrorSeverity(error: unknown): ErrorSeverity {
  const appError = handleError(error, {logToConsole: false});
  return appError.severity;
}

export {
  AppError,
  ValidationError,
  PaymentError,
  NetworkError,
  AuthError,
  DatabaseError,
  handleError,
  getUserFriendlyMessage,
  isRecoverable,
  getErrorCode,
  getErrorSeverity,
  ERROR_MESSAGES_AR,
};

export type {ErrorSeverity, ErrorCategory, AppErrorOptions};
