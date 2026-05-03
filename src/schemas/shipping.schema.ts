import {z} from 'zod';

const arabicMessages = {
  required: 'هذا الحقل مطلوب',
  invalidEmail: 'البريد الإلكتروني غير صالح',
  invalidPhone: 'رقم الهاتف غير صالح. يجب أن يكون 8 أرقام على الأقل',
  invalidPhoneFormat: 'رقم الهاتف يجب أن يحتوي على أرقام فقط',
  minLength: (field: string, min: number) => `${field} يجب أن يكون على الأقل ${min} أحرف`,
  maxLength: (field: string, max: number) => `${field} يجب ألا يتجاوز ${max} أحرف`,
  invalidPostalCode: 'الرمز البريدي غير صالح',
  invalidCountry: 'الدولة غير صالحة',
  invalidShippingMethod: 'طريقة الشحن غير صالحة',
  invalidName: 'الاسم يجب أن يحتوي على أحرف فقط',
  poBoxNotAllowed: 'لا يُسمح ببريد غير صناعي لطريقة الشحن السريع/الليلي',
  poBoxDetected: 'العنوان يحتوي على رقم صندوق بريد',
};

export const emailSchema = z
  .string({message: arabicMessages.required})
  .min(1, {message: arabicMessages.required})
  .email({message: arabicMessages.invalidEmail})
  .max(255, {message: arabicMessages.maxLength('البريد الإلكتروني', 255)});

export const phoneSchema = z
  .string({message: arabicMessages.required})
  .min(1, {message: arabicMessages.required})
  .regex(/^[+]?[\d\s-()]+$/, {message: arabicMessages.invalidPhoneFormat})
  .refine(val => val.replace(/[\s-()]/g, '').length >= 8, {
    message: arabicMessages.invalidPhone,
  });

export const kuwaitiPhoneSchema = z
  .string({message: arabicMessages.required})
  .min(1, {message: arabicMessages.required})
  .regex(/^[+]?[\d\s-()]+$/, {message: arabicMessages.invalidPhoneFormat})
  .refine(val => val.replace(/[\s-()]/g, '').length >= 8, {
    message: arabicMessages.invalidPhone,
  });

export const nameSchema = z
  .string({message: arabicMessages.required})
  .min(2, {message: arabicMessages.minLength('الاسم', 2)})
  .max(100, {message: arabicMessages.maxLength('الاسم', 100)})
  .regex(/^[\u0600-\u06FFa-zA-Z\s'-]+$/, {
    message: arabicMessages.invalidName,
  });

export const streetAddressSchema = z
  .string({message: arabicMessages.required})
  .min(5, {message: arabicMessages.minLength('العنوان', 5)})
  .max(500, {message: arabicMessages.maxLength('العنوان', 500)});

export const citySchema = z
  .string({message: arabicMessages.required})
  .min(2, {message: arabicMessages.minLength('المدينة', 2)})
  .max(100, {message: arabicMessages.maxLength('المدينة', 100)});

export const stateSchema = z
  .string({message: arabicMessages.required})
  .min(2, {message: arabicMessages.minLength('المنطقة', 2)})
  .max(100, {message: arabicMessages.maxLength('المنطقة', 100)});

const PO_BOX_PATTERNS = [
  /p\.?\s*o\.?\s*box/i,
  /post\s*box/i,
  /box\s*\d+/i,
  /صندوق\s*بريد/i,
  /ص\.ب/i,
  /c\.o\.d/i,
  /c\/o/i,
];

function isPOBox(address: string): boolean {
  return PO_BOX_PATTERNS.some(pattern => pattern.test(address));
}

function validatePostalCodeByCountry(postalCode: string, country: string): boolean {
  const patterns: Record<string, RegExp> = {
    KW: /^\d{5}$/,
    QA: /^\d{4,5}$/,
    SA: /^\d{5}(-\d{4})?$/,
    AE: /^[A-Z\d]{4,10}$/i,
    BH: /^\d{4,5}$|^(KW|BH)-\d{4}$/,
    OM: /^\d{3}$|^\d{5}$/,
    EG: /^\d{5}$/,
    JO: /^\d{5}$/,
    LB: /^\d{4}(-\d{4})?$/,
  };

  const pattern = patterns[country.toUpperCase()];
  if (!pattern) return true;
  return pattern.test(postalCode);
}

function getPostalCodeMessage(country: string): string {
  const messages: Record<string, string> = {
    KW: 'الرمز البريدي للكويت يجب أن يكون 5 أرقام',
    QA: 'الرمز البريدي لقطر يجب أن يكون 4-5 أرقام',
    SA: 'الرمز البريدي للسعودية يجب أن يكون 5 أرقام أو 5-4',
    AE: 'الرمز البريدي للإمارات يجب أن يكون 4-10 أحرف أو أرقام',
    BH: 'الرمز البريدي للبحرين يجب أن يكون 4-5 أرقام',
    OM: 'الرمز البريدي لعمان يجب أن يكون 3 أو 5 أرقام',
    EG: 'الرمز البريدي لمصر يجب أن يكون 5 أرقام',
    JO: 'الرمز البريدي للأردن يجب أن يكون 5 أرقام',
    LB: 'الرمز البريدي للبنان يجب أن يكون 4 أو 4-4 أرقام',
  };
  return messages[country.toUpperCase()] || arabicMessages.invalidPostalCode;
}

export const postalCodeSchema = z
  .string({message: arabicMessages.required})
  .min(3, {message: arabicMessages.minLength('الرمز البريدي', 3)})
  .max(20, {message: arabicMessages.maxLength('الرمز البريدي', 20)})
  .regex(/^[\dA-Za-z-]+$/, {message: arabicMessages.invalidPostalCode});

export const countrySchema = z
  .string({message: arabicMessages.required})
  .min(2, {message: arabicMessages.minLength('الدولة', 2)})
  .max(100, {message: arabicMessages.maxLength('الدولة', 100)});

export const countryCodeSchema = z.enum(['KW', 'SA', 'AE', 'BH', 'OM', 'QA', 'EG', 'JO', 'LB'], {
  message: arabicMessages.invalidCountry,
});

export const addressSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  street1: streetAddressSchema,
  street2: z
    .string()
    .max(500, {message: arabicMessages.maxLength('العنوان', 500)})
    .optional(),
  city: citySchema,
  state: stateSchema.optional(),
  postalCode: postalCodeSchema.optional(),
  country: countrySchema,
  countryCode: countryCodeSchema,
});

export const shippingMethodSchema = z.enum(['standard', 'express', 'overnight', 'local_pickup'], {
  message: arabicMessages.invalidShippingMethod,
});

export const shippingDetailsSchema = z
  .object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    useSameAddressForBilling: z.boolean().default(true),
    shippingMethod: shippingMethodSchema,
    notes: z
      .string()
      .max(1000, {message: arabicMessages.maxLength('الملاحظات', 1000)})
      .optional(),
  })
  .refine(
    data => {
      if (data.shippingMethod === 'express' || data.shippingMethod === 'overnight') {
        const fullAddress = [
          data.shippingAddress.street1,
          data.shippingAddress.street2,
          data.shippingAddress.city,
        ]
          .filter(Boolean)
          .join(' ');
        return !isPOBox(fullAddress);
      }
      return true;
    },
    {
      message: arabicMessages.poBoxNotAllowed,
      path: ['shippingAddress', 'street1'],
    }
  );

export type ShippingMethod = z.infer<typeof shippingMethodSchema>;
export type Address = z.infer<typeof addressSchema>;
export type ShippingDetails = z.infer<typeof shippingDetailsSchema>;
export type CountryCode = z.infer<typeof countryCodeSchema>;

export const COUNTRIES: Record<string, {nameAr: string; nameEn: string; code: CountryCode}> = {
  KW: {nameAr: 'الكويت', nameEn: 'Kuwait', code: 'KW'},
  SA: {nameAr: 'السعودية', nameEn: 'Saudi Arabia', code: 'SA'},
  AE: {nameAr: 'الإمارات', nameEn: 'UAE', code: 'AE'},
  BH: {nameAr: 'البحرين', nameEn: 'Bahrain', code: 'BH'},
  OM: {nameAr: 'عمان', nameEn: 'Oman', code: 'OM'},
  QA: {nameAr: 'قطر', nameEn: 'Qatar', code: 'QA'},
  EG: {nameAr: 'مصر', nameEn: 'Egypt', code: 'EG'},
  JO: {nameAr: 'الأردن', nameEn: 'Jordan', code: 'JO'},
  LB: {nameAr: 'لبنان', nameEn: 'Lebanon', code: 'LB'},
};

export const SHIPPING_METHODS: Record<
  ShippingMethod,
  {
    nameAr: string;
    nameEn: string;
    estimatedDays: string;
    price: number;
  }
> = {
  standard: {
    nameAr: 'الشحن العادي',
    nameEn: 'Standard Shipping',
    estimatedDays: '5-7 أيام',
    price: 500,
  },
  express: {
    nameAr: 'الشحن السريع',
    nameEn: 'Express Shipping',
    estimatedDays: '2-3 أيام',
    price: 1500,
  },
  overnight: {
    nameAr: 'الشحن الليلي',
    nameEn: 'Overnight Shipping',
    estimatedDays: 'اليوم التالي',
    price: 2500,
  },
  local_pickup: {
    nameAr: 'الاستلام من الفرع',
    nameEn: 'Local Pickup',
    estimatedDays: 'جاهز خلال ساعتين',
    price: 0,
  },
};

export const KUWAIT_GOVERNORATES = [
  {nameAr: 'محافظة العاصمة', nameEn: 'Capital Governorate'},
  {nameAr: 'محافظة حولي', nameEn: 'Hawalli Governorate'},
  {nameAr: 'محافظة الفروانية', nameEn: 'Farwaniya Governorate'},
  {nameAr: 'محافظة مبارك الكبير', nameEn: 'Mubarak Al-Kabeer Governorate'},
  {nameAr: 'محافظة الأحمدي', nameEn: 'Ahmadi Governorate'},
  {nameAr: 'محافظة الجهراء', nameEn: 'Jahra Governorate'},
] as const;

export function validateEmail(email: string): {valid: boolean; error?: string | undefined} {
  const result = emailSchema.safeParse(email);
  if (result.success) {
    return {valid: true};
  }
  return {valid: false, error: result.error.issues[0]?.message};
}

export function validatePhone(phone: string): {valid: boolean; error?: string | undefined} {
  const result = phoneSchema.safeParse(phone);
  if (result.success) {
    return {valid: true};
  }
  return {valid: false, error: result.error.issues[0]?.message};
}

export interface FieldValidationError {
  field: string;
  message: string;
}

export interface AddressValidationResult {
  valid: boolean;
  errors?: FieldValidationError[];
  data?: Address;
}

export function validateAddress(address: unknown): AddressValidationResult {
  const errors: FieldValidationError[] = [];

  const baseResult = addressSchema.safeParse(address);
  if (!baseResult.success) {
    for (const issue of baseResult.error.issues) {
      errors.push({
        field: issue.path.join('.'),
        message: issue.message,
      });
    }
  }

  const addr = address as {postalCode?: string; country?: string};
  if (addr?.postalCode && addr?.country) {
    if (!validatePostalCodeByCountry(addr.postalCode, addr.country)) {
      const existingIdx = errors.findIndex(e => e.field === 'postalCode');
      if (existingIdx >= 0) {
        errors[existingIdx].message = getPostalCodeMessage(addr.country);
      } else {
        errors.push({
          field: 'postalCode',
          message: getPostalCodeMessage(addr.country),
        });
      }
    }
  }

  if (errors.length > 0) {
    return {valid: false, errors};
  }
  return {valid: true, data: baseResult.data as Address};
}

export interface ShippingValidationResult {
  valid: boolean;
  errors?: FieldValidationError[];
  data?: ShippingDetails;
}

export function validateShippingDetails(data: unknown): ShippingValidationResult {
  const errors: FieldValidationError[] = [];

  const addr = data as {shippingAddress?: {street1?: string; street2?: string; city?: string}};
  if (addr?.shippingAddress) {
    const fullAddress = [
      addr.shippingAddress.street1,
      addr.shippingAddress.street2,
      addr.shippingAddress.city,
    ]
      .filter(Boolean)
      .join(' ');

    if (isPOBox(fullAddress)) {
      errors.push({
        field: 'shippingAddress.street1',
        message: arabicMessages.poBoxDetected,
      });
    }
  }

  const result = shippingDetailsSchema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const fieldPath = issue.path.join('.');
      if (!errors.some(e => e.field === fieldPath)) {
        errors.push({
          field: fieldPath,
          message: issue.message,
        });
      }
    }
  }

  if (errors.length > 0) {
    return {valid: false, errors};
  }
  return {valid: true, data: result.data as ShippingDetails};
}

export function validateAddressForShippingMethod(
  address: unknown,
  shippingMethod: ShippingMethod
): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  if (shippingMethod === 'express' || shippingMethod === 'overnight') {
    const addr = address as {street1?: string; street2?: string; city?: string};
    if (addr) {
      const fullAddress = [addr.street1, addr.street2, addr.city].filter(Boolean).join(' ');
      if (isPOBox(fullAddress)) {
        errors.push({
          field: 'street1',
          message: arabicMessages.poBoxNotAllowed,
        });
      }
    }
  }

  return errors;
}

export function isEmptyAddress(address: Partial<Address>): boolean {
  return !address.street1 && !address.city && !address.country;
}

export {isPOBox, validatePostalCodeByCountry, getPostalCodeMessage};