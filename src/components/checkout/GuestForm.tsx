import {useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {motion, AnimatePresence} from 'motion/react';
import {User, Mail, Phone, Check, AlertCircle} from 'lucide-react';
import {guestFormSchema, type GuestFormData} from '@/schemas/guest.schema';

interface GuestFormProps {
  onSubmit: (data: GuestFormData) => void;
  initialData?: Partial<GuestFormData>;
  isSubmitting?: boolean;
}

export function GuestForm({onSubmit, initialData, isSubmitting = false}: GuestFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: {errors, touchedFields},
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestFormSchema) as never,
    defaultValues: {
      firstName: initialData?.firstName ?? '',
      lastName: initialData?.lastName ?? '',
      email: initialData?.email ?? '',
      confirmEmail: initialData?.confirmEmail ?? '',
      phone: initialData?.phone ?? '',
      acceptTerms: initialData?.acceptTerms ?? false,
      subscribeNewsletter: initialData?.subscribeNewsletter ?? false,
    },
    mode: 'onBlur',
  });

  const email = watch('email');
  const confirmEmail = watch('confirmEmail');
  const emailsMatch = email === confirmEmail;

  useEffect(() => {
    if (email && confirmEmail && !emailsMatch && touchedFields.confirmEmail) {
      setValue('confirmEmail', confirmEmail, {shouldValidate: true});
    }
  }, [email, confirmEmail, emailsMatch, touchedFields.confirmEmail, setValue]);

  const inputClasses = (fieldName: keyof GuestFormData, hasError: boolean) =>
    `w-full px-4 py-3.5 bg-brand-gray-50 border-2 rounded-none transition-all duration-300 outline-none text-right dir-ltr ${
      hasError && touchedFields[fieldName]
        ? 'border-red-500 bg-red-50'
        : touchedFields[fieldName] && !hasError
          ? 'border-brand-gold bg-white'
          : 'border-transparent hover:border-brand-gray-200'
    }`;

  const getFieldError = (field: keyof GuestFormData): string | undefined => {
    return errors[field]?.message;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-lg font-bold text-brand-black mb-4">معلومات التواصل</h2>
        <p className="text-sm text-brand-gray-500 mb-6">أدخل معلوماتك لمتابعة الطلب كضيف</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
              الاسم الأول <span className="text-brand-gold">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('firstName')}
                placeholder="محمد"
                className={inputClasses('firstName', !!errors.firstName)}
                disabled={isSubmitting}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray-300" />
            </div>
            <AnimatePresence>
              {getFieldError('firstName') && (
                <motion.p
                  initial={{opacity: 0, y: -5}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -5}}
                  className="text-xs text-red-500 mt-1 flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('firstName')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
              الاسم الأخير <span className="text-brand-gold">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('lastName')}
                placeholder="العبدالله"
                className={inputClasses('lastName', !!errors.lastName)}
                disabled={isSubmitting}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray-300" />
            </div>
            <AnimatePresence>
              {getFieldError('lastName') && (
                <motion.p
                  initial={{opacity: 0, y: -5}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -5}}
                  className="text-xs text-red-500 mt-1 flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('lastName')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
            البريد الإلكتروني <span className="text-brand-gold">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              {...register('email')}
              placeholder="your@email.com"
              className={inputClasses('email', !!errors.email)}
              dir="ltr"
              disabled={isSubmitting}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray-300" />
          </div>
          <AnimatePresence>
            {getFieldError('email') && (
              <motion.p
                initial={{opacity: 0, y: -5}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -5}}
                className="text-xs text-red-500 mt-1 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {getFieldError('email')}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="text-xs text-brand-gray-500 mt-1">سيتم إرسال تأكيد الطلب إلى هذا البريد</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
            تأكيد البريد الإلكتروني <span className="text-brand-gold">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              {...register('confirmEmail')}
              placeholder="your@email.com"
              className={`${inputClasses('confirmEmail', !!errors.confirmEmail)} ${
                touchedFields.confirmEmail && emailsMatch && !errors.confirmEmail
                  ? 'border-green-500'
                  : ''
              }`}
              dir="ltr"
              disabled={isSubmitting}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray-300" />
            {touchedFields.confirmEmail && emailsMatch && !errors.confirmEmail && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
            )}
          </div>
          <AnimatePresence>
            {getFieldError('confirmEmail') && (
              <motion.p
                initial={{opacity: 0, y: -5}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -5}}
                className="text-xs text-red-500 mt-1 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {getFieldError('confirmEmail')}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
            رقم الهاتف <span className="text-brand-gold">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              {...register('phone')}
              placeholder="+965 XXXX XXXX"
              className={inputClasses('phone', !!errors.phone)}
              dir="ltr"
              disabled={isSubmitting}
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray-300" />
          </div>
          <AnimatePresence>
            {getFieldError('phone') && (
              <motion.p
                initial={{opacity: 0, y: -5}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -5}}
                className="text-xs text-red-500 mt-1 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {getFieldError('phone')}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-brand-gray-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('acceptTerms')}
            className="mt-1 h-4 w-4 text-brand-gold border-brand-gray-300 rounded focus:ring-brand-gold"
            disabled={isSubmitting}
          />
          <span className="text-sm text-brand-gray-600">
            أوافق على{' '}
            <a href="/terms" className="text-brand-gold hover:underline">
              الشروط والأحكام
            </a>{' '}
            و{' '}
            <a href="/privacy" className="text-brand-gold hover:underline">
              سياسة الخصوصية
            </a>
          </span>
        </label>
        <AnimatePresence>
          {errors.acceptTerms && (
            <motion.p
              initial={{opacity: 0, y: -5}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -5}}
              className="text-xs text-red-500 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.acceptTerms.message}
            </motion.p>
          )}
        </AnimatePresence>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('subscribeNewsletter')}
            className="mt-1 h-4 w-4 text-brand-gold border-brand-gray-300 rounded focus:ring-brand-gold"
            disabled={isSubmitting}
          />
          <span className="text-sm text-brand-gray-600">
            أرغب في تلقي العروض والتحديثات عبر البريد الإلكتروني
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-black text-white font-bold uppercase tracking-wider hover:bg-brand-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        {isSubmitting ? (
          <>
            <motion.div
              animate={{rotate: 360}}
              transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            جاري المتابعة...
          </>
        ) : (
          <>
            متابعة كضيف
            <Check className="h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}

export default GuestForm;
