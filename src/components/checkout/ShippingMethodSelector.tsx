import {SHIPPING_METHOD_LABELS} from '@/utils/constants';
import type {ShippingMethod} from '@/types';

interface ShippingMethodSelectorProps {
  methods: ShippingMethod[];
  selected: ShippingMethod;
  onSelect: (method: ShippingMethod) => void;
}

export function ShippingMethodSelector({methods, selected, onSelect}: ShippingMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {methods.map(method => {
        const info = SHIPPING_METHOD_LABELS[method];
        return (
          <label
            key={method}
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
              selected === method
                ? 'border-amber-600 bg-amber-50'
                : 'border-stone-200 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shipping"
                value={method}
                checked={selected === method}
                onChange={() => onSelect(method)}
                className="text-amber-600 focus:ring-amber-500"
              />
              <div>
                <p className="font-medium">{info.name}</p>
                <p className="text-sm text-stone-500">{info.description}</p>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
