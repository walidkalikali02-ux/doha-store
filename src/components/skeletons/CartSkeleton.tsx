import {motion} from 'motion/react';
import {Skeleton} from './Skeleton';
import {cn} from '@/utils/helpers';

export function CartItemSkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0, x: -10}}
      animate={{opacity: 1, x: 0}}
      className={cn('flex gap-4 p-4 bg-white rounded-lg', className)}
    >
      <Skeleton variant="rounded" className="w-24 h-24 flex-shrink-0" animation="wave" />

      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" animation="wave" />
        <Skeleton className="h-4 w-1/2" animation="wave" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-28" animation="wave" />
          <Skeleton className="h-8 w-24" variant="rounded" animation="wave" />
        </div>
      </div>
    </motion.div>
  );
}

export function CartSkeleton({itemCount = 3, className}: {itemCount?: number; className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={cn('space-y-4', className)}
    >
      <div className="space-y-3">
        {Array.from({length: itemCount}).map((_, i) => (
          <motion.div
            key={i}
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: i * 0.1}}
          >
            <CartItemSkeleton />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: itemCount * 0.1}}
        className="bg-white rounded-lg p-6 space-y-4"
      >
        <Skeleton className="h-6 w-1/3" animation="wave" />

        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" animation="wave" />
            <Skeleton className="h-4 w-16" animation="wave" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" animation="wave" />
            <Skeleton className="h-4 w-12" animation="wave" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" animation="wave" />
            <Skeleton className="h-4 w-14" animation="wave" />
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-20" animation="wave" />
            <Skeleton className="h-8 w-24" animation="wave" />
          </div>
        </div>

        <Skeleton className="h-12 w-full" variant="rounded" animation="wave" />
      </motion.div>
    </motion.div>
  );
}

export function CartSummarySkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className={cn('bg-white rounded-lg p-6 space-y-4', className)}
    >
      <Skeleton className="h-6 w-1/3" animation="wave" />

      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>

      <div className="pt-4 border-t border-stone-200">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-28" animation="wave" />
        </div>
      </div>

      <Skeleton className="h-12 w-full" variant="rounded" animation="wave" />

      <div className="flex items-center justify-center gap-2 pt-2">
        <Skeleton className="w-4 h-4" variant="circular" />
        <Skeleton className="h-3 w-32" />
      </div>
    </motion.div>
  );
}

export function MiniCartSkeleton({
  itemCount = 2,
  className,
}: {
  itemCount?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{opacity: 0, y: -10}}
      animate={{opacity: 1, y: 0}}
      className={cn('p-4 space-y-4', className)}
    >
      {Array.from({length: itemCount}).map((_, i) => (
        <motion.div
          key={i}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: i * 0.05}}
          className="flex gap-3"
        >
          <Skeleton variant="rounded" className="w-16 h-16" animation="wave" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" animation="wave" />
            <Skeleton className="h-3 w-1/2" animation="wave" />
            <Skeleton className="h-4 w-1/4" animation="wave" />
          </div>
        </motion.div>
      ))}

      <div className="pt-4 border-t border-stone-200 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-full" variant="rounded" animation="wave" />
      </div>
    </motion.div>
  );
}
