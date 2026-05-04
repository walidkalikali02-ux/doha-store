import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useNavigate} from 'react-router-dom';
import {
  ChevronLeft,
  Truck,
  Clock,
  Zap,
  MapPin,
  Package,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';
import {useEffect, useState, useMemo} from 'react';
import {useToast} from '@/components/common';
import {useCheckoutActions, useCartSummary} from '@/stores';
import {addressSchema, shippingMethodSchema, type ShippingMethod} from '@/schemas';
import {analytics} from '@/lib/analytics';
import {AddressAutocomplete} from '@/components/checkout/AddressAutocomplete';
import {SavedAddresses} from '@/components/checkout/SavedAddresses';
import {useShippingMethods, getCheapestMethod} from '@/hooks/useShippingMethods';
import type {Address} from '@/types';
import type {Address as SavedAddress} from '@/services/address';
import {z} from 'zod';

const SHIPPING_OPTIONS: Array<{
  id: ShippingMethod;
  name: string;
  nameEn: string;
  time: string;
  timeEn: string;
  price: number;
  icon: React.ComponentType<{className?: string}>;
  description: string;
  descriptionEn: string;
}> = [
  {
    id: 'standard',
    name: 'الشحن القياسي',
    nameEn: 'Standard Shipping',
    time: '٥-٧ أيام عمل',
    timeEn: '5-7 business days',
    price: 0,
    icon: Truck,
    description: 'توصيل موثوق لجميع المناطق',
    descriptionEn: 'Reliable delivery to all areas',
  },
  {
    id: 'express',
    name: 'الشحن السريع',
    nameEn: 'Express Shipping',
    time: '٢-٣ أيام عمل',
    timeEn: '2-3 business days',
    price: 1250,
    icon: Clock,
    description: 'أسرع توصيل للطلبات المستعجلة',
    descriptionEn: 'Faster delivery for urgent orders',
  },
  {
    id: 'overnight',
    name: 'الشحن الليلي',
    nameEn: 'Overnight Shipping',
    time: 'اليوم التالي',
    timeEn: 'Next day',
    price: 2500,
    icon: Zap,
    description: 'أولوية قصوى في التوصيل',
    descriptionEn: 'Top priority delivery service',
  },
];

const shippingFormSchema = z.object({
  address: addressSchema,
  shippingMethod: shippingMethodSchema,
});

type ShippingFormData = z.infer<typeof shippingFormSchema>;

interface CartItem {
  id: string;
  name: string;
  nameEn: string;
  quantity: number;
  price: number;
  image: string;
}

const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: '1',
    name: 'بياك إثيوبيا يرجاتشيف',
    nameEn: 'Ethiopia Yirgacheffe',
    quantity: 1,
    price: 2200,
    image: '/images/coffee-1.jpg',
  },
  {
    id: '2',
    name: 'كولومبيا هويلا',
    nameEn: 'Colombia Huila',
    quantity: 1,
    price: 1800,
    image: '/images/coffee-2.jpg',
  },
];

