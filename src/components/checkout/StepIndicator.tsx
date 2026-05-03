import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import {Truck, CreditCard, CheckCircle} from 'lucide-react';

interface Step {
  label: string;
  labelEn: string;
  path: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  {label: 'الشحن', labelEn: 'Shipping', path: 'shipping', icon: Truck},
  {label: 'الدفع', labelEn: 'Payment', path: 'payment', icon: CreditCard},
  {label: 'المراجعة', labelEn: 'Review', path: 'review', icon: CheckCircle},
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({currentStep}: StepIndicatorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-brand-gray-200 -z-10" />

        {/* Progress Line Fill */}
        <motion.div
          className="absolute top-5 left-0 h-0.5 bg-brand-gold -z-10"
          initial={{width: '0%'}}
          animate={{width: `${(currentStep / (steps.length - 1)) * 100}%`}}
          transition={{duration: 0.5, ease: 'easeInOut'}}
        />

        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.path} className="flex flex-col items-center">
              <Link
                to={isCompleted ? `/checkout/${step.path}` : '#'}
                className={`flex flex-col items-center ${
                  isCompleted ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isActive ? '#c6a355' : isCompleted ? '#000000' : '#f2f2f2',
                  }}
                  className={`w-10 h-10 flex items-center justify-center transition-colors duration-300 ${
                    isActive || isCompleted ? 'text-white' : 'text-brand-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </motion.div>
                <span
                  className={`mt-3 text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                    isActive
                      ? 'text-brand-gold'
                      : isCompleted
                        ? 'text-brand-black'
                        : 'text-brand-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-brand-gray-400">{step.labelEn}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
