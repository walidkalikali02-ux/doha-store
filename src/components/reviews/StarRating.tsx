import {useState} from 'react';
import {Star} from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
}

export function StarRating({
  value,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const handleClick = (rating: number) => {
    if (!readonly) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHover(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHover(0);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
          >
            <Star
              className={`${sizes[size]} ${
                filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {value > 0 ? `${value} star${value !== 1 ? 's' : ''}` : 'No rating'}
        </span>
      )}
    </div>
  );
}
