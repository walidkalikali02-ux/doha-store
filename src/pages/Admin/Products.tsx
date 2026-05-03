import {useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {motion} from 'motion/react';
import {
  AlertCircle,
  ArrowUpDown,
  Copy,
  Edit,
  Eye,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import {
  deleteAdminProduct,
  duplicateAdminProduct,
  getAdminProducts,
  resetAdminProducts,
  type AdminProductRecord,
} from '@/utils/adminProducts';

const statusConfig: Record<
  AdminProductRecord['status'],
  {label: string; bg: string; text: string; border: string}
> = {
  active: {label: 'Active', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200'},
  draft: {label: 'Draft', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200'},
  archived: {label: 'Archived', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200'},
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'QAR',
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function statusForQuantity(product: AdminProductRecord) {
  if (product.quantity <= 0) return 'Out of stock';
  if (product.quantity <= product.lowStockThreshold) return 'Low stock';
  return 'In stock';
}

export function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProductRecord[]>(() => getAdminProducts());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminProductRecord['status']>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const syncProducts = () => setProducts(getAdminProducts());

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter(product => {
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      const matchesSearch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [products, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const active = products.filter(product => product.status === 'active').length;
    const draft = products.filter(product => product.status === 'draft').length;
    const archived = products.filter(product => product.status === 'archived').length;
    const lowStock = products.filter(product => product.quantity <= product.lowStockThreshold).length;

    return {active, draft, archived, lowStock, total: products.length};
  }, [products]);

  const toggleSelected = (productId: string) => {
    setSelectedIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredProducts.map(product => product.id));
  };

  const handleDelete = (productId: string) => {
    if (!window.confirm('Delete this product?')) return;
    deleteAdminProduct(productId);
    syncProducts();
    setSelectedIds(prev => prev.filter(id => id !== productId));
  };

  const handleDuplicate = (productId: string) => {
    duplicateAdminProduct(productId);
    syncProducts();
  };

  const handleReset = () => {
    if (!window.confirm('Reset catalog to the default seeded products?')) return;
    resetAdminProducts();
    syncProducts();
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} products?`)) return;
    selectedIds.forEach(productId => deleteAdminProduct(productId));
    syncProducts();
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#000000]">Product Management</h1>
          <p className="mt-1 text-sm text-[#737373]">
            Create, edit, duplicate, archive, and remove products from the admin catalog.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e3e3e3] px-4 py-2 text-sm font-medium text-[#737373] transition-colors hover:bg-white hover:text-[#000000]"
          >
            <RefreshCw className="h-4 w-4" />
            Reset catalog
          </button>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333333]"
          >
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {label: 'Total products', value: stats.total, icon: Package, color: 'text-[#3d2b1f]'},
          {label: 'Active', value: stats.active, icon: Eye, color: 'text-green-600'},
          {label: 'Drafts', value: stats.draft, icon: AlertCircle, color: 'text-amber-600'},
          {label: 'Low stock', value: stats.lowStock, icon: AlertCircle, color: 'text-red-600'},
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-[#e3e3e3] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f9f9f9]">
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-[#737373]">{card.label}</p>
                  <p className="text-xl font-bold text-[#000000]">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[#e3e3e3] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <input
              type="search"
              placeholder="Search products by name, SKU, or tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] px-4 py-2.5 pr-10 text-sm focus:border-[#c6a355] focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-lg border border-[#e3e3e3] bg-white px-3 py-2.5 text-sm focus:border-[#c6a355] focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <button
              onClick={() => navigate('/admin/products/new')}
              className="inline-flex items-center gap-2 rounded-lg border border-[#e3e3e3] px-4 py-2.5 text-sm font-medium text-[#737373] transition-colors hover:bg-[#f9f9f9] hover:text-[#000000]"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] px-4 py-3">
            <span className="text-sm font-medium text-[#000000]">{selectedIds.length} selected</span>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete selected
            </button>
          </div>
        )}
      </div>

      <motion.div
        initial={{opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.4, ease: 'easeOut'}}
        className="overflow-hidden rounded-xl border border-[#e3e3e3] bg-white"
      >
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#f9f9f9]/50">
                <th className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    onChange={toggleAll}
                    className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                  />
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-[#737373]">
                  Product
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-[#737373]">
                  SKU
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-[#737373]">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-[#737373]">
                  Price
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-[#737373]">
                  Stock
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2f2f2]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#737373]">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const config = statusConfig[product.status];
                  return (
                    <tr key={product.id} className="group hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelected(product.id)}
                          className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-lg border border-[#e5e5e5] bg-[#f9f9f9]">
                            <img
                              src={product.images[0] || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400'}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#000000]">{product.name}</p>
                            <p className="text-xs text-[#737373]">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-[#737373]">{product.sku}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-bold text-[#000000]">{formatMoney(product.price)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="text-sm">
                          <span className="font-medium text-[#000000]">{product.quantity}</span>
                          <span className="ml-2 text-[#737373]">{statusForQuantity(product)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            className="rounded p-1.5 text-[#737373] transition-colors hover:bg-[#f2f2f2] hover:text-[#000000]"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(product.id)}
                            className="rounded p-1.5 text-[#737373] transition-colors hover:bg-[#f2f2f2] hover:text-[#000000]"
                            title="Duplicate"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="rounded p-1.5 text-[#737373] transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-[#f2f2f2] md:hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-sm text-[#737373]">No products found</div>
          ) : (
            filteredProducts.map(product => {
              const config = statusConfig[product.status];
              return (
                <div key={product.id} className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelected(product.id)}
                        className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
                      />
                      <div className="h-12 w-12 overflow-hidden rounded-lg border border-[#e5e5e5] bg-[#f9f9f9]">
                        <img
                          src={product.images[0] || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400'}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#000000]">{product.name}</p>
                        <p className="text-xs text-[#737373]">{product.sku}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#000000]">{formatMoney(product.price)}</div>
                      <div className="text-xs text-[#737373]">{product.quantity} in stock</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        className="rounded p-1.5 text-[#737373] transition-colors hover:bg-[#f2f2f2] hover:text-[#000000]"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(product.id)}
                        className="rounded p-1.5 text-[#737373] transition-colors hover:bg-[#f2f2f2] hover:text-[#000000]"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded p-1.5 text-[#737373] transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
