import {cn} from '@/utils/helpers';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({className, animate = true}: SkeletonProps) {
  return <div className={cn('bg-gray-200 rounded', animate && 'animate-pulse', className)} />;
}

export function TextSkeleton({lines = 1, className}: {lines?: number; className?: string}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({length: lines}).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function ImageSkeleton({className}: {className?: string}) {
  return <Skeleton className={cn('aspect-square w-full', className)} />;
}

export function AvatarSkeleton({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  return <Skeleton className={cn('rounded-full', sizes[size], className)} />;
}

export function ButtonSkeleton({className}: {className?: string}) {
  return <Skeleton className={cn('h-10 w-24 rounded-lg', className)} />;
}

export function CardSkeleton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}>
      {children || (
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}
    </div>
  );
}

export function ProductCardSkeleton({className}: {className?: string}) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({count = 12, className}: {count?: number; className?: string}) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className)}>
      {Array.from({length: count}).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderSkeleton({className}: {className?: string}) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}

export function ReviewSkeleton({className}: {className?: string}) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-start gap-4">
        <AvatarSkeleton size="md" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-16 w-16 rounded" />
            <Skeleton className="h-16 w-16 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      <div className="grid grid-cols-${columns} gap-4 p-4 bg-gray-50 border-b">
        {Array.from({length: columns}).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {Array.from({length: rows}).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className={cn('grid gap-4 p-4 border-b last:border-b-0', `grid-cols-${columns}`)}
        >
          {Array.from({length: columns}).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton({className}: {className?: string}) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({length: 4}).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton className="h-64" />
        <CardSkeleton className="h-64" />
      </div>
      <CardSkeleton className="h-48" />
    </div>
  );
}

export function CheckoutSkeleton({className}: {className?: string}) {
  return (
    <div className={cn('space-y-6', className)}>
      <CardSkeleton>
        <TextSkeleton lines={2} />
      </CardSkeleton>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="flex justify-between">
        <ButtonSkeleton />
        <ButtonSkeleton className="w-32" />
      </div>
    </div>
  );
}

export function ProfileSkeleton({className}: {className?: string}) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-4">
        <AvatarSkeleton size="lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <CardSkeleton>
        <TextSkeleton lines={4} />
      </CardSkeleton>
      <CardSkeleton>
        <TextSkeleton lines={3} />
      </CardSkeleton>
    </div>
  );
}

export function SubscriptionSkeleton({className}: {className?: string}) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mt-6 pt-4 border-t">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SearchResultsSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      {Array.from({length: count}).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200">
          <Skeleton className="h-24 w-24 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-10 w-24 self-center" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({fields = 4, className}: {fields?: number; className?: string}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({length: fields}).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="pt-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
