import {useState} from 'react';
import {Search, Filter, Plus, Download} from 'lucide-react';

interface ProductFiltersProps {
  onAddProduct: () => void;
  onFilterChange: (filters: ProductFiltersData) => void;
}

interface ProductFiltersData {
  category: string;
  status: string;
  stock: string;
  search: string;
}

export function ProductFilters({onAddProduct, onFilterChange}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFiltersData>({
    category: '',
    status: '',
    stock: '',
    search: '',
  });

  const categoryOptions = [
    {value: '', label: 'All Categories'},
    {value: 'single-origin', label: 'Single Origin'},
    {value: 'blend', label: 'Blends'},
    {value: 'espresso', label: 'Espresso'},
    {value: 'decaf', label: 'Decaf'},
  ];

  const statusOptions = [
    {value: '', label: 'All Status'},
    {value: 'active', label: 'Active'},
    {value: 'draft', label: 'Draft'},
    {value: 'archived', label: 'Archived'},
  ];

  const stockOptions = [
    {value: '', label: 'All Stock'},
    {value: 'in-stock', label: 'In Stock'},
    {value: 'low-stock', label: 'Low Stock'},
    {value: 'out-of-stock', label: 'Out of Stock'},
  ];

  const handleChange = (key: keyof ProductFiltersData, value: string) => {
    const newFilters = {...filters, [key]: value};
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: ProductFiltersData = {category: '', status: '', stock: '', search: ''};
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.category || filters.status || filters.stock;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search products by name or SKU..."
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
                {[filters.category, filters.status, filters.stock].filter(Boolean).length}
              </span>
            )}
          </button>

          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <button
            type="button"
            onClick={onAddProduct}
            className="flex items-center gap-2 px-4 py-2 bg-coffee-600 text-white rounded-md text-sm font-medium hover:bg-coffee-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={e => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              >
                {categoryOptions.map(option => (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <select
                value={filters.stock}
                onChange={e => handleChange('stock', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              >
                {stockOptions.map(option => (
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
