export interface LoyaltyAccount {
  id: string;
  userId: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalEarned: number;
  totalRedeemed: number;
  createdAt: string;
  updatedAt: string;
}

export interface PointsTransaction {
  id: string;
  loyaltyAccountId: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'referral' | 'expired' | 'adjustment';
  points: number;
  balance: number;
  description: string;
  orderId?: string;
  productId?: string;
  referralId?: string;
  createdAt: string;
}

export interface LoyaltyStats {
  currentPoints: number;
  lifetimePoints: number;
  currentTier: string;
  pointsToNextTier: number;
  thisMonthEarned: number;
  thisMonthRedeemed: number;
  pendingReferralPoints: number;
}

const API_BASE = '/api';

export async function getLoyaltyAccount(): Promise<LoyaltyAccount> {
  const response = await fetch(`${API_BASE}/loyalty/account`);
  if (!response.ok) {
    throw new Error('Failed to fetch loyalty account');
  }
  return response.json();
}

export async function getPointsHistory(params?: {
  page?: number;
  limit?: number;
  type?: 'earned' | 'redeemed' | 'bonus' | 'referral';
}): Promise<PointsTransaction[]> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.limit) searchParams.append('limit', String(params.limit));
  if (params?.type) searchParams.append('type', params.type);

  const response = await fetch(`${API_BASE}/loyalty/history?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch points history');
  }
  return response.json();
}

export async function getLoyaltyStats(): Promise<LoyaltyStats> {
  const response = await fetch(`${API_BASE}/loyalty/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch loyalty stats');
  }
  return response.json();
}

export async function redeemPoints(
  points: number
): Promise<{success: boolean; newBalance: number}> {
  const response = await fetch(`${API_BASE}/loyalty/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({points}),
  });
  if (!response.ok) {
    throw new Error('Failed to redeem points');
  }
  return response.json();
}

export async function getReferralInfo(): Promise<{
  code: string;
  link: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalPointsEarned: number;
}> {
  const response = await fetch(`${API_BASE}/loyalty/referral`);
  if (!response.ok) {
    throw new Error('Failed to fetch referral info');
  }
  return response.json();
}

export async function generateReferralCode(): Promise<{code: string; link: string}> {
  const response = await fetch(`${API_BASE}/loyalty/referral/generate`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to generate referral code');
  }
  return response.json();
}

export async function sendReferralInvitation(email: string): Promise<void> {
  const response = await fetch(`${API_BASE}/loyalty/referral/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({email}),
  });
  if (!response.ok) {
    throw new Error('Failed to send referral invitation');
  }
}
