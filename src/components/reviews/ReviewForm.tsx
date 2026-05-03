import {useState} from 'react';
import {StarRating} from './StarRating';
import {ReviewImageUpload} from './ReviewImageUpload';

interface ReviewFormProps {
  productName: string;
  productImage?: string;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  images: string[];
  pros?: string[];
  cons?: string[];
}

export function ReviewForm({productName, productImage, onSubmit, onCancel}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [pros, setPros] = useState<string[]>(['']);
  const [cons, setCons] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }
    if (content.trim().length < 20) {
      setError('Review must be at least 20 characters');
      return;
    }

    setSubmitting(true);
    setError(null);

    const filteredPros = pros.filter(p => p.trim().length > 0);
    const filteredCons = cons.filter(c => c.trim().length > 0);

    try {
      await onSubmit({
        rating,
        title: title.trim(),
        content: content.trim(),
        images,
        ...(filteredPros.length > 0 ? {pros: filteredPros} : {}),
        ...(filteredCons.length > 0 ? {cons: filteredCons} : {}),
      });
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const addProField = () => setPros([...pros, '']);
  const addConField = () => setCons([...cons, '']);
  const removeProField = (index: number) => setPros(pros.filter((_, i) => i !== index));
  const removeConField = (index: number) => setCons(cons.filter((_, i) => i !== index));
  const updatePro = (index: number, value: string) => {
    const newPros = [...pros];
    newPros[index] = value;
    setPros(newPros);
  };
  const updateCon = (index: number, value: string) => {
    const newCons = [...cons];
    newCons[index] = value;
    setCons(newCons);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-start gap-4">
        {productImage && (
          <img src={productImage} alt={productName} className="w-20 h-20 object-cover rounded-lg" />
        )}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{productName}</h3>
          <p className="text-sm text-gray-500">Share your thoughts with other customers</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating === 0 && (
          <p className="mt-1 text-sm text-gray-500">Click the stars to rate this product</p>
        )}
      </div>

      <div>
        <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-1">
          Review Title *
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Summarize your review"
          maxLength={100}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
        />
        <p className="mt-1 text-xs text-gray-500">{title.length}/100 characters</p>
      </div>

      <div>
        <label htmlFor="review-content" className="block text-sm font-medium text-gray-700 mb-1">
          Your Review *
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What did you like or dislike about this product?"
          rows={5}
          maxLength={2000}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">{content.length}/2000 characters (minimum 20)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Photos (optional)
        </label>
        <ReviewImageUpload images={images} onImagesChange={setImages} maxImages={5} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Pros (optional)</label>
          <button
            type="button"
            onClick={addProField}
            className="text-sm text-coffee-600 hover:text-coffee-700"
          >
            + Add Pro
          </button>
        </div>
        <div className="space-y-2">
          {pros.map((pro, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={pro}
                onChange={e => updatePro(index, e.target.value)}
                placeholder="What did you like?"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
              />
              {pros.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProField(index)}
                  className="px-3 py-2 text-gray-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Cons (optional)</label>
          <button
            type="button"
            onClick={addConField}
            className="text-sm text-coffee-600 hover:text-coffee-700"
          >
            + Add Con
          </button>
        </div>
        <div className="space-y-2">
          {cons.map((con, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={con}
                onChange={e => updateCon(index, e.target.value)}
                placeholder="What could be improved?"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 text-sm"
              />
              {cons.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeConField(index)}
                  className="px-3 py-2 text-gray-500 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
