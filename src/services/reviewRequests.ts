export interface ReviewRequest {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  userId: string;
  userEmail: string;
  orderDate: string;
  deliveryDate: string;
  reviewEligibleDate: string;
  status: 'pending' | 'sent' | 'completed' | 'expired';
  reminderSent: boolean;
  reminderCount: number;
  createdAt: string;
}

export interface SendReviewRequestParams {
  orderId: string;
  userId: string;
  userEmail: string;
  products: Array<{
    productId: string;
    productName: string;
  }>;
  deliveryDate: string;
}

const API_BASE = '/api';

export async function getReviewRequests(params?: {
  status?: 'pending' | 'sent' | 'completed' | 'expired';
  page?: number;
  limit?: number;
}): Promise<ReviewRequest[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.limit) searchParams.append('limit', String(params.limit));

  const response = await fetch(`${API_BASE}/admin/review-requests?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch review requests');
  }
  return response.json();
}

export async function sendReviewRequest(data: SendReviewRequestParams): Promise<ReviewRequest> {
  const response = await fetch(`${API_BASE}/review-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to send review request');
  }
  return response.json();
}

export async function sendReviewReminder(reviewRequestId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/review-requests/${reviewRequestId}/remind`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to send reminder');
  }
}

export async function scheduleReviewRequests(): Promise<void> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const response = await fetch(`${API_BASE}/review-requests/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eligibleSince: sevenDaysAgo.toISOString(),
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to schedule review requests');
  }
}

export function isReviewEligible(deliveryDate: string, daysAfterDelivery: number = 7): boolean {
  const delivery = new Date(deliveryDate);
  const eligibleDate = new Date(delivery);
  eligibleDate.setDate(eligibleDate.getDate() + daysAfterDelivery);
  return new Date() >= eligibleDate;
}

export function formatReviewEligibleDate(
  deliveryDate: string,
  daysAfterDelivery: number = 7
): string {
  const delivery = new Date(deliveryDate);
  const eligibleDate = new Date(delivery);
  eligibleDate.setDate(eligibleDate.getDate() + daysAfterDelivery);
  return eligibleDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
