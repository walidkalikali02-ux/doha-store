import {motion} from 'motion/react';
import {cn} from '@/utils/helpers';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseStyles = 'bg-stone-200 dark:bg-stone-700';

  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], animations[animation], className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

export function TextSkeleton({lines = 3, className}: {lines?: number; className?: string}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({length: lines}).map((_, i) => (
        <motion.div
          key={i}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{delay: i * 0.1}}
        >
          <Skeleton
            variant="text"
            className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function ProductImageSkeleton({className}: {className?: string}) {
  return (
    <motion.div
      initial={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      className={cn(
        'relative aspect-square w-full overflow-hidden rounded-lg bg-stone-200',
        className
      )}
    >
      <motion.div
        animate={{x: ['-100%', '100%']}}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
    </motion.div>
  );
}
