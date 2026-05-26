import React from 'react';
import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
  onClick: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer fade-in"
    >
      <div className="flex gap-4">
        <div className="w-28 h-28 flex-shrink-0">
          <img 
            src={review.image} 
            alt={review.drinkName}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-semibold text-dark-brown truncate">{review.drinkName}</h3>
            <p className="text-sm text-gray-500 truncate">{review.shopName}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {review.keywords.slice(0, 3).map((keyword, idx) => (
                <span 
                  key={idx}
                  className={`text-xs px-2 py-1 rounded-full ${
                    review.isPositive 
                      ? 'bg-matcha-100 text-matcha-700' 
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <svg 
                  key={idx}
                  className={`w-4 h-4 ${idx < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {review.likes}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {review.comments}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
