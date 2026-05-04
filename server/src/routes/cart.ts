import express, {Request, Response} from 'express';
import {getCart, setCart, clearCart} from '../services/cart';

const router = express.Router();

interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
}

router.get('/', async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    return res.status(400).json({error: 'session_id_required', message: 'sessionId query param required'});
  }

  const session = await getCart(sessionId);
  if (!session) {
    return res.json({sessionId, items: [], discountCode: null, isRedis: false});
  }

  return res.json(session);
});

router.post('/', async (req: Request, res: Response) => {
  const {sessionId, items, discountCode} = req.body as {
    sessionId: string;
    items: CartItem[];
    discountCode: string | null;
  };

  if (!sessionId) {
    return res.status(400).json({error: 'session_id_required', message: 'sessionId required'});
  }

  await setCart(sessionId, items || [], discountCode);

  return res.json({sessionId, items: items || [], discountCode: discountCode || null, isRedis: true});
});

router.delete('/', async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    return res.status(400).json({error: 'session_id_required', message: 'sessionId query param required'});
  }

  await clearCart(sessionId);

  return res.json({success: true});
});

export default router;
