import type {PointsTransaction} from './loyalty';

export interface PointsTransactionFilters {
  userId?: string;
  type?: PointsTransaction['type'];
  orderId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PointsBalance {
  available: number;
  pending: number;
  lifetime: number;
}

const API_BASE = '/api';

export async function getPointsTransactions(params?: {
  page?: number;
  limit?: number;
  filters?: PointsTransactionFilters;
}): Promise<{transactions: PointsTransaction[]; total: number; page: number; limit: number}> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.limit) searchParams.append('limit', String(params.limit));
  if (params?.filters?.userId) searchParams.append('userId', params.filters.userId);
  if (params?.filters?.type) searchParams.append('type', params.filters.type);
  if (params?.filters?.orderId) searchParams.append('orderId', params.filters.orderId);
  if (params?.filters?.dateFrom) searchParams.append('dateFrom', params.filters.dateFrom);
  if (params?.filters?.dateTo) searchParams.append('dateTo', params.filters.dateTo);

  const response = await fetch(`${API_BASE}/points/transactions?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch points transactions');
  }
  return response.json();
}

export async function creditPoints(data: {
  userId: string;
  points: number;
  type: PointsTransaction['type'];
  description: string;
  orderId?: string;
  referralId?: string;
}): Promise<PointsTransaction> {
  const response = await fetch(`${API_BASE}/points/credit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to credit points');
  }
  return response.json();
}

export async function debitPoints(data: {
  userId: string;
  points: number;
  description: string;
  orderId?: string;
}): Promise<PointsTransaction> {
  const response = await fetch(`${API_BASE}/points/debit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to debit points');
  }
  return response.json();
}

export async function getPointsBalance(userId: string): Promise<PointsBalance> {
  const response = await fetch(`${API_BASE}/points/balance?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch points balance');
  }
  return response.json();
}

export async function expirePoints(userId: string): Promise<{pointsExpired: number}> {
  const response = await fetch(`${API_BASE}/points/expire`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({userId}),
  });
  if (!response.ok) {
    throw new Error('Failed to expire points');
  }
  return response.json();
}
