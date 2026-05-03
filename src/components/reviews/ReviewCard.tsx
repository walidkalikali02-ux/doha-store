import {Star, ThumbsUp, Flag} from 'lucide-react';
import {VerifiedBadge} from './VerifiedBadge';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
  response?: {
    content: string;
    createdAt: string;
  };
}

interface ReviewCardProps {
  review: Review;
  onHelpful?: (reviewId: string) => Promise<void>;
  onReport?: (reviewId: string) => Promise<void>;
}

export function ReviewCard({review, onHelpful, onReport}: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {review.verified && <VerifiedBadge />}
          </div>

          <h4 className="font-medium text-gray-900">{review.title}</h4>
          <p className="mt-2 text-sm text-gray-600">{review.content}</p>

          {review.images && review.images.length > 0 && (
            <div className="mt-4 flex gap-2">
              {review.images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-20 h-20 rounded overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <img
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>{review.userName}</span>
            <span>•</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>

          {review.response && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-coffee-600">
              <p className="text-sm font-medium text-gray-900 mb-1">Response from The Roastery</p>
              <p className="text-sm text-gray-600">{review.response.content}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDate(review.response.createdAt)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onHelpful?.(review.id)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-coffee-600"
        >
          <ThumbsUp className="h-4 w-4" />
          Helpful ({review.helpful})
        </button>
        <button
          type="button"
          onClick={() => onReport?.(review.id)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600"
        >
          <Flag className="h-4 w-4" />
          Report
        </button>
      </div>
    </div>
  );
}
