'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ value, size = 16, interactive = false, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const display = interactive && hover > 0 ? hover : value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${star} star`}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= Math.round(display) ? '#F59E0B' : 'none'}
            stroke="#F59E0B"
            strokeWidth="1.5"
          >
            <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9l-6.2 3.4 1.6-6.8L2.2 8.9l6.9-.6L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}