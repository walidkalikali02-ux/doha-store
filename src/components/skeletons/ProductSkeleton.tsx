import {motion} from 'motion/react';
import {Skeleton} from './Skeleton';
import {cn} from '@/utils/helpers';

interface ProductSkeletonProps {
  className?: string;
  showRating?: boolean;
  showPrice?: boolean;
  showButton?: boolean;
  variant?: 'card' | 'list' | 'compact';
}

export function ProductSkeleton({
  className,
  showRating = true,
  showPrice = true,
  showButton = true,
  variant = 'card',
}: ProductSkeletonProps) {
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        className={cn('flex gap-3 p-3 bg-white rounded-lg', className)}
      >
        <Skeleton variant="rounded" className="w-20 h-20 flex-shrink-0" animation="wave" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" animation="wave" />
          <Skeleton className="h-3 w-1/2" animation="wave" />
          {showPrice && <Skeleton className="h-5 w-1/3" animation="wave" />}
        </div>
      </motion.div>
    );
  }

  if (variant === 'list') {
    return (
      <motion.div
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        className={cn('flex gap-6 p-4 bg-white rounded-lg', className)}
      >
        <Skeleton variant="rounded" className="w-48 h-48 flex-shrink-0" animation="wave" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-3/4" animation="wave" />
          <Skeleton className="h-4 w-1/2" animation="wave" />
          {showRating && (
            <div className="flex gap-1">
              {Array.from({length: 5}).map((_, i) => (
                <Skeleton key={i} variant="circular" className="w-4 h-4" />
              ))}
            </div>
          )}
          <Skeleton className="h-4 w-full" animation="wave" />
          <Skeleton className="h-4 w-2/3" animation="wave" />
          {showPrice && <Skeleton className="h-6 w-1/4" animation="wave" />}
          {showButton && <Skeleton className="h-10 w-32 mt-4" variant="rounded" animation="wave" />}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3}}
      className={cn('bg-white rounded-lg overflow-hidden', className)}
    >
      <div className="relative aspect-square">
        <Skeleton variant="rounded" className="w-full h-full" animation="wave" />
        <motion.div
          animate={{x: ['-100%', '100%']}}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear',
          }}
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
        />
      </div>

      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" animation="wave" />

        {showRating && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({length: 5}).map((_, i) => (
                <Skeleton key={i} variant="circular" className="w-3 h-3" />
              ))}
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        )}

        <Skeleton className="h-4 w-1/2" animation="wave" />

        {showPrice && (
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-6 w-24" animation="wave" />
            {showButton && <Skeleton className="h-9 w-28" variant="rounded" animation="wave" />}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ProductGridSkeleton({
  count = 8,
  columns = 4,
  className,
}: {
  count?: number;
  columns?: number;
  className?: string;
}) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  };

  return (
    <div
      className={cn(
        'grid gap-6',
        gridCols[columns as keyof typeof gridCols] || gridCols[4],
        className
      )}
    >
      {Array.from({length: count}).map((_, i) => (
        <motion.div
          key={i}
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: i * 0.05}}
        >
          <ProductSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

export function ProductDetailSkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      className={cn('grid grid-cols-1 lg:grid-cols-2 gap-8', className)}
    >
      <div className="space-y-4">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-stone-200">
          <motion.div
            animate={{x: ['-100%', '100%']}}
            transition={{repeat: Infinity, duration: 2, ease: 'linear'}}
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </div>
        <div className="flex gap-2">
          {Array.from({length: 4}).map((_, i) => (
            <Skeleton key={i} variant="rounded" className="w-20 h-20" />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" animation="wave" />
          <Skeleton className="h-4 w-1/2" animation="wave" />
        </div>

        <div className="flex gap-2">
          {Array.from({length: 5}).map((_, i) => (
            <Skeleton key={i} variant="circular" className="w-5 h-5" />
          ))}
          <Skeleton className="h-4 w-16" />
        </div>

        <Skeleton className="h-8 w-32" animation="wave" />

        <div className="space-y-3">
          <Skeleton className="h-4 w-full" animation="wave" />
          <Skeleton className="h-4 w-full" animation="wave" />
          <Skeleton className="h-4 w-2/3" animation="wave" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-12 w-full" variant="rounded" animation="wave" />
          <Skeleton className="h-12 w-full" variant="rounded" animation="wave" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-12 w-40" variant="rounded" animation="wave" />
          <Skeleton className="h-12 flex-1" variant="rounded" animation="wave" />
        </div>
      </div>
    </motion.div>
  );
}
