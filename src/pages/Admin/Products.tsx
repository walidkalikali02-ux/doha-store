import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useAdminProducts, useUpdateInventory} from '../../hooks/useAdminProducts';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  Package,
  AlertCircle,
  Edit,
  Trash2,
  Copy,
  Eye,
  Check,
  X,
  PackageSearch,
  PlusCircle,
  MinusCircle,
  Settings,
} from 'lucide-react';
import {motion, AnimatePresence} from 'motion/react';

interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  variants: ProductVariant[];
}

const statusConfig = {
  in_stock: {bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'In Stock'},
  low_stock: {bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Low Stock'},
  out_of_stock: {bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Out of Stock'},
};

const INVENTORY_REASONS = [
  {value: 'restock', label: 'Restock', icon: PlusCircle, color: 'text-green-600'},
  {value: 'adjustment', label: 'Adjustment', icon: Settings, color: 'text-blue-600'},
  {value: 'damage', label: 'Damage/Waste', icon: MinusCircle, color: 'text-red-600'},
  {value: 'return', label: 'Customer Return', icon: Package, color: 'text-purple-600'},
];

function StatusBadge({status}: {status: 'in_stock' | 'low_stock' | 'out_of_stock'}) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`} />
      {config.label}
    </span>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 0,
  }).format(price / 100);
}

interface InlineEditProps {
  value: number;
  variantId: string;
  onSave: (variantId: string, newValue: number) => void;
  onCancel: () => void;
}

function InlineInventoryEdit({value, variantId, onSave, onCancel}: InlineEditProps) {
  const [editValue, setEditValue] = useState(value);

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        value={editValue}
        onChange={(e) => setEditValue(parseInt(e.target.value, 10) || 0)}
        className="w-20 px-2 py-1 border border-[#c6a355] rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#c6a355]"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave(variantId, editValue);
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button
        onClick={() => onSave(variantId, editValue)}
        className="p-1 text-green-600 hover:bg-green-50 rounded"
      >
        <Check className="h-4 w-4" />
      </button>
      <button onClick={onCancel} className="p-1 text-red-600 hover:bg-red-50 rounded">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AdminProducts() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const limit = 20;

  const {data, isLoading} = useAdminProducts({
    search: searchQuery || undefined,
    status: statusFilter,
    lowStock: lowStockFilter,
    page,
    limit,
  });

  const updateInventory = useUpdateInventory();

  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    if (productSearchQuery.length >= 2) {
      const params = new URLSearchParams();
      params.set('search', productSearchQuery);
      params.set('limit', '10');
      fetch(`/api/v1/products/admin/products?${params}`)
        .then(res => res.json())
        .then(data => setSearchProducts(data.products || []));
    } else {
      setSearchProducts([]);
    }
  }, [productSearchQuery]);

  const openInventoryForm = (product: Product, variant?: ProductVariant) => {
    setSelectedProduct(product);
    setSelectedVariant(variant || product.variants?.[0] || null);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
    setProductSearchQuery('');
    setSearchProducts([]);
    setShowInventoryForm(true);
  };

  const closeInventoryForm = () => {
    setShowInventoryForm(false);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setAdjustmentQuantity(0);
    setAdjustmentReason('');
    setProductSearchQuery('');
    setSearchProducts([]);
    setShowConfirmDialog(false);
  };

  const handleSubmitAdjustment = () => {
    if (!selectedVariant || !adjustmentReason) return;
    updateInventory.mutate(
      {
        productId: selectedProduct!.id,
        variantId: selectedVariant.id,
        quantity: adjustmentQuantity,
        reason: adjustmentReason,
      },
      {
        onSuccess: () => {
          closeInventoryForm();
        },
        onError: (err: Error) => {
          alert(err.message || 'Failed to update inventory');
        },
      }
    );
  };

  const newQuantity = selectedVariant ? selectedVariant.quantity + adjustmentQuantity : 0;
  const currentReason = INVENTORY_REASONS.find(r => r.value === adjustmentReason);

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, id => id !== productId]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleInventorySave = (variantId: string, newQuantity: number) => {
    const product = products.find(p => p.variants?.some(v => v.id === variantId));
    if (!product || !variantId) return;
    const variant = product.variants?.find(v => v.id === variantId);
    if (!variant) return;
    updateInventory.mutate(
      {
        productId: product.id,
        variantId,
        quantity: newQuantity,
        reason: 'adjustment',
      },
      {
        onSuccess: () => {
          setEditingVariantId(null);
        },
        onError: (err: Error) => {
          alert(err.message || 'Failed to update inventory');
        },
      }
    );
  };

  const inStockCount = products.filter(p => p.status === 'in_stock').length;
  const lowStockCount = products.filter(p => p.status === 'low_stock').length;
  const outOfStockCount = products.filter(p => p.status === 'out_of_stock').length;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#000000]">Products</h1>
          <p className="text-sm text-[#737373] mt-0.5">Manage your coffee products and inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#737373] hover:text-[#000000] border border-[#e3e3e3] rounded-lg transition-colors hover:bg-white">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#000000] text-white rounded-lg font-medium text-sm hover:bg-[#333333] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add product
          </Link>
          <button
            onClick={() => setShowInventoryForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#c6a355] text-white rounded-lg font-medium text-sm hover:bg-[#b08f3d] transition-colors"
          >
            <PackageSearch className="h-4 w-4" />
            Adjust Inventory
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f9f9f9] rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-[#3d2b1f]" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">Total Products</p>
              <p className="text-xl font-bold text-[#000000]">{total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">In Stock</p>
              <p className="text-xl font-bold text-[#000000]">{inStockCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">Low Stock</p>
              <p className="text-xl font-bold text-[#000000]">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">Out of Stock</p>
              <p className="text-xl font-bold text-[#000000]">{outOfStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#e3e3e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <button
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border rounded-lg transition-colors ${
                lowStockFilter
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'text-[#737373] border-[#e3e3e3] hover:bg-[#f9f9f9]'
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              Low stock
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-[#737373] hover:text-[#000000] border border-[#e3e3e3] rounded-lg transition-colors hover:bg-[#f9f9f9]">
              <Filter className="h-4 w-4" />
              More filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <motion.div
        initial={{opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.4, ease: 'easeOut'}}
        className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden"
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#f9f9f9]/50">
                <th className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={toggleAllProducts}
                    className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                  />
                </th>
                <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  <button className="flex items-center gap-1 hover:text-[#000000]">
                    Product
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  SKU
                </th>
                <th className="text-left text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  Price
                </th>
                <th className="text-right text-xs font-semibold text-[#737373] uppercase px-5 py-3">
                  Inventory
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f2]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#737373]">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#737373]">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="group hover:bg-[#f9f9f9] transition-colors">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#f9f9f9] to-[#f2f2f2] rounded-lg flex items-center justify-center border border-[#e5e5e5]">
                          <Package className="h-6 w-6 text-[#c6a355]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#000000]">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-mono text-[#737373]">{product.sku}</span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-bold text-[#000000]">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {editingVariantId && product.variants?.length > 0 ? (
                        <InlineInventoryEdit
                          value={product.variants[0].quantity}
                          variantId={product.variants[0].id}
                          onSave={handleInventorySave}
                          onCancel={() => setEditingVariantId(null)}
                        />
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <span
                            className={`text-sm font-medium cursor-pointer hover:text-[#c6a355] ${
                              product.stock <= 5
                                ? 'text-red-600'
                                : product.stock === 0
                                ? 'text-gray-400'
                                : 'text-[#000000]'
                            }`}
                            onClick={() => setEditingVariantId(product.variants?.[0]?.id || null)}
                            title="Click to edit"
                          >
                            {product.stock}
                          </span>
                          <button
                            onClick={() => setEditingVariantId(product.variants?.[0]?.id || null)}
                            className="p-1 text-[#737373] hover:text-[#c6a355] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-[#737373] hover:text-[#000000] hover:bg-[#f2f2f2] rounded transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 text-[#737373] hover:text-[#000000] hover:bg-[#f2f2f2] rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 text-[#737373] hover:text-[#000000] hover:bg-[#f2f2f2] rounded transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1.5 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-[#f2f2f2]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-[#737373]">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#737373]">No products found</div>
          ) : (
            products.map(product => (
              <div key={product.id} className="p-4 hover:bg-[#f9f9f9]">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    className="mt-1 rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#f9f9f9] to-[#f2f2f2] rounded-lg flex items-center justify-center border border-[#e5e5e5]">
                          <Package className="h-6 w-6 text-[#c6a355]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#000000]">{product.name}</p>
                          <p className="text-xs text-[#737373] font-mono">{product.sku}</p>
                        </div>
                      </div>
                      <StatusBadge status={product.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#000000]">
                          {formatPrice(product.price)}
                        </span>
                        <span
                          className={`text-sm ${
                            product.stock <= 5 ? 'text-red-600' : 'text-[#737373]'
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-[#737373] hover:text-[#000000]">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-[#737373] hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Empty State */}
        {!isLoading && products.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-[#f9f9f9] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-[#737373]" />
            </div>
            <h3 className="text-base font-semibold text-[#000000] mb-1">No products found</h3>
            <p className="text-sm text-[#737373]">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-[#e5e5e5] bg-[#f9f9f9]/30 flex items-center justify-between">
          <span className="text-xs text-[#737373]">
            Showing {products.length} of {total} products
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-medium text-[#737373] hover:text-[#000000] border border-[#e3e3e3] rounded hover:bg-white transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-[#737373]">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-medium text-[#000000] bg-white border border-[#e3e3e3] rounded hover:bg-[#f9f9f9] transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>

      {/* Inventory Adjustment Modal */}
      <AnimatePresence>
        {showInventoryForm && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeInventoryForm}
          >
            <motion.div
              initial={{scale: 0.95, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.95, opacity: 0}}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#000000]">Adjust Inventory</h3>
                <button onClick={closeInventoryForm} className="p-1 text-[#737373] hover:text-[#000000]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Product Search */}
                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-1.5">Product</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373]" />
                    <input
                      type="text"
                      placeholder="Search product by name or SKU..."
                      value={productSearchQuery}
                      onChange={e => setProductSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#e3e3e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]"
                    />
                  </div>
                  {searchProducts.length > 0 && (
                    <ul className="mt-2 border border-[#e3e3e3] rounded-lg max-h-48 overflow-y-auto">
                      {searchProducts.map(p => (
                        <li key={p.id}>
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setSelectedVariant(p.variants?.[0] || null);
                              setProductSearchQuery(p.name);
                              setSearchProducts([]);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-[#f9f9f9] text-sm"
                          >
                            <span className="font-medium text-[#000000]">{p.name}</span>
                            <span className="text-[#737373] ml-2 text-xs">{p.sku}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {selectedProduct && (
                    <div className="mt-2 px-3 py-2 bg-[#f9f9f9] rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#000000]">{selectedProduct.name}</p>
                        <p className="text-xs text-[#737373]">{selectedVariant?.sku} · Current: {selectedVariant?.quantity}</p>
                      </div>
                      <button onClick={() => {setSelectedProduct(null); setSelectedVariant(null); setProductSearchQuery('');}} className="text-[#737373] hover:text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-1.5">Quantity to Add/Remove</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustmentQuantity || ''}
                    onChange={e => setAdjustmentQuantity(parseInt(e.target.value, 10) || 0)}
                    placeholder="Enter amount..."
                    className="w-full px-4 py-2.5 border border-[#e3e3e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]"
                  />
                </div>

                {/* Reason Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-1.5">Reason</label>
                  <div className="grid grid-cols-2 gap-2">
                    {INVENTORY_REASONS.map(reason => {
                      const Icon = reason.icon;
                      return (
                        <button
                          key={reason.value}
                          onClick={() => setAdjustmentReason(reason.value)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                            adjustmentReason === reason.value
                              ? 'border-[#c6a355] bg-[#c6a355]/10 text-[#c6a355]'
                              : 'border-[#e3e3e3] text-[#737373] hover:border-[#c6a355]'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {reason.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview Changes */}
                {selectedVariant && adjustmentQuantity !== 0 && adjustmentReason && (
                  <div className="bg-[#f9f9f9] rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#737373]">Current Quantity</span>
                      <span className="font-medium text-[#000000]">{selectedVariant.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#737373]">Change</span>
                      <span className={`font-medium ${adjustmentQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {adjustmentQuantity > 0 ? '+' : ''}{adjustmentQuantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-[#e5e5e5]">
                      <span className="font-semibold text-[#000000]">New Quantity</span>
                      <span className="font-bold text-[#000000]">{newQuantity}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeInventoryForm}
                    className="flex-1 px-4 py-2.5 border border-[#e3e3e3] rounded-lg text-sm font-medium text-[#737373] hover:bg-[#f9f9f9]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={!selectedVariant || adjustmentQuantity === 0 || !adjustmentReason}
                    className="flex-1 px-4 py-2.5 bg-[#c6a355] text-white rounded-lg text-sm font-medium hover:bg-[#b08f3d] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Preview Change
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showConfirmDialog && selectedVariant && (
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowConfirmDialog(false)}
          >
            <motion.div
              initial={{scale: 0.95, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.95, opacity: 0}}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#000000] mb-2">Confirm Inventory Change</h3>
              <div className="mb-6">
                <p className="text-sm text-[#737373] mb-3">
                  Update inventory for <strong>{selectedProduct?.name}</strong>?
                </p>
                <div className="bg-[#f9f9f9] rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#737373]">Variant</span>
                    <span className="text-[#000000]">{selectedVariant.sku}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#737373]">Reason</span>
                    <span className={`font-medium ${currentReason?.color || 'text-[#737373]'}`}>
                      {currentReason?.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#737373]">Current</span>
                    <span className="text-[#000000]">{selectedVariant.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#737373]">Change</span>
                    <span className={`font-medium ${adjustmentQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {adjustmentQuantity > 0 ? '+' : ''}{adjustmentQuantity}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-1 border-t border-[#e5e5e5]">
                    <span className="font-semibold text-[#000000]">New</span>
                    <span className="font-bold text-[#000000]">{newQuantity}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2 border border-[#e3e3e3] rounded-lg text-sm font-medium text-[#737373] hover:bg-[#f9f9f9]"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAdjustment}
                  className="flex-1 px-4 py-2 bg-[#c6a355] text-white rounded-lg text-sm font-medium hover:bg-[#b08f3d] disabled:opacity-50"
                  disabled={updateInventory.isPending}
                >
                  {updateInventory.isPending ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminProducts;
