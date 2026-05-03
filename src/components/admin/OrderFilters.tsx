import {useState} from 'react';
import {Search, Filter, X} from 'lucide-react';

interface OrderFiltersProps {
  onFilterChange: (filters: OrderFilters) => void;
}

interface OrderFilters {
  status: string;
  dateRange: string;
  search: string;
}

export function OrderFilters({onFilterChange}: OrderFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    status: '',
    dateRange: '',
    search: '',
  });

  const statusOptions = [
    {value: '', label: 'All Statuses'},
    {value: 'pending', label: 'Pending'},
    {value: 'processing', label: 'Processing'},
    {value: 'roasting', label: 'Roasting'},
    {value: 'shipped', label: 'Shipped'},
    {value: 'delivered', label: 'Delivered'},
    {value: 'cancelled', label: 'Cancelled'},
    {value: 'refunded', label: 'Refunded'},
  ];

  const dateRangeOptions = [
    {value: '', label: 'All Time'},
    {value: 'today', label: 'Today'},
    {value: 'week', label: 'This Week'},
    {value: 'month', label: 'This Month'},
    {value: 'quarter', label: 'This Quarter'},
  ];

  const handleChange = (key: keyof OrderFilters, value: string) => {
    const newFilters = {...filters, [key]: value};
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: OrderFilters = {status: '', dateRange: '', search: ''};
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.status || filters.dateRange;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search orders by ID, customer, or email..."
            value={filters.search}
            onChange={e => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={e => handleChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors ${
              hasActiveFilters
                ? 'border-coffee-600 text-coffee-600 bg-coffee-50'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-coffee-600 text-white text-xs rounded-full px-1.5">
                {[filters.status, filters.dateRange].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={e => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={e => handleChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
