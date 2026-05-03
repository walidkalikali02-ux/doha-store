import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { logAudit, sanitizeForAudit } from '../lib/audit';
import { requireAdminAuth } from '../middleware/adminAuth';

const router = express.Router();

const LOW_STOCK_THRESHOLD = 10;

interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  variants: ProductVariant[];
}

router.get('/', async (_req: Request, res: Response) => {
  res.json({ message: 'List products - TODO' });
});

router.patch('/:productId/inventory', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'invalid_quantity', message: 'Quantity must be a non-negative number' });
    }

    const { data, error } = await supabaseAdmin
      .from('inventory')
      .update({ quantity })
      .eq('product_id', productId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'update_failed', message: error.message });
    }

    res.json({ inventory: data });
  } catch (error) {
    res.status(500).json({ error: 'server_error', message: 'Failed to update inventory' });
  }
});

router.get('/admin/products', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) return;

    const { search, lowStock, page = '1', limit = '50' } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .range(offset, offset + limitNum - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%`);
    }

    const { data: products, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: 'fetch_failed', message: error.message });
    }

    let productList = (products || []) as unknown as Product[];

    const productIds = productList.map(p => p.id);

    const { data: variantsData } = await supabaseAdmin
      .from('variants')
      .select('*')
      .in('product_id', productIds);

    const variantsByProduct = (variantsData || []).reduce((acc: Record<string, ProductVariant[]>, v: any) => {
      if (!acc[v.product_id]) acc[v.product_id] = [];
      acc[v.product_id].push(v);
      return acc;
    }, {});

    let formattedProducts = productList.map(p => {
      const variants = variantsByProduct[p.id] || [];
      const totalStock = variants.reduce((sum: number, v: ProductVariant) => sum + v.quantity, 0);
      const cheapestVariant = variants.sort((a: ProductVariant, b: ProductVariant) => a.price - b.price)[0];
      return {
        id: p.id,
        name: p.name,
        sku: cheapestVariant?.sku || 'N/A',
        price: cheapestVariant?.price || 0,
        stock: totalStock,
        status: totalStock === 0 ? 'out_of_stock' : totalStock < LOW_STOCK_THRESHOLD ? 'low_stock' : 'in_stock',
        variants,
      };
    });

    if (lowStock === 'true') {
      formattedProducts = formattedProducts.filter(p => p.stock < LOW_STOCK_THRESHOLD);
    }

    const total = lowStock === 'true' ? formattedProducts.length : (count || 0);
    const pages = Math.ceil(total / limitNum);

    res.json({ products: formattedProducts, total, page: pageNum, pages });
  } catch (error) {
    next(error);
  }
});

router.patch('/admin/products/:productId/variants/:variantId/inventory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = await requireAdminAuth(req, res);
    if (!adminUser) return;

    const { variantId } = req.params;
    const { quantity, reason } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'invalid_quantity', message: 'Quantity must be a non-negative number' });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return res.status(400).json({ error: 'missing_reason', message: 'Reason is required' });
    }

    const { data: currentVariant, error: fetchError } = await supabaseAdmin
      .from('variants')
      .select('*')
      .eq('id', variantId)
      .single();

    if (fetchError || !currentVariant) {
      return res.status(404).json({ error: 'not_found', message: 'Variant not found' });
    }

    const oldQuantity = currentVariant.quantity;

    const { data: updatedVariant, error: updateError } = await supabaseAdmin
      .from('variants')
      .update({ quantity })
      .eq('id', variantId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'update_failed', message: updateError.message });
    }

    await supabaseAdmin
      .from('inventory_logs')
      .insert({
        product_id: currentVariant.product_id,
        variant_id: variantId,
        admin_id: adminUser.id,
        old_quantity: oldQuantity,
        new_quantity: quantity,
        reason: reason.trim(),
      });

    await logAudit({
      adminId: adminUser.id,
      action: 'UPDATE',
      entityType: 'variant_inventory',
      entityId: variantId,
      oldValues: sanitizeForAudit({ quantity: oldQuantity }),
      newValues: sanitizeForAudit({ quantity }),
      metadata: {
        productId: currentVariant.product_id,
        reason: reason.trim(),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({ variant: updatedVariant });
  } catch (error) {
    next(error);
  }
});

export default router;