import React from 'react';

interface ReviewCardProps {
  id: number;
  drinkName: string;
  shopName: string;
  image: string;
  rating: number;
  keywords: string[];
  likes: number;
  comments: number;
  isPositive: boolean;
  onClick?: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  drinkName,
  shopName,
  image,
  rating,
  keywords,
  likes,
  comments,
  isPositive,
  onClick,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div 
      className="card p-4 mb-3 cursor-pointer active:scale-[0.98] transition-transform"
      onClick={onClick}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-medium overflow-hidden flex-shrink-0">
          <img 
            src={image} 
            alt={drinkName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-dark-brown truncate">
                {shopName}·{drinkName}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {keywords.slice(0, 3).map((keyword, index) => (
                  <span key={index} className="tag">
                    🏷️{keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className={`text-sm font-medium ${isPositive ? 'text-matcha' : 'text-rose'}`}>
                {isPositive ? '好喝' : '踩雷'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-mid-brown">
              <span className="flex items-center gap-1">
                ❤️ {formatNumber(likes)}
              </span>
              <span className="flex items-center gap-1">
                💬 {formatNumber(comments)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
