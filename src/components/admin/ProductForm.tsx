import {useState} from 'react';
import {Camera, Save, X} from 'lucide-react';
import type {AdminProductInput, AdminProductRecord} from '@/utils/adminProducts';

interface ProductFormProps {
  product?: AdminProductRecord;
  onSave: (product: AdminProductInput) => Promise<void>;
  onCancel: () => void;
}

const categories = [
  {value: 'single-origin', label: 'Single Origin'},
  {value: 'blend', label: 'Blend'},
  {value: 'espresso', label: 'Espresso'},
  {value: 'decaf', label: 'Decaf'},
];

export function ProductForm({product, onSave, onCancel}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    category: product?.category ?? '',
    description: product?.description ?? '',
    price: product?.price ? (product.price / 100).toFixed(2) : '',
    compareAtPrice: product?.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : '',
    costPerItem: product?.costPerItem ? (product.costPerItem / 100).toFixed(2) : '',
    quantity: product?.quantity ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 10,
    status: product?.status ?? 'draft',
    images: product?.images ?? [],
    tags: product?.tags ?? [],
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const {name, value} = e.target;
    const nextValue =
      name === 'quantity' || name === 'lowStockThreshold'
        ? Number(value)
        : value;
    setFormData(prev => ({...prev, [name]: nextValue}));
    if (errors[name]) {
      setErrors(prev => {
        const next = {...prev};
        delete next[name];
        return next;
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({...prev, tags: [...prev.tags, newTag.trim()]}));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({...prev, tags: prev.tags.filter(t => t !== tag)}));
  };

  const handleImageChange = (value: string) => {
    setFormData(prev => ({...prev, images: value ? [value] : []}));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100),
        compareAtPrice: formData.compareAtPrice
          ? Math.round(parseFloat(formData.compareAtPrice) * 100)
          : undefined,
        costPerItem: formData.costPerItem
          ? Math.round(parseFloat(formData.costPerItem) * 100)
          : undefined,
        images: formData.images.filter(Boolean),
      });
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Product Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
              SKU *
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                errors.sku ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                errors.category ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="image" className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Camera className="h-4 w-4" />
              Main Image URL
            </label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.images[0] ?? ''}
              onChange={e => handleImageChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Use one main image for the product card and product page.
            </p>
            {formData.images[0] && (
              <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={formData.images[0]}
                  alt={formData.name || 'Product preview'}
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="0"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
            />
          </div>

          <div>
            <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">
              Low Stock Threshold
            </label>
            <input
              type="number"
              id="lowStockThreshold"
              name="lowStockThreshold"
              min="0"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>

          <div>
            <label
              htmlFor="compareAtPrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Compare at Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                id="compareAtPrice"
                name="compareAtPrice"
                value={formData.compareAtPrice}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="costPerItem" className="block text-sm font-medium text-gray-700 mb-1">
              Cost per Item
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                id="costPerItem"
                name="costPerItem"
                value={formData.costPerItem}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
            />
          </div>

          <div>
            <label
              htmlFor="lowStockThreshold"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Low Stock Threshold
            </label>
            <input
              type="number"
              id="lowStockThreshold"
              name="lowStockThreshold"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              You'll receive alerts when stock falls below this number
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Images</h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Camera className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop images here, or click to select files
          </p>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
          <input type="file" accept="image/*" multiple className="hidden" id="image-upload" />
          <label
            htmlFor="image-upload"
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Select Files
          </label>
        </div>

        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full aspect-square object-cover rounded"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-coffee-600 text-white rounded-md text-sm font-medium hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
