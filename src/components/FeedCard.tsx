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

  const getTagStyle = (type: string) => {
    switch (type) {
      case 'recommend':
        return 'tag-recommend';
      case 'neutral':
        return 'tag-neutral';
      case 'warning':
        return 'tag-warning';
      default:
        return 'tag-neutral';
    }
  };

  const getTagText = (type: string) => {
    switch (type) {
      case 'recommend':
        return '良心推荐';
      case 'neutral':
        return '中肯客观';
      case 'warning':
        return '避雷预警';
      default:
        return '中肯客观';
    }
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
            className="w-full h-48 object-cover bg-bg-gray"
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
                className="w-full h-24 object-cover bg-bg-gray"
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
            className="rounded-lg overflow-hidden cursor-pointer aspect-square relative"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick?.(item.images, idx);
            }}
          >
            <img
              src={img}
              alt={`图片${idx + 1}`}
              className="w-full h-full object-cover bg-bg-gray"
            />
            {imageCount > 3 && idx === 2 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs">
                +{imageCount - 3}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-lg mb-3 overflow-hidden cursor-pointer active:bg-gray-50 transition-colors"
      onClick={() => onCardClick?.(item.id)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full bg-bg-gray overflow-hidden flex-shrink-0 cursor-pointer"
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
                className="font-medium text-text-primary cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onUserClick?.(item.user.id);
                }}
              >
                {item.user.name}
              </span>
              {item.user.title && (
                <span className="text-xs text-text-gray">· {item.user.title}</span>
              )}
            </div>

            <div className="mt-1.5">
              <span className="text-sm text-text-primary font-medium">#{item.tag}</span>
            </div>
          </div>

          <span className={`tag ${getTagStyle(item.type)}`}>
            {getTagText(item.type)}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
            {item.content}
          </p>
        </div>

        {item.location && (
          <div className="mt-2 flex items-center text-xs text-text-gray">
            <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{item.location}</span>
          </div>
        )}

        {renderImages()}

        <div className="mt-3 flex items-center justify-between text-xs text-text-gray">
          <span>{item.date}</span>

          <div className="flex items-center gap-4">
            <button
              onClick={handleComment}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
              <span>{formatNumber(item.comments)}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${
                isLiked ? 'text-warning' : 'hover:text-warning'
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
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
