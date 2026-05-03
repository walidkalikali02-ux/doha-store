import {useMemo} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft, Package, Sparkles} from 'lucide-react';
import {motion} from 'motion/react';
import {ProductForm} from '@/components/admin/ProductForm';
import {useToast} from '@/components/common';
import {
  createAdminProduct,
  getAdminProductById,
  updateAdminProduct,
  type AdminProductInput,
} from '@/utils/adminProducts';

export function ProductEditor() {
  const navigate = useNavigate();
  const {success, error} = useToast();
  const {productId} = useParams<{productId: string}>();

  const product = useMemo(() => {
    if (!productId) return undefined;
    return getAdminProductById(productId);
  }, [productId]);

  const isEditing = Boolean(productId);

  const handleSave = async (data: AdminProductInput) => {
    try {
      if (productId) {
        updateAdminProduct(productId, data);
        success('Product saved', 'Your changes were saved successfully.');
      } else {
        createAdminProduct(data);
        success('Product created', 'The new product is now available in the catalog.');
      }
      navigate('/admin/products');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save product';
      error('Save failed', message);
    }
  };

  if (isEditing && !product) {
    return (
      <div className="rounded-xl border border-[#e3e3e3] bg-white p-10 text-center">
        <Package className="mx-auto h-10 w-10 text-[#c6a355]" />
        <h1 className="mt-4 text-2xl font-bold text-[#000000]">Product not found</h1>
        <p className="mt-2 text-sm text-[#737373]">The product you are trying to edit does not exist.</p>
        <Link
          to="/admin/products"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#000000] px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{opacity: 0, y: 12}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.4, ease: 'easeOut'}}
        className="rounded-2xl border border-[#e3e3e3] bg-gradient-to-br from-[#3d2b1f] to-[#5a4233] p-6 text-white"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#c6a355]">
              <Sparkles className="h-3 w-3" />
              Product Studio
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight">
              {isEditing ? 'Edit product' : 'Create product'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">
              Create new coffee products or update the details, pricing, stock, and images for
              your store catalog.
            </p>
          </div>

          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to management
          </Link>
        </div>
      </motion.div>

      <ProductForm
        product={product}
        onSave={handleSave}
        onCancel={() => navigate('/admin/products')}
      />
    </div>
  );
}
