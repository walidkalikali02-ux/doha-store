import {motion} from 'motion/react';
import {Skeleton} from './Skeleton';
import {cn} from '@/utils/helpers';

export function PaymentMethodSkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0, x: -10}}
      animate={{opacity: 1, x: 0}}
      className={cn('flex items-center gap-4 p-4 bg-white rounded-lg', className)}
    >
      <Skeleton variant="rounded" className="w-12 h-12" animation="wave" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" animation="wave" />
        <Skeleton className="h-3 w-24" animation="wave" />
      </div>
      <Skeleton variant="circular" className="w-5 h-5" />
    </motion.div>
  );
}

export function PaymentSkeleton({
  methodCount = 4,
  className,
}: {
  methodCount?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={cn('space-y-8', className)}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton variant="rounded" className="w-10 h-10" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" animation="wave" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <Skeleton variant="rounded" className="w-10 h-10" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" animation="wave" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            {Array.from({length: methodCount}).map((_, i) => (
              <motion.div
                key={i}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: i * 0.05}}
              >
                <PaymentMethodSkeleton />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.2}}
      >
        <OrderSummarySkeleton />
      </motion.div>
    </motion.div>
  );
}

export function OrderSummarySkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={cn('bg-white rounded-lg p-6 space-y-6', className)}
    >
      <div className="space-y-1">
        <Skeleton className="h-6 w-32" animation="wave" />
        <Skeleton className="h-3 w-28" />
      </div>

      <div className="space-y-4">
        {Array.from({length: 2}).map((_, i) => (
          <motion.div
            key={i}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: i * 0.1}}
            className="flex gap-4"
          >
            <Skeleton variant="rounded" className="w-16 h-16" animation="wave" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" animation="wave" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-16" animation="wave" />
          </motion.div>
        ))}
      </div>

      <div className="pt-4 border-t border-stone-200 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Skeleton className="h-5 w-16" animation="wave" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-8 w-24" animation="wave" />
          </div>
        </div>
      </div>

      <Skeleton className="h-12 w-full" variant="rounded" animation="wave" />

      <div className="flex items-center justify-center gap-2 pt-2">
        <Skeleton variant="circular" className="w-4 h-4" />
        <Skeleton className="h-3 w-28" />
      </div>
    </motion.div>
  );
}

export function ShippingFormSkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={cn('space-y-8', className)}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton variant="rounded" className="w-10 h-10" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-40" animation="wave" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" variant="rounded" animation="wave" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full" variant="rounded" animation="wave" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full" variant="rounded" animation="wave" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" variant="rounded" animation="wave" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton variant="rounded" className="w-10 h-10" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-28" animation="wave" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>

        {Array.from({length: 3}).map((_, i) => (
          <motion.div
            key={i}
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: i * 0.1}}
            className="flex items-center gap-4 p-4 bg-white rounded-lg"
          >
            <Skeleton variant="rounded" className="w-12 h-12" animation="wave" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" animation="wave" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton variant="circular" className="w-5 h-5" />
          </motion.div>
        ))}
      </div>

      <Skeleton className="h-12 w-full" variant="rounded" animation="wave" />
    </motion.div>
  );
}
