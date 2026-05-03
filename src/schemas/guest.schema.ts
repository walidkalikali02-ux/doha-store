import {z} from 'zod';
import {emailSchema} from './shipping.schema';

const arabicMessages = {
  required: 'هذا الحقل مطلوب',
  invalidEmail: 'البريد الإلكتروني غير صالح',
  emailsNotMatching: 'البريد الإلكتروني غير متطابق',
  invalidPhone: 'رقم الهاتف غير صالح. يجب أن يكون 8 أرقام على الأقل',
  invalidPhoneFormat: 'رقم الهاتف يجب أن يحتوي على أرقام فقط',
  minLength: (field: string, min: number) => `${field} يجب أن يكون على الأقل ${min} أحرف`,
  maxLength: (field: string, max: number) => `${field} يجب ألا يتجاوز ${max} أحرف`,
  invalidName: 'الاسم يجب أن يحتوي على أحرف فقط',
  termsRequired: 'يجب الموافقة على الشروط والأحكام',
};

const guestNameSchema = z
  .string({message: arabicMessages.required})
  .min(2, {message: arabicMessages.minLength('الاسم', 2)})
  .max(100, {message: arabicMessages.maxLength('الاسم', 100)})
  .regex(/^[\u0600-\u06FFa-zA-Z\s'-]+$/, {
    message: arabicMessages.invalidName,
  });

const guestPhoneSchema = z
  .string({message: arabicMessages.required})
  .min(1, {message: arabicMessages.required})
  .regex(/^[+]?[\d\s-()]+$/, {message: arabicMessages.invalidPhoneFormat})
  .refine(val => val.replace(/[\s-()]/g, '').length >= 8, {
    message: arabicMessages.invalidPhone,
  });

const confirmEmailSchema = z
  .string({message: arabicMessages.required})
  .min(1, {message: arabicMessages.required});

export const guestFormSchema = z
  .object({
    firstName: guestNameSchema,
    lastName: guestNameSchema,
    email: emailSchema,
    confirmEmail: confirmEmailSchema,
    phone: guestPhoneSchema,
    acceptTerms: z.boolean().refine(val => val === true, {
      message: arabicMessages.termsRequired,
    }),
    subscribeNewsletter: z.boolean().default(false),
  })
  .refine(data => data.email === data.confirmEmail, {
    message: arabicMessages.emailsNotMatching,
    path: ['confirmEmail'],
  });

export const guestCheckoutSchema = z.object({
  guest: guestFormSchema,
});

export type GuestFormData = z.infer<typeof guestFormSchema>;
export type GuestCheckoutData = z.infer<typeof guestCheckoutSchema>;
