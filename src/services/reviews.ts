import type {Review} from '@/types';

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  pros?: string[];
  cons?: string[];
}

export interface ReviewSearchParams {
  productId?: string;
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  page?: number;
  limit?: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

const API_BASE = '/api';

export async function getReviews(params: ReviewSearchParams): Promise<Review[]> {
  const searchParams = new URLSearchParams();
  if (params.productId) searchParams.append('productId', params.productId);
  if (params.userId) searchParams.append('userId', params.userId);
  if (params.status) searchParams.append('status', params.status);
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const response = await fetch(`${API_BASE}/reviews?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  return response.json();
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const response = await fetch(`${API_BASE}/reviews/stats?productId=${productId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch review stats');
  }
  return response.json();
}

export async function createReview(data: CreateReviewRequest): Promise<Review> {
  const response = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create review');
  }
  return response.json();
}

export async function markReviewHelpful(reviewId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to mark review as helpful');
  }
}

export async function reportReview(reviewId: string, reason: string): Promise<void> {
  const response = await fetch(`${API_BASE}/reviews/${reviewId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({reason}),
  });
  if (!response.ok) {
    throw new Error('Failed to report review');
  }
}

export async function getAdminReviews(params: {
  status?: 'pending' | 'approved' | 'rejected';
  page?: number;
  limit?: number;
}): Promise<Review[]> {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.append('status', params.status);
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const response = await fetch(`${API_BASE}/admin/reviews?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch admin reviews');
  }
  return response.json();
}

export async function approveReview(reviewId: string): Promise<Review> {
  const response = await fetch(`${API_BASE}/admin/reviews/${reviewId}/approve`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to approve review');
  }
  return response.json();
}

export async function rejectReview(reviewId: string): Promise<Review> {
  const response = await fetch(`${API_BASE}/admin/reviews/${reviewId}/reject`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to reject review');
  }
  return response.json();
}
