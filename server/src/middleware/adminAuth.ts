import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export interface AdminUser {
  id: string;
  email?: string;
  role: string;
}

export async function requireAdminAuth(req: Request, res: Response): Promise<AdminUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'unauthorized', code: 401, message: 'Missing or invalid authorization header' });
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    res.status(401).json({ error: 'unauthorized', code: 401, message: 'Invalid or expired token' });
    return null;
  }

  const { data: { user: userMeta } } = await supabaseAdmin.auth.admin.getUser(user.id);
  const userRole = userMeta?.app_metadata?.role || userMeta?.role;
  if (!userMeta || userRole !== 'admin') {
    res.status(403).json({ error: 'forbidden', code: 403, message: 'Admin access required' });
    return null;
  }

  return { id: user.id, email: user.email, role: userRole };
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  requireAdminAuth(req, res).then(user => {
    if (user) {
      (req as any).adminUser = user;
      next();
    }
  }).catch(() => {
    res.status(500).json({ error: 'server_error', code: 500, message: 'Authentication failed' });
  });
}

export default adminAuth;