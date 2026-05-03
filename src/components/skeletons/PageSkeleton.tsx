import {motion} from 'motion/react';
import {Skeleton} from './Skeleton';
import {cn} from '@/utils/helpers';

interface PageSkeletonProps {
  className?: string;
  variant?: 'default' | 'product' | 'checkout' | 'account' | 'admin';
}

export function PageSkeleton({className, variant = 'default'}: PageSkeletonProps) {
  if (variant === 'product') {
    return <ProductPageSkeleton className={className ?? ''} />;
  }

  if (variant === 'checkout') {
    return <CheckoutPageSkeleton className={className ?? ''} />;
  }

  if (variant === 'account') {
    return <AccountPageSkeleton className={className ?? ''} />;
  }

  if (variant === 'admin') {
    return <AdminPageSkeleton className={className ?? ''} />;
  }

  return <DefaultPageSkeleton className={className ?? ''} />;
}

function DefaultPageSkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={cn('min-h-screen bg-white py-24', className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          className="text-center mb-16"
        >
          <Skeleton className="h-4 w-24 mx-auto mb-4" animation="wave" />
          <Skeleton className="h-10 w-64 mx-auto mb-6" animation="wave" />
          <Skeleton className="h-1 w-16 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({length: 6}).map((_, i) => (
            <motion.div
              key={i}
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: i * 0.1}}
              className="bg-white rounded-lg overflow-hidden"
            >
              <Skeleton variant="rounded" className="w-full aspect-square" animation="wave" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" animation="wave" />
                <Skeleton className="h-4 w-1/2" animation="wave" />
                <Skeleton className="h-6 w-1/3" animation="wave" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ProductPageSkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={cn('min-h-screen bg-white py-24', className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            className="space-y-4"
          >
            <Skeleton variant="rounded" className="w-full aspect-square" animation="wave" />
            <div className="flex gap-2">
              {Array.from({length: 4}).map((_, i) => (
                <Skeleton key={i} variant="rounded" className="w-20 h-20" />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            className="space-y-6"
          >
            <Skeleton className="h-8 w-3/4" animation="wave" />
            <Skeleton className="h-4 w-1/2" animation="wave" />

            <div className="flex gap-1">
              {Array.from({length: 5}).map((_, i) => (
                <Skeleton key={i} variant="circular" className="w-5 h-5" />
              ))}
            </div>

            <Skeleton className="h-8 w-32" animation="wave" />

            <div className="space-y-3">
              <Skeleton className="h-4 w-full" animation="wave" />
              <Skeleton className="h-4 w-full" animation="wave" />
              <Skeleton className="h-4 w-2/3" animation="wave" />
            </div>

            <Skeleton className="h-12 w-full" variant="rounded" animation="wave" />
            <Skeleton className="h-12 w-full" variant="rounded" animation="wave" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function CheckoutPageSkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={cn('min-h-screen bg-brand-gray-50', className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            className="lg:col-span-7 space-y-8"
          >
            <div className="bg-white p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton variant="rounded" className="w-10 h-10" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" animation="wave" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-10 w-full" variant="rounded" animation="wave" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-full" variant="rounded" animation="wave" />
                </div>
              </div>
            </div>

            <Skeleton className="h-12 w-full" variant="rounded" animation="wave" />
          </motion.div>

          <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            className="lg:col-span-5"
          >
            <div className="bg-white rounded-lg p-6 space-y-4 sticky top-24">
              <Skeleton className="h-6 w-32" animation="wave" />

              <div className="space-y-4">
                {Array.from({length: 2}).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton variant="rounded" className="w-16 h-16" animation="wave" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" animation="wave" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-4 w-16" animation="wave" />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-200 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-14" />
                </div>
              </div>

              <Skeleton className="h-12 w-full" variant="rounded" animation="wave" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function AccountPageSkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={cn('min-h-screen bg-brand-gray-50 py-8', className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg p-6 space-y-4">
              <Skeleton variant="circular" className="w-20 h-20 mx-auto" animation="wave" />
              <Skeleton className="h-5 w-32 mx-auto" animation="wave" />
              <Skeleton className="h-3 w-40 mx-auto" />
              <div className="pt-4 space-y-2">
                {Array.from({length: 5}).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" variant="rounded" />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, x: 20}}
            animate={{opacity: 1, x: 0}}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-lg p-6 space-y-6">
              <Skeleton className="h-6 w-40" animation="wave" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({length: 4}).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full" variant="rounded" animation="wave" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-12 w-32" variant="rounded" animation="wave" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function AdminPageSkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={cn('min-h-screen bg-brand-gray-100', className)}
    >
      <div className="flex">
        <motion.div
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          className="w-64 bg-brand-black min-h-screen p-4"
        >
          <Skeleton className="h-8 w-32 mb-8" animation="wave" />
          <div className="space-y-2">
            {Array.from({length: 6}).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" variant="rounded" />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          className="flex-1 p-8"
        >
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" animation="wave" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({length: 4}).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-32" animation="wave" />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-4" animation="wave" />
            <div className="space-y-3">
              {Array.from({length: 5}).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" variant="rounded" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
