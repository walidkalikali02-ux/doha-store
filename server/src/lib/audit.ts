import {supabaseAdmin} from './supabase';
import {randomUUID} from 'crypto';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';

export interface AuditLogEntry {
  adminId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const {error} = await supabaseAdmin.from('audit_log').insert({
      id: randomUUID(),
      admin_id: entry.adminId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      old_values: entry.oldValues ?? null,
      new_values: entry.newValues ?? null,
      metadata: entry.metadata ?? null,
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
    });

    if (error) {
      console.error('Failed to write audit log:', error);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

export function sanitizeForAudit(data: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!data) return null;
  const sensitiveFields = ['password', 'token', 'secret', 'api_key', 'authorization'];
  const sanitized = {...data};
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
}

export default {logAudit, sanitizeForAudit};