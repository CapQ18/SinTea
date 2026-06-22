import React, { useState } from 'react';
import { FeedItem } from '../types/feed';
import { API, request } from '../services/apiService';

interface FeedCardProps {
  item: FeedItem;
  currentUserId?: number;
  onUserClick?: (userId: number) => void;
  onCardClick?: (itemId: number) => void;
  onImageClick?: (images: string[], index: number) => void;
  onFollow?: (userId: number, isFollowing: boolean) => void;
  onChat?: (userId: number) => void;
  onLike?: (itemId: number, liked: boolean) => void;
  onDelete?: (itemId: number) => void;
}

const FeedCard: React.FC<FeedCardProps> = ({
  item,
  currentUserId,
  onUserClick,
  onCardClick,
  onImageClick,
  onFollow,
  onChat,
  onLike,
  onDelete,
}) => {
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likes, setLikes] = useState(item.likes);
  const [isFollowing, setIsFollowing] = useState(item.user.isFollowing);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwn = currentUserId != null && Number(item.userId) === currentUserId;

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevLiked = isLiked;
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    try {
      const data = await request<{ success: boolean; liked?: boolean; likes?: number }>(
        API.feeds.like(String(item.id)),
        { method: 'POST' }
      );
      if (data.success) {
        setIsLiked(data.liked ?? !prevLiked);
        setLikes(data.likes ?? (prevLiked ? likes - 1 : likes + 1));
      }
    } catch {
      setIsLiked(prevLiked);
      setLikes(likes);
    }
    onLike?.(item.id, !prevLiked);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCardClick?.(item.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    if (!window.confirm('确定删除这条动态吗？')) return;
    setIsDeleting(true);
    try {
      await request(API.feeds.delete(String(item.id)), { method: 'DELETE' });
      onDelete?.(item.id);
    } catch {
      alert('删除失败');
      setIsDeleting(false);
    }
  };

  const getTagStyle = (type: string) => {
    switch (type) {
      case 'recommend': return 'tag-recommend';
      case 'neutral': return 'tag-neutral';
      case 'warning': return 'tag-warning';
      default: return 'tag-neutral';
    }
  };

  const getTagText = (type: string) => {
    switch (type) {
      case 'recommend': return '良心推荐';
      case 'neutral': return '中肯客观';
      case 'warning': return '避雷预警';
      default: return '中肯客观';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, idx) => (
      <svg key={idx} className={`w-4 h-4 ${idx < rating ? 'rating-star' : 'rating-star-empty'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  };

  const renderImages = () => {
    const imageCount = item.imageCount || item.images.length;
    if (imageCount === 0) return null;

    if (item.images.length === 0 && imageCount > 0) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden bg-bg-gray flex items-center justify-center cursor-pointer" style={{ height: 120 }}
          onClick={(e) => { e.stopPropagation(); onCardClick?.(item.id); }}>
          <div className="text-center text-text-gray">
            <svg className="w-8 h-8 mx-auto mb-1 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-xs">{imageCount} 张图片 · 点击查看</span>
          </div>
        </div>
      );
    }

    if (imageCount === 1) {
      return (
        <div className="mt-3 rounded-lg overflow-hidden cursor-pointer" onClick={(e) => { e.stopPropagation(); onImageClick?.(item.images, 0); }}>
          <img src={item.images[0]} alt="" className="w-full h-56 object-cover bg-bg-gray" />
        </div>
      );
    }
    if (imageCount === 2) {
      return (
        <div className="mt-3 flex gap-1">
          {item.images.map((img: string, idx: number) => (
            <div key={idx} className="flex-1 rounded-lg overflow-hidden cursor-pointer" onClick={(e) => { e.stopPropagation(); onImageClick?.(item.images, idx); }}>
              <img src={img} alt="" className="w-full h-28 object-cover bg-bg-gray" />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="mt-3 grid grid-cols-3 gap-1">
        {item.images.slice(0, 3).map((img: string, idx: number) => (
          <div key={idx} className="rounded-lg overflow-hidden cursor-pointer aspect-square relative" onClick={(e) => { e.stopPropagation(); onImageClick?.(item.images, idx); }}>
            <img src={img} alt="" className="w-full h-full object-cover bg-bg-gray" />
            {imageCount > 3 && idx === 2 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs">+{imageCount - 3}</div>}
          </div>
        ))}
      </div>
    );
  };

  const isHighLike = likes >= 500;

  return (
    <div className="bg-white rounded-lg mb-3 overflow-hidden cursor-pointer active:bg-gray-50 transition-all duration-200 shadow-sm relative"
      onClick={() => onCardClick?.(item.id)}>
      {/* Delete button */}
      {isOwn && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-text-gray/50 hover:text-red-500 rounded-full z-10"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
          </svg>
        </button>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary-light to-accent flex-shrink-0 cursor-pointer overflow-hidden ring-2 ring-accent-light"
            onClick={(e) => { e.stopPropagation(); onUserClick?.(item.user.id); }}>
            <img src={item.user.avatar} alt={item.user.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary cursor-pointer hover:text-primary transition-colors"
                onClick={(e) => { e.stopPropagation(); onUserClick?.(item.user.id); }}>
                {item.user.name}
              </span>
              {isHighLike && (
                <span className="like-badge flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                  高赞
                </span>
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-sm font-medium text-primary">#{item.tag}</span>
              <span className={`tag ${getTagStyle(item.type)}`}>{getTagText(item.type)}</span>
            </div>
          </div>

          {!isOwn && (
            <div className="flex items-center gap-1.5">
              <button onClick={(e) => {
                e.stopPropagation();
                setIsFollowing(!isFollowing);
                onFollow?.(item.user.id, isFollowing);
              }}
                className={`px-2.5 py-1 text-xs font-medium rounded-button transition-all ${isFollowing ? 'bg-bg-gray text-text-gray' : 'btn-primary'}`}>
                {isFollowing ? '已关注' : '+ 关注'}
              </button>
              {isFollowing && (
                <button onClick={(e) => {
                  e.stopPropagation();
                  onChat?.(item.user.id);
                }}
                  className="w-7 h-7 flex items-center justify-center text-primary border border-primary rounded-full">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-text-secondary">{item.shop}</span>
            <div className="flex items-center">{renderStars(item.rating)}</div>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
        </div>

        {renderImages()}

        <div className="mt-4 pt-4 border-t border-border-light flex items-center justify-between">
          <span className="text-xs text-text-gray">{item.date}</span>
          <div className="flex items-center gap-5">
            <button onClick={handleComment} className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <svg className="w-5 h-5 text-text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>
              <span className="text-xs text-text-gray">{formatNumber(item.comments)}</span>
            </button>
            <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-warning' : 'hover:text-warning'}`}>
              <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
              <span className="text-xs">{formatNumber(likes)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
