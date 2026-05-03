import {useState} from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Filter,
  ImageIcon,
} from 'lucide-react';
import {motion} from 'motion/react';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'product_type' | 'origin' | 'roast_level';
  parentId?: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

const typeConfig = {
  product_type: {
    label: 'Product Type',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  origin: {label: 'Origin', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200'},
  roast_level: {
    label: 'Roast Level',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
};

function TypeBadge({type}: {type: keyof typeof typeConfig}) {
  const config = typeConfig[type];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}

export function AdminCategories() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Coffee Beans',
      slug: 'coffee-beans',
      type: 'product_type',
      sortOrder: 1,
      isActive: true,
      productCount: 24,
      description: 'Premium coffee beans from around the world',
    },
    {
      id: '2',
      name: 'Equipment',
      slug: 'equipment',
      type: 'product_type',
      sortOrder: 2,
      isActive: true,
      productCount: 15,
      description: 'Coffee brewing equipment and tools',
    },
    {
      id: '3',
      name: 'Accessories',
      slug: 'accessories',
      type: 'product_type',
      sortOrder: 3,
      isActive: true,
      productCount: 8,
      description: 'Coffee accessories and merchandise',
    },
    {
      id: '4',
      name: 'Ethiopia',
      slug: 'ethiopia',
      type: 'origin',
      parentId: '1',
      sortOrder: 1,
      isActive: true,
      productCount: 8,
      description: 'Ethiopian coffee beans',
    },
    {
      id: '5',
      name: 'Colombia',
      slug: 'colombia',
      type: 'origin',
      parentId: '1',
      sortOrder: 2,
      isActive: true,
      productCount: 6,
      description: 'Colombian coffee beans',
    },
    {
      id: '6',
      name: 'Brazil',
      slug: 'brazil',
      type: 'origin',
      parentId: '1',
      sortOrder: 3,
      isActive: true,
      productCount: 5,
      description: 'Brazilian coffee beans',
    },
    {
      id: '7',
      name: 'Light Roast',
      slug: 'light-roast',
      type: 'roast_level',
      sortOrder: 1,
      isActive: true,
      productCount: 12,
      description: 'Light roasted coffee',
    },
    {
      id: '8',
      name: 'Medium Roast',
      slug: 'medium-roast',
      type: 'roast_level',
      sortOrder: 2,
      isActive: true,
      productCount: 18,
      description: 'Medium roasted coffee',
    },
    {
      id: '9',
      name: 'Dark Roast',
      slug: 'dark-roast',
      type: 'roast_level',
      sortOrder: 3,
      isActive: false,
      productCount: 0,
      description: 'Dark roasted coffee',
    },
  ]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleAllCategories = () => {
    const visibleIds = filteredCategories.map(c => c.id);
    if (selectedCategories.length === visibleIds.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(visibleIds);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || category.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const rootCategories = filteredCategories.filter(c => !c.parentId);
  const getChildCategories = (parentId: string) =>
    filteredCategories.filter(c => c.parentId === parentId);

  const renderCategory = (category: Category, depth: number = 0) => {
    const children = getChildCategories(category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}>
        <div
          className={`group flex items-center gap-3 px-5 py-4 hover:bg-[#f9f9f9] transition-colors ${
            depth > 0 ? `pr-${16 + depth * 4}` : ''
          }`}
          style={{paddingRight: depth > 0 ? `${16 + depth * 16}px` : undefined}}
        >
          <input
            type="checkbox"
            checked={selectedCategories.includes(category.id)}
            onChange={() => toggleCategorySelection(category.id)}
            className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
          />

          <GripVertical className="h-4 w-4 text-[#e5e5e5] cursor-move" />

          {hasChildren ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-1 hover:bg-[#f2f2f2] rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-[#737373]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-[#737373]" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}

          <div className="w-12 h-12 bg-gradient-to-br from-[#f9f9f9] to-[#f2f2f2] rounded-lg flex items-center justify-center border border-[#e5e5e5]">
            {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Folder className="h-6 w-6 text-[#c6a355]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[#000000]">{category.name}</h3>
              <TypeBadge type={category.type} />
              {!category.isActive && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-[#737373] mt-0.5">{category.slug}</p>
            {category.description && (
              <p className="text-xs text-[#737373] mt-1 truncate">{category.description}</p>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center hidden sm:block">
              <p className="text-sm font-semibold text-[#000000]">{category.productCount}</p>
              <p className="text-xs text-[#737373]">products</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="text-sm font-semibold text-[#000000]">{category.sortOrder}</p>
              <p className="text-xs text-[#737373]">order</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-[#737373] hover:text-[#000000] hover:bg-[#f2f2f2] rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button className="p-2 text-[#737373] hover:text-[#000000] hover:bg-[#f2f2f2] rounded-lg transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="bg-[#f9f9f9]/50">
            {children.map(child => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#000000]">Categories</h1>
          <p className="text-sm text-[#737373] mt-0.5">Organize your products with categories</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#737373] hover:text-[#000000] border border-[#e3e3e3] rounded-lg transition-colors hover:bg-white">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#000000] text-white rounded-lg font-medium text-sm hover:bg-[#333333] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add category
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f9f9f9] rounded-lg flex items-center justify-center">
              <Folder className="h-5 w-5 text-[#3d2b1f]" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">Total Categories</p>
              <p className="text-xl font-bold text-[#000000]">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">Product Types</p>
              <p className="text-xl font-bold text-[#000000]">
                {categories.filter(c => c.type === 'product_type').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">Origins</p>
              <p className="text-xl font-bold text-[#000000]">
                {categories.filter(c => c.type === 'origin').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#e3e3e3] p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-[#737373]">Roast Levels</p>
              <p className="text-xl font-bold text-[#000000]">
                {categories.filter(c => c.type === 'roast_level').length}
              </p>
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
              placeholder="Search categories by name, slug, or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#e3e3e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355]"
            >
              <option value="all">All Types</option>
              <option value="product_type">Product Type</option>
              <option value="origin">Origin</option>
              <option value="roast_level">Roast Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <motion.div
        initial={{opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.4, ease: 'easeOut'}}
        className="bg-white rounded-xl border border-[#e3e3e3] overflow-hidden"
      >
        {/* Bulk Actions */}
        {selectedCategories.length > 0 && (
          <div className="px-5 py-3 border-b border-[#e5e5e5] bg-[#f9f9f9] flex items-center justify-between">
            <span className="text-sm font-medium text-[#000000]">
              {selectedCategories.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-[#737373] hover:text-[#000000] hover:bg-white rounded border border-[#e3e3e3] transition-colors">
                Change status
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded border border-red-200 transition-colors">
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-5 py-3 border-b border-[#e5e5e5] bg-[#f9f9f9]/50 hidden md:flex items-center gap-3">
          <input
            type="checkbox"
            checked={
              selectedCategories.length === filteredCategories.length &&
              filteredCategories.length > 0
            }
            onChange={toggleAllCategories}
            className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
          />
          <span className="w-4" />
          <span className="w-6" />
          <span className="w-12" />
          <span className="flex-1 text-xs font-semibold text-[#737373] uppercase">Category</span>
          <span className="w-24 text-center text-xs font-semibold text-[#737373] uppercase hidden lg:block">
            Products
          </span>
          <span className="w-20 text-center text-xs font-semibold text-[#737373] uppercase">
            Order
          </span>
          <span className="w-32" />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden px-5 py-3 border-b border-[#e5e5e5] bg-[#f9f9f9]/50 flex items-center gap-3">
          <input
            type="checkbox"
            checked={
              selectedCategories.length === filteredCategories.length &&
              filteredCategories.length > 0
            }
            onChange={toggleAllCategories}
            className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355]"
          />
          <span className="text-xs font-semibold text-[#737373] uppercase">Select All</span>
        </div>

        {/* Categories List */}
        <div className="divide-y divide-[#f2f2f2]">
          {rootCategories.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-[#f9f9f9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder className="h-8 w-8 text-[#737373]" />
              </div>
              <h3 className="text-base font-semibold text-[#000000] mb-1">No categories found</h3>
              <p className="text-sm text-[#737373] mb-4">
                Start by adding categories to organize your products
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#000000] text-white rounded-lg font-medium text-sm hover:bg-[#333333] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add category
              </button>
            </div>
          ) : (
            rootCategories.map(category => renderCategory(category))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e5e5e5] bg-[#f9f9f9]/30 flex items-center justify-between">
          <span className="text-xs text-[#737373]">
            Showing {filteredCategories.length} categories
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-xs font-medium text-[#737373] hover:text-[#000000] border border-[#e3e3e3] rounded hover:bg-white transition-colors disabled:opacity-50"
              disabled
            >
              Previous
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-[#000000] bg-white border border-[#e3e3e3] rounded hover:bg-[#f9f9f9] transition-colors">
              Next
            </button>
          </div>
        </div>
      </motion.div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#000000]">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
                className="p-2 text-[#737373] hover:text-[#000000] hover:bg-[#f9f9f9] rounded-lg transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#000000] mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  defaultValue={editingCategory?.name}
                  placeholder="e.g., Coffee Beans"
                  className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-1.5">Slug</label>
                <input
                  type="text"
                  defaultValue={editingCategory?.slug}
                  placeholder="e.g., coffee-beans"
                  className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355] transition-all"
                />
                <p className="text-xs text-[#737373] mt-1">Used in URLs, must be unique</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-1.5">Type</label>
                <select
                  defaultValue={editingCategory?.type || 'product_type'}
                  className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355]"
                >
                  <option value="product_type">Product Type</option>
                  <option value="origin">Origin</option>
                  <option value="roast_level">Roast Level</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-1.5">
                  Parent Category
                </label>
                <select
                  defaultValue={editingCategory?.parentId || ''}
                  className="w-full px-3 py-2 bg-white border border-[#e3e3e3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355]"
                >
                  <option value="">None (Root Category)</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-1.5">
                  Description
                </label>
                <textarea
                  defaultValue={editingCategory?.description}
                  placeholder="Brief description of the category..."
                  rows={3}
                  className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355] transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#000000] mb-1.5">Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    defaultValue={editingCategory?.imageUrl}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355] transition-all"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-[#f9f9f9] border border-[#e3e3e3] rounded-lg text-sm font-medium text-[#737373] hover:text-[#000000] hover:bg-[#f2f2f2] transition-colors"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#000000] mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    defaultValue={editingCategory?.sortOrder || 0}
                    className="w-full px-3 py-2 bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c6a355]/20 focus:border-[#c6a355] transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={editingCategory?.isActive ?? true}
                      className="rounded border-[#e3e3e3] text-[#c6a355] focus:ring-[#c6a355] h-4 w-4"
                    />
                    <span className="text-sm text-[#000000]">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#737373] hover:text-[#000000] hover:bg-[#f9f9f9] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={e => {
                    e.preventDefault();
                    setShowForm(false);
                  }}
                  className="px-4 py-2 bg-[#000000] text-white rounded-lg font-medium text-sm hover:bg-[#333333] transition-colors"
                >
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
