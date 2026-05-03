import {useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {ReviewCard} from './ReviewCard';

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

interface ReviewsListProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onHelpful?: (reviewId: string) => Promise<void>;
  onReport?: (reviewId: string) => Promise<void>;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
type FilterOption = 'all' | 'verified' | 'with-photos';

export function ReviewsList({
  reviews,
  averageRating,
  totalReviews,
  onHelpful,
  onReport,
}: ReviewsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions: Array<{value: SortOption; label: string}> = [
    {value: 'newest', label: 'Newest First'},
    {value: 'oldest', label: 'Oldest First'},
    {value: 'highest', label: 'Highest Rated'},
    {value: 'lowest', label: 'Lowest Rated'},
    {value: 'helpful', label: 'Most Helpful'},
  ];

  const filterOptions: Array<{value: FilterOption; label: string}> = [
    {value: 'all', label: 'All Reviews'},
    {value: 'verified', label: 'Verified Purchases'},
    {value: 'with-photos', label: 'With Photos'},
  ];

  const filteredReviews = reviews.filter(review => {
    if (filterBy === 'verified') return review.verified;
    if (filterBy === 'with-photos') return review.images && review.images.length > 0;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => {
                const filled = star <= Math.round(averageRating);
                return (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                );
              })}
            </div>
            <span className="text-sm text-gray-600">{averageRating.toFixed(1)} out of 5</span>
            <span className="text-sm text-gray-500">({totalReviews} reviews)</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700"
        >
          Sort & Filter
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
            <select
              value={filterBy}
              onChange={e => setFilterBy(e.target.value as FilterOption)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No reviews match your filters</div>
        ) : (
          sortedReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              {...(onHelpful && {onHelpful})}
              {...(onReport && {onReport})}
            />
          ))
        )}
      </div>
    </div>
  );
}