export function Shipping() {
  const navigate = useNavigate();
  const toast = useToast();
  const {setShipping} = useCheckoutActions();
  const [showSavedAddresses, setShowSavedAddresses] = useState(true);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | undefined>();

  useEffect(() => {
    analytics.trackPageView({
      pageName: 'checkout_shipping',
      pageCategory: 'checkout',
    });
    analytics.trackCheckoutStep(1, {
      shippingMethod: 'standard',
      totalAmount: 0,
      itemCount: 0,
    });
    analytics.trackCheckoutStart({
      itemCount: 0,
      products: [],
    });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: {errors, isSubmitting, touchedFields},
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      address: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street1: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'الكويت',
        countryCode: 'KW',
      },
      shippingMethod: 'standard',
    },
    mode: 'onBlur',
  });

  const watchAddress = watch('address');
  const selectedMethod = watch('shippingMethod');

  const cartItems = useMemo(
    () => [
      {productId: '1', quantity: 1, price: 2200, weight: 0.5},
      {productId: '2', quantity: 1, price: 1800, weight: 0.5},
    ],
    []
  );

  const {data: shippingMethodsData, isLoading: isLoadingMethods} = useShippingMethods({
    address: {city: watchAddress.city, area: watchAddress.state, country: watchAddress.country},
    cartItems,
    enabled: !!watchAddress.city,
  });

  useEffect(() => {
    if (shippingMethodsData && shippingMethodsData.length > 0) {
      const cheapest = getCheapestMethod(shippingMethodsData);
      if (cheapest) {
        setValue('shippingMethod', cheapest.method as ShippingMethod);
      }
    }
  }, [shippingMethodsData, setValue]);

  const selectedMethodData = shippingMethodsData?.find(m => m.method === selectedMethod);
  const shippingCost = selectedMethodData?.cost ?? SHIPPING_OPTIONS.find(s => s.id === selectedMethod)?.price ?? 0;

  const {subtotal, total, itemCount} = useCartSummary();
  const totalItems = itemCount;

  const handleShippingMethodChange = (method: ShippingMethod) => {
    setValue('shippingMethod', method);
    const option = SHIPPING_OPTIONS.find(s => s.id === method);
    if (option) {
      analytics.trackShippingSelected(method, option.price);
    }
  };

  const handleAddressSelect = (address: Partial<Address>) => {
    if (address.address1) {
      setValue('address.street1', address.address1, {shouldValidate: true});
    }
    if (address.city) {
      setValue('address.city', address.city, {shouldValidate: true});
    }
    if (address.state) {
      setValue('address.state', address.state);
    }
    if (address.postalCode) {
      setValue('address.postalCode', address.postalCode);
    }
    if (address.country) {
      setValue('address.country', address.country, {shouldValidate: true});
    }
  };

  const handleSavedAddressSelect = (address: SavedAddress) => {
    setSelectedSavedAddressId(address.id);
    setValue('address.firstName', address.firstName, {shouldValidate: true});
    setValue('address.lastName', address.lastName, {shouldValidate: true});
    setValue('address.street1', address.street1, {shouldValidate: true});
    if (address.street2) {
      setValue('address.street2', address.street2);
    }
    setValue('address.city', address.city, {shouldValidate: true});
    if (address.state) {
      setValue('address.state', address.state);
    }
    if (address.postalCode) {
      setValue('address.postalCode', address.postalCode);
    }
    setValue('address.country', address.country, {shouldValidate: true});
    if (address.phone) {
      setValue('address.phone', address.phone);
    }
    setShowSavedAddresses(false);
    toast.success('تم تحميل العنوان', 'يمكنك تعديل البيانات إذا أردت');
  };

  const onSubmit = async (data: ShippingFormData) => {
    try {
      const address = {
        firstName: data.address.firstName,
        lastName: data.address.lastName,
        address1: data.address.street1,
        city: data.address.city,
        state: data.address.state || '',
        postalCode: data.address.postalCode || '',
        country: data.address.country,
        phone: data.address.phone,
        ...(data.address.street2 ? {address2: data.address.street2} : {}),
      };

      analytics.trackCheckoutStep(1, {
        shippingMethod: data.shippingMethod,
        totalAmount: total,
        itemCount: totalItems,
      });

      analytics.trackShippingSelected(data.shippingMethod, shippingCost);

      setShipping({
        address,
        shippingMethod: data.shippingMethod,
        email: data.address.email,
        phone: data.address.phone,
      });

      toast.success('تم حفظ بيانات الشحن', 'جاري الانتقال لصفحة الدفع...');
      navigate('/checkout/payment');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      analytics.trackError({
        errorType: 'shipping_submit_error',
        errorMessage,
        step: 1,
      });
      toast.error('خطأ في الحفظ', 'يرجى المحاولة مرة أخرى');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-KW', {
      style: 'currency',
      currency: 'QAR',
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  const getFieldError = (field: string): string | undefined => {
    const addressErrors = errors.address as {[key: string]: {message?: string}} | undefined;
    return addressErrors?.[field]?.message;
  };

  const inputClasses = (field: string, hasError: boolean) =>
    `w-full px-4 py-3.5 bg-brand-gray-50 border-2 rounded-none transition-all duration-300 outline-none text-right dir-ltr ${
      hasError
        ? 'border-red-500 bg-red-50'
        : (touchedFields.address as {[key: string]: boolean} | undefined)?.[field]
          ? 'border-brand-gold bg-white'
          : 'border-transparent hover:border-brand-gray-200'
    }`;

  return (
    <div className="min-h-screen bg-brand-gray-50">
      <motion.div
        initial={{opacity: 0, y: -20}}
        animate={{opacity: 1, y: 0}}
        className="bg-white border-b border-brand-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 text-brand-gray-500 hover:text-brand-black transition-colors group"
            >
              <ChevronRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">العودة للسلة</span>
            </button>

            <div className="flex items-center gap-1">
              <span className="section-subtitle !mb-0 !text-[8px]">الخطوة ١ من ٣</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.5}}
            className="lg:col-span-7 order-2 lg:order-1"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Contact Information Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-black text-white flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brand-black">معلومات التواصل</h2>
                    <p className="text-xs text-brand-gray-500">Contact Information</p>
                  </div>
                </div>

                <div className="space-y-4 bg-white p-6 shadow-premium">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
                        البريد الإلكتروني <span className="text-brand-gold">*</span>
                      </label>
                      <input
                        type="email"
                        {...register('address.email')}
                        placeholder="your@email.com"
                        className={inputClasses('email', !!getFieldError('email'))}
                        dir="ltr"
                      />
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
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
                        رقم الجوال <span className="text-brand-gold">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register('address.phone')}
                        placeholder="+965 XXXX XXXX"
                        className={inputClasses('phone', !!getFieldError('phone'))}
                        dir="ltr"
                      />
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
                </div>
              </section>

              {/* Shipping Address Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-black text-white flex items-center justify-center">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-brand-black">عنوان الشحن</h2>
                    <p className="text-xs text-brand-gray-500">Shipping Address</p>
                  </div>
                </div>

                <div className="space-y-4 bg-white p-6 shadow-premium">
                  {/* Toggle between saved addresses and manual entry */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowSavedAddresses(true)}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                        showSavedAddresses
                          ? 'bg-brand-black text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      العناوين المحفوظة
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSavedAddresses(false)}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                        !showSavedAddresses
                          ? 'bg-brand-black text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      عنوان جديد
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {showSavedAddresses ? (
                      <motion.div
                        key="saved"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        className="mb-4"
                      >
                        <SavedAddresses
                          onSelectAddress={handleSavedAddressSelect}
                          selectedId={selectedSavedAddressId}
                          showAddNew={false}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSavedAddresses(false)}
                          className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-sm text-brand-gold hover:text-brand-black transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة عنوان جديد
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="manual"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                      >
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
                            البحث عن عنوان
                          </label>
                          <AddressAutocomplete
                            onSelect={handleAddressSelect}
                            onError={error => toast.error('خطأ', error)}
                            className="w-full"
                          />
                          <p className="text-xs text-brand-gray-500 mt-2 text-right">
                            أو أدخل العنوان يدوياً أدناه
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
                              الاسم الأول <span className="text-brand-gold">*</span>
                            </label>
                            <input
                              type="text"
                              {...register('address.firstName')}
                              placeholder="محمد"
                              className={inputClasses('firstName', !!getFieldError('firstName'))}
                            />
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
                            <input
                              type="text"
                              {...register('address.lastName')}
                              placeholder="العبدالله"
                              className={inputClasses('lastName', !!getFieldError('lastName'))}
                            />
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

                        <div className="mt-4">
                          <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
                            العنوان <span className="text-brand-gold">*</span>
                          </label>
                          <input
                            type="text"
                            {...register('address.street1')}
                            placeholder="شارع، منطقة، رقم المبنى"
                            className={inputClasses('street1', !!getFieldError('street1'))}
                          />
                          <AnimatePresence>
                            {getFieldError('street1') && (
                              <motion.p
                                initial={{opacity: 0, y: -5}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -5}}
                                className="text-xs text-red-500 mt-1 flex items-center gap-1"
                              >
                                <AlertCircle className="h-3 w-3" />
                                {getFieldError('street1')}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="mt-4">
                          <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
                            العنوان - سطر إضافي
                          </label>
                          <input
                            type="text"
                            {...register('address.street2')}
                            placeholder="شقة، مكتب، إلخ (اختياري)"
                            className={inputClasses('street2', false)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
                              المدينة <span className="text-brand-gold">*</span>
                            </label>
                            <input
                              type="text"
                              {...register('address.city')}
                              placeholder="الكويت"
                              className={inputClasses('city', !!getFieldError('city'))}
                            />
                            <AnimatePresence>
                              {getFieldError('city') && (
                                <motion.p
                                  initial={{opacity: 0, y: -5}}
                                  animate={{opacity: 1, y: 0}}
                                  exit={{opacity: 0, y: -5}}
                                  className="text-xs text-red-500 mt-1 flex items-center gap-1"
                                >
                                  <AlertCircle className="h-3 w-3" />
                                  {getFieldError('city')}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
                              المنطقة
                            </label>
                            <input
                              type="text"
                              {...register('address.state')}
                              placeholder="الفروانية"
                              className={inputClasses('state', false)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
                              الرمز البريدي
                            </label>
                            <input
                              type="text"
                              {...register('address.postalCode')}
                              placeholder="00000"
                              className={inputClasses('postalCode', !!getFieldError('postalCode'))}
                              dir="ltr"
                            />
                            <AnimatePresence>
                              {getFieldError('postalCode') && (
                                <motion.p
                                  initial={{opacity: 0, y: -5}}
                                  animate={{opacity: 1, y: 0}}
                                  exit={{opacity: 0, y: -5}}
                                  className="text-xs text-red-500 mt-1 flex items-center gap-1"
                                >
                                  <AlertCircle className="h-3 w-3" />
                                  {getFieldError('postalCode')}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-brand-black uppercase tracking-wider mb-2">
                              الدولة <span className="text-brand-gold">*</span>
                            </label>
                            <input
                              type="text"
                              {...register('address.country')}
                              placeholder="الكويت"
                              className={inputClasses('country', !!getFieldError('country'))}
                            />
                            <AnimatePresence>
                              {getFieldError('country') && (
                                <motion.p
                                  initial={{opacity: 0, y: -5}}
                                  animate={{opacity: 1, y: 0}}
                                  exit={{opacity: 0, y: -5}}
                                  className="text-xs text-red-500 mt-1 flex items-center gap-1"
                                >
                                  <AlertCircle className="h-3 w-3" />
                                  {getFieldError('country')}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Shipping Method Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-black text-white flex items-center justify-center">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brand-black">طريقة الشحن</h2>
                    <p className="text-xs text-brand-gray-500">Shipping Method</p>
                  </div>
                </div>

                {isLoadingMethods ? (
                  <div className="flex items-center justify-center py-12 bg-white rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-gold" />
                    <span className="mr-3 text-brand-gray-500">جاري تحميل طرق الشحن...</span>
                  </div>
                ) : shippingMethodsData && shippingMethodsData.length > 0 ? (
                  <div className="space-y-3">
                    {shippingMethodsData.map((option, index) => {
                      const isSelected = selectedMethod === option.method;

                      const icons: Record<string, React.ComponentType<{className?: string}>> = {
                        standard: Truck,
                        express: Clock,
                        overnight: Zap,
                      };
                      const Icon = icons[option.method] || Truck;

                      return (
                        <motion.label
                          key={option.method}
                          initial={{opacity: 0, y: 10}}
                          animate={{opacity: 1, y: 0}}
                          transition={{delay: index * 0.1}}
                          className={`relative flex items-center gap-4 p-5 cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? 'bg-white shadow-premium border-l-4 border-l-brand-gold'
                              : 'bg-white/60 hover:bg-white border-l-4 border-l-transparent'
                          }`}
                        >
                          <input
                            type="radio"
                            {...register('shippingMethod')}
                            value={option.method}
                            checked={isSelected}
                            onChange={() => handleShippingMethodChange(option.method as ShippingMethod)}
                            className="sr-only"
                          />

                          <div
                            className={`w-12 h-12 flex items-center justify-center transition-colors duration-300 ${
                              isSelected
                                ? 'bg-brand-gold text-white'
                                : 'bg-brand-gray-100 text-brand-gray-500'
                            }`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-brand-black">{option.label}</span>
                              <span className="font-bold text-brand-black">
                                {option.cost === 0 ? (
                                  <span className="text-green-600">مجاني</span>
                                ) : (
                                  formatPrice(option.cost)
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-3 w-3 text-brand-gold" />
                              <span className="text-xs text-brand-gray-500">{option.estimatedDays}</span>
                            </div>
                          </div>

                          {isSelected && (
                            <motion.div
                              layoutId="shipping-check"
                              className="absolute left-4 top-1/2 -translate-y-1/2"
                            >
                              <div className="w-6 h-6 bg-brand-gold text-white flex items-center justify-center">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            </motion.div>
                          )}
                        </motion.label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-lg text-center text-brand-gray-500">
                    <p>لم يتم العثور على طرق شحن متاحة لهذا العنوان</p>
                  </div>
                )}

                <AnimatePresence>
                  {errors.shippingMethod && (
                    <motion.p
                      initial={{opacity: 0, y: -5}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -5}}
                      className="text-xs text-red-500 mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {errors.shippingMethod.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </section>

              {/* Mobile Submit Button */}
              <div className="lg:hidden">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{scale: 1.02}}
                  whileTap={{scale: 0.98}}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      جاري المعالجة...
                    </span>
                  ) : (
                    <>
                      متابعة الدفع
                      <ChevronLeft className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.5, delay: 0.2}}
            className="lg:col-span-5 order-1 lg:order-2"
          >
            <div className="bg-white shadow-premium lg:sticky lg:top-24">
              <div className="p-6 border-b border-brand-gray-100">
                <h2 className="text-lg font-bold text-brand-black">ملخص الطلب</h2>
                <p className="text-xs text-brand-gray-500">Order Summary</p>
              </div>

              <div className="p-6 border-b border-brand-gray-100">
                <div className="space-y-4">
                  {MOCK_CART_ITEMS.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-brand-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="h-6 w-6 text-brand-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-brand-black text-sm truncate">{item.name}</p>
                        <p className="text-xs text-brand-gray-500">{item.nameEn}</p>
                        <p className="text-xs text-brand-gray-500 mt-1">الكمية: {item.quantity}</p>
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-brand-black text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-500">المجموع الفرعي ({totalItems} منتج)</span>
                  <span className="font-medium text-brand-black">{formatPrice(subtotal)}</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedMethod}
                    initial={{opacity: 0, height: 0}}
                    animate={{opacity: 1, height: 'auto'}}
                    exit={{opacity: 0, height: 0}}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-brand-gray-500">الشحن</span>
                    <span
                      className={
                        shippingCost === 0
                          ? 'text-green-600 font-medium'
                          : 'font-medium text-brand-black'
                      }
                    >
                      {shippingCost === 0 ? 'مجاني' : formatPrice(shippingCost)}
                    </span>
                  </motion.div>
                </AnimatePresence>

                <div className="pt-4 border-t border-brand-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-brand-black">الإجمالي</span>
                      <p className="text-[10px] text-brand-gray-500 uppercase tracking-wider">
                        Total
                      </p>
                    </div>
                    <motion.span
                      key={total}
                      initial={{scale: 0.8, opacity: 0}}
                      animate={{scale: 1, opacity: 1}}
                      className="text-2xl font-black text-brand-black"
                    >
                      {formatPrice(total)}
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* Desktop Submit Button */}
              <div className="hidden lg:block p-6 pt-0">
                <motion.button
                  type="submit"
                  form="shipping-form"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  whileHover={{scale: 1.02}}
                  whileTap={{scale: 0.98}}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      جاري المعالجة...
                    </span>
                  ) : (
                    <>
                      متابعة الدفع
                      <ChevronLeft className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brand-gray-500">
                  <ShieldCheck className="h-4 w-4 text-brand-gold" />
                  <span>دفع آمن مشفّر 100%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Shipping;
