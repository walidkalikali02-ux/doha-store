import {useState} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {MapPin, Plus, Trash2, Star, Check, Home, Briefcase} from 'lucide-react';
import {useSavedAddresses} from '@/hooks/useSavedAddresses';
import type {Address} from '@/services/address';
import {useToast} from '@/components/common';

interface SavedAddressesProps {
  onSelectAddress?: (address: Address) => void;
  selectedId?: string | undefined;
  showAddNew?: boolean;
  maxDisplay?: number;
}

const labelIcons: Record<string, React.ComponentType<{className?: string}>> = {
  home: Home,
  work: Briefcase,
};

export function SavedAddresses({
  onSelectAddress,
  selectedId,
  showAddNew = true,
  maxDisplay,
}: SavedAddressesProps) {
  const {addresses, isLoading, deleteAddress, setDefaultAddress} = useSavedAddresses();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToast();

  const displayAddresses = maxDisplay ? addresses.slice(0, maxDisplay) : addresses;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAddress.mutateAsync(id);
      toast.success('تم حذف العنوان', 'تم حذف العنوان بنجاح');
    } catch (error) {
      toast.error('خطأ', 'فشل في حذف العنوان');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress.mutateAsync(id);
      toast.success('تم التحديث', 'تم تعيين العنوان الافتراضي');
    } catch (error) {
      toast.error('خطأ', 'فشل في تعيين العنوان الافتراضي');
    }
  };

  const getLabelIcon = (label?: string) => {
    if (!label) return MapPin;
    const lowerLabel = label.toLowerCase();
    return labelIcons[lowerLabel] || MapPin;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse bg-stone-100 rounded-lg h-32" />
        ))}
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-stone-50 rounded-lg border-2 border-dashed border-stone-200">
        <MapPin className="w-12 h-12 mx-auto text-stone-300 mb-3" />
        <p className="text-stone-600 text-sm mb-4">لا توجد عناوين محفوظة</p>
        {showAddNew && (
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة عنوان جديد
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {displayAddresses.map(address => {
          const isSelected = selectedId === address.id;
          const isDefault = address.isDefault;
          const LabelIcon = getLabelIcon(address.label);
          const isDeleting = deletingId === address.id;

          return (
            <motion.div
              key={address.id}
              layout
              initial={{opacity: 0, y: 10}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, scale: 0.95}}
              className={`relative bg-white rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-amber-500 shadow-md'
                  : 'border-stone-200 hover:border-amber-300'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectAddress?.(address)}
                className="w-full text-right p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isDefault ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      <LabelIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-stone-900">
                          {address.firstName} {address.lastName}
                        </span>
                        {isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                            الافتراضي
                          </span>
                        )}
                      </div>

                      {address.label && (
                        <span className="text-xs text-stone-500 block mb-1">{address.label}</span>
                      )}

                      <p className="text-sm text-stone-600 line-clamp-2">
                        {address.street1}
                        {address.street2 && `, ${address.street2}`}
                      </p>
                      <p className="text-sm text-stone-600">
                        {address.city}
                        {address.state && `, ${address.state}`}
                        {address.postalCode && ` ${address.postalCode}`}
                      </p>
                      <p className="text-sm text-stone-500">{address.country}</p>

                      {address.phone && (
                        <p className="text-xs text-stone-500 mt-1" dir="ltr">
                          {address.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>

              <div className="flex items-center justify-end gap-2 px-4 pb-3 pt-0">
                {!isDefault && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleSetDefault(address.id);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-stone-500 hover:text-amber-600 transition-colors"
                    title="تعيين كافتراضي"
                  >
                    <Star className="w-3.5 h-3.5" />
                    افتراضي
                  </button>
                )}

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(address.id);
                  }}
                  disabled={isDeleting}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-stone-500 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="حذف العنوان"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleting ? 'جاري الحذف...' : 'حذف'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {showAddNew && (
        <motion.button
          type="button"
          whileHover={{scale: 1.01}}
          whileTap={{scale: 0.99}}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-stone-200 rounded-lg text-stone-500 hover:border-amber-300 hover:text-amber-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة عنوان جديد
        </motion.button>
      )}
    </div>
  );
}
