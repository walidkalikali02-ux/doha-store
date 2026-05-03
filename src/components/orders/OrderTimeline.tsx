import {motion} from 'motion/react';
import {Check, Package, Truck, MapPin, Home, Clock} from 'lucide-react';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'roasting'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered';

export interface TimelineStep {
  id: number;
  label: string;
  labelEn: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  description?: string;
}

interface OrderTimelineProps {
  steps: TimelineStep[];
  currentStatus: OrderStatus;
}

const statusIcons: Record<string, React.ComponentType<{className?: string}>> = {
  pending: Clock,
  processing: Package,
  roasting: Package,
  shipped: Truck,
  out_for_delivery: MapPin,
  delivered: Home,
};

const defaultSteps: TimelineStep[] = [
  {id: 1, label: 'تم تأكيد الطلب', labelEn: 'Order Confirmed', status: 'pending'},
  {id: 2, label: 'قيد التحضير', labelEn: 'Processing', status: 'pending'},
  {id: 3, label: 'قيد التحميص', labelEn: 'Roasting', status: 'pending'},
  {id: 4, label: 'تم الشحن', labelEn: 'Shipped', status: 'pending'},
  {id: 5, label: 'خارج للتوصيل', labelEn: 'Out for Delivery', status: 'pending'},
  {id: 6, label: 'تم التسليم', labelEn: 'Delivered', status: 'pending'},
];

function getStatusIndex(status: OrderStatus): number {
  const statusOrder: OrderStatus[] = [
    'pending',
    'processing',
    'roasting',
    'shipped',
    'out_for_delivery',
    'delivered',
  ];
  return statusOrder.indexOf(status);
}

export function OrderTimeline({steps, currentStatus}: OrderTimelineProps) {
  const currentIndex = Math.max(0, getStatusIndex(currentStatus));

  const timelineSteps = steps.length > 0 ? steps : defaultSteps;

  const processedSteps = timelineSteps.map((step, index) => {
    if (index < currentIndex) {
      return {...step, status: 'completed' as const};
    } else if (index === currentIndex) {
      return {...step, status: 'current' as const};
    }
    return {...step, status: 'pending' as const};
  });

  return (
    <div className="w-full">
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-stone-200" />

        {/* Progress bar fill */}
        <motion.div
          className="absolute top-6 left-0 h-0.5 bg-amber-500"
          initial={{width: 0}}
          animate={{
            width: `${(currentIndex / (processedSteps.length - 1)) * 100}%`,
          }}
          transition={{duration: 0.8, ease: 'easeOut'}}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {processedSteps.map((step, index) => {
            const statusKeys: (keyof typeof statusIcons)[] = Object.keys(
              statusIcons
            ) as (keyof typeof statusIcons)[];
            const iconKey = index < statusKeys.length ? statusKeys[index] : 'pending';
            const Icon = statusIcons[iconKey] ?? Package;
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';

            return (
              <motion.div
                key={step.id}
                initial={{opacity: 0, y: 10}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.1}}
                className="flex flex-col items-center flex-1"
              >
                {/* Icon container */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isCompleted
                      ? 'bg-amber-500 text-white'
                      : isCurrent
                        ? 'bg-amber-100 text-amber-600 border-2 border-amber-500'
                        : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                </div>

                {/* Step label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted || isCurrent ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      isCompleted || isCurrent ? 'text-stone-500' : 'text-stone-300'
                    }`}
                  >
                    {step.labelEn}
                  </p>
                  {step.date && (
                    <p
                      className={`text-xs mt-1 ${
                        isCompleted || isCurrent ? 'text-amber-600' : 'text-stone-300'
                      }`}
                    >
                      {step.date}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
