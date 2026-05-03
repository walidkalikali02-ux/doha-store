import {cn} from '@/utils/helpers';
import {Loader2} from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function LoadingSpinner({size = 'md', className}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-amber-600', sizes[size])} />
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

function Skeleton({className, variant = 'text'}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-stone-200';

  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  return <div className={cn(baseStyles, variants[variant], className)} />;
}

function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-lg border border-stone-200 p-4">
      <Skeleton variant="rectangular" className="h-48 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton variant="rectangular" className="h-10 w-24" />
      </div>
    </div>
  );
}

function SkeletonProductGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({length: 8}).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export {LoadingSpinner, Skeleton, SkeletonCard, SkeletonProductGrid};
export type {LoadingSpinnerProps, SkeletonProps};
