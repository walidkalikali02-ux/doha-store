import {useState} from 'react';
import {AlertTriangle, Edit2, Eye, Trash2} from 'lucide-react';
import {Link} from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  price: number;
  stock: number;
  lowStockThreshold: number;
  image: string;
}

interface InventoryTableProps {
  products: Product[];
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onSelect: (productIds: string[]) => void;
  selectedIds: string[];
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-gray-100 text-gray-800',
};

export function InventoryTable({
  products,
  onEdit,
  onDelete,
  onSelect,
  selectedIds,
}: InventoryTableProps) {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      onSelect([]);
    } else {
      onSelect(products.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOne = (productId: string) => {
    if (selectedIds.includes(productId)) {
      onSelect(selectedIds.filter(id => id !== productId));
    } else {
      onSelect([...selectedIds, productId]);
    }
    setSelectAll(selectedIds.length === products.length - 1);
  };

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return {label: 'Out of Stock', color: 'text-red-600 bg-red-50'};
    if (product.stock <= product.lowStockThreshold)
      return {label: 'Low Stock', color: 'text-amber-600 bg-amber-50'};
    return {label: 'In Stock', color: 'text-green-600 bg-green-50'};
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-coffee-600 focus:ring-coffee-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => {
              const stockStatus = getStockStatus(product);
              const isSelected = selectedIds.includes(product.id);

              return (
                <tr key={product.id} className={isSelected ? 'bg-coffee-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectOne(product.id)}
                      className="h-4 w-4 rounded border-gray-300 text-coffee-600 focus:ring-coffee-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 capitalize">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[product.status]
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-900">{product.stock}</span>
                      {product.stock <= product.lowStockThreshold && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${stockStatus.color} px-2 py-0.5 rounded-full mt-1`}
                        >
                          {product.stock === 0 && <AlertTriangle className="h-3 w-3" />}
                          {stockStatus.label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(product.id)}
                        className="p-1 text-gray-400 hover:text-coffee-600"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
