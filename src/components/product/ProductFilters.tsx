import {ROAST_LEVELS, ROAST_LEVEL_LABELS} from '@/utils/constants';
import type {ProductFilters as FilterType, RoastLevel} from '@/types';

interface ProductFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
}

export function ProductFilters({filters, onChange}: ProductFiltersProps) {
  const handleRoastChange = (roast: RoastLevel) => {
    if (filters.roastLevel === roast) {
      // Remove roastLevel from filters
      const {roastLevel: removed, ...rest} = filters;
      void removed; // explicitly unused
      onChange(rest);
    } else {
      onChange({...filters, roastLevel: roast});
    }
  };

  const handlePriceChange = (min: number, max: number) => {
    onChange({...filters, priceMin: min, priceMax: max});
  };

  const clearFilters = () => {
    onChange({});
  };

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-6 p-4 bg-stone-50 rounded-lg">
      {/* Roast Level Filter */}
      <div>
        <h4 className="font-medium text-stone-900 mb-3">Roast Level</h4>
        <div className="space-y-2">
          {ROAST_LEVELS.map(roast => (
            <label key={roast} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="roast"
                checked={filters.roastLevel === roast}
                onChange={() => handleRoastChange(roast)}
                className="text-amber-600 focus:ring-amber-500"
              />
              <span className="text-stone-700">{ROAST_LEVEL_LABELS[roast]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="font-medium text-stone-900 mb-3">Price Range</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={e => handlePriceChange(Number(e.target.value), filters.priceMax || 0)}
            className="w-full px-3 py-2 border border-stone-300 rounded-md"
          />
          <span className="self-center text-stone-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={e => handlePriceChange(filters.priceMin || 0, Number(e.target.value))}
            className="w-full px-3 py-2 border border-stone-300 rounded-md"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2 text-amber-600 hover:text-amber-700 font-medium"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
