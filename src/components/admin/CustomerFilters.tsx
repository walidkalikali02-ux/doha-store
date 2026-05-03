import {useState} from 'react';
import {Search, Filter, Download} from 'lucide-react';

interface CustomerFiltersProps {
  onFilterChange: (filters: CustomerFiltersData) => void;
  onExport: () => void;
}

interface CustomerFiltersData {
  segment: string;
  status: string;
  orderCount: string;
  search: string;
}

export function CustomerFilters({onFilterChange, onExport}: CustomerFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<CustomerFiltersData>({
    segment: '',
    status: '',
    orderCount: '',
    search: '',
  });

  const segmentOptions = [
    {value: '', label: 'All Segments'},
    {value: 'vip', label: 'VIP Customers'},
    {value: 'subscription', label: 'Subscribers'},
    {value: 'first-time', label: 'First-Time Buyers'},
    {value: 'returning', label: 'Returning Customers'},
  ];

  const statusOptions = [
    {value: '', label: 'All Status'},
    {value: 'active', label: 'Active'},
    {value: 'inactive', label: 'Inactive'},
    {value: 'churned', label: 'Churned'},
  ];

  const orderCountOptions = [
    {value: '', label: 'Any Order Count'},
    {value: '0', label: 'No orders'},
    {value: '1-5', label: '1-5 orders'},
    {value: '6-10', label: '6-10 orders'},
    {value: '10+', label: '10+ orders'},
  ];

  const handleChange = (key: keyof CustomerFiltersData, value: string) => {
    const newFilters = {...filters, [key]: value};
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: CustomerFiltersData = {segment: '', status: '', orderCount: '', search: ''};
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.segment || filters.status || filters.orderCount;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search customers by name, email, or ID..."
            value={filters.search}
            onChange={e => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
          />
        </div>

        <div className="flex gap-2">
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
                {[filters.segment, filters.status, filters.orderCount].filter(Boolean).length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
              <select
                value={filters.segment}
                onChange={e => handleChange('segment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              >
                {segmentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Count</label>
              <select
                value={filters.orderCount}
                onChange={e => handleChange('orderCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              >
                {orderCountOptions.map(option => (
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
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
