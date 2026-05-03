import {useState, useEffect} from 'react';
import {Star, CheckCircle, XCircle, Search, Filter} from 'lucide-react';

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  helpful: number;
  createdAt: string;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export function ReviewModeration() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [filterStatus]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }
      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch {
      // Handle error silently for now
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: 'POST',
      });
      if (response.ok) {
        setReviews(reviews.map(r => (r.id === reviewId ? {...r, status: 'approved'} : r)));
        setSelectedReview(null);
      }
    } catch {
      // Handle error
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: 'POST',
      });
      if (response.ok) {
        setReviews(reviews.map(r => (r.id === reviewId ? {...r, status: 'rejected'} : r)));
        setSelectedReview(null);
      }
    } catch {
      // Handle error
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.userName.toLowerCase().includes(query) ||
      review.productName.toLowerCase().includes(query) ||
      review.title.toLowerCase().includes(query) ||
      review.content.toLowerCase().includes(query)
    );
  });

  const statusCounts = {
    all: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-coffee-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
                    {statusCounts[status]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={review.productImage}
                    alt={review.productName}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{review.title}</h3>
                      <p className="text-sm text-gray-500">{review.productName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{review.content}</p>

                  {review.images.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {review.images.slice(0, 3).map((image, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedReview(review)}
                          className="w-16 h-16 rounded overflow-hidden border border-gray-200 hover:border-gray-300"
                        >
                          <img src={image} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {review.images.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setSelectedReview(review)}
                          className="w-16 h-16 rounded border border-gray-200 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50"
                        >
                          +{review.images.length - 3}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <span>{review.userName}</span>
                    <span>•</span>
                    <span>{review.userEmail}</span>
                    <span>•</span>
                    <span>{formatDate(review.createdAt)}</span>
                    {review.verified && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Verified Purchase
                        </span>
                      </>
                    )}
                  </div>

                  {review.status === 'pending' && (
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )}

                  {review.status === 'approved' && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Approved
                    </div>
                  )}

                  {review.status === 'rejected' && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      Rejected
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Review Details</h2>
                  <p className="text-sm text-gray-500">{selectedReview.productName}</p>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= selectedReview.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {selectedReview.verified && (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Verified Purchase
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{selectedReview.title}</h3>
                  <p className="text-gray-600">{selectedReview.content}</p>
                </div>

                {selectedReview.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReview.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt=""
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Customer:</span>
                    <p className="font-medium text-gray-900">{selectedReview.userName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium text-gray-900">{selectedReview.userEmail}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedReview.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p
                      className={`font-medium ${
                        selectedReview.status === 'approved'
                          ? 'text-green-600'
                          : selectedReview.status === 'rejected'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                      }`}
                    >
                      {selectedReview.status.charAt(0).toUpperCase() +
                        selectedReview.status.slice(1)}
                    </p>
                  </div>
                </div>

                {selectedReview.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(selectedReview.id)}
                      disabled={actionLoading === selectedReview.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedReview.id)}
                      disabled={actionLoading === selectedReview.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
