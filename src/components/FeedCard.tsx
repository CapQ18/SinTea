import React, { useState } from 'react';
import { FeedItem } from '../types/feed';

interface FeedCardProps {
  item: FeedItem;
  onUserClick?: (userId: number) => void;
  onCardClick?: (itemId: number) => void;
  onImageClick?: (images: string[], index: number) => void;
}

const FeedCard: React.FC<FeedCardProps> = ({
  item,
  onUserClick,
  onCardClick,
  onImageClick,
}) => {
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likes, setLikes] = useState(item.likes);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCardClick?.(item.id);
  };

  const renderImages = () => {
    const imageCount = item.images.length;

    if (imageCount === 0) return null;

    if (imageCount === 1) {
      return (
        <div
          className="mt-3 rounded-lg overflow-hidden cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onImageClick?.(item.images, 0);
          }}
        >
          <img
            src={item.images[0]}
            alt="内容图片"
            className="w-full h-48 object-cover bg-gray-200"
          />
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="mt-3 flex gap-1">
          {item.images.map((img: string, idx: number) => (
            <div
              key={idx}
              className="flex-1 rounded-lg overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onImageClick?.(item.images, idx);
              }}
            >
              <img
                src={img}
                alt={`图片${idx + 1}`}
                className="w-full h-24 object-cover bg-gray-200"
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="mt-3 grid grid-cols-3 gap-1">
        {item.images.slice(0, 3).map((img: string, idx: number) => (
          <div
            key={idx}
            className="rounded-lg overflow-hidden cursor-pointer aspect-square"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick?.(item.images, idx);
            }}
          >
            <img
              src={img}
              alt={`图片${idx + 1}`}
              className="w-full h-full object-cover bg-gray-200"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden cursor-pointer active:bg-gray-50 transition-colors"
      onClick={() => onCardClick?.(item.id)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onUserClick?.(item.user.id);
            }}
          >
            <img
              src={item.user.avatar}
              alt={item.user.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="font-medium text-gray-800 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onUserClick?.(item.user.id);
                }}
              >
                {item.user.name}
              </span>
              {item.user.title && (
                <span className="text-xs text-gray-400">· {item.user.title}</span>
              )}
            </div>

            <div className="mt-2">
              <span className="text-sm text-gray-600">{item.tag}</span>
            </div>
          </div>

          <div
            className={`px-2 py-1 rounded text-xs font-medium text-white ${
              item.type === 'recommend' ? 'bg-green-400' : 'bg-red-400'
            }`}
          >
            {item.type === 'recommend' ? '良心推荐' : '避雷预警'}
          </div>
          {item.type === 'recommend' && item.likes >= 500 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-600">
              🔥 高赞
            </span>
          )}
        </div>

        <div className="mt-3">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {item.content}
          </p>
        </div>

        {renderImages()}

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{item.date}</span>

          <div className="flex items-center gap-4">
            <button
              onClick={handleComment}
              className="flex items-center gap-1 hover:text-orange-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{formatNumber(item.comments)}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${
                isLiked ? 'text-red-500' : 'hover:text-red-500'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{formatNumber(likes)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
