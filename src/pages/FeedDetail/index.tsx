import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Comment } from '../../types/feed';
import { API, request } from '../../services/apiService';

interface FeedDetailItem {
  id: number;
  userId: number;
  user: {
    id: number;
    avatar: string;
    name: string;
    title?: string;
    isFollowing: boolean;
  };
  tag: string;
  type: 'recommend' | 'neutral' | 'warning';
  content: string;
  images: string[];
  date: string;
  comments: Comment[];
  likes: number;
  isLiked: boolean;
  shop: string;
  rating: number;
  location: string;
  sweetness: number;
  tea: number;
  milk: number;
  taste: number;
  coolness: number;
  appearance: number;
}

const FeedDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'content' | 'comments'>('content');
  const [item, setItem] = useState<FeedDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setIsLoading(true);
    try {
      const response = await request<{ success: boolean; feed?: any }>(API.feeds.get(id || '0'));
      if (response.success && response.feed) {
        const feed = response.feed;
        setItem({
          id: Number(feed.id),
          userId: Number(feed.userId),
          user: {
            id: Number(feed.userId),
            avatar: feed.avatar || '',
            name: feed.nickname || feed.username || '用户',
            title: '',
            isFollowing: false,
          },
          tag: feed.drinkName ? `#${feed.drinkName}` : '',
          type: feed.type as 'recommend' | 'neutral' | 'warning' || 'neutral',
          content: feed.content || '',
          images: feed.images || [],
          date: feed.createdAt ? new Date(feed.createdAt).toLocaleDateString('zh-CN') : new Date().toLocaleDateString('zh-CN'),
          comments: (feed.comments || []).map((c: any) => ({
            id: Number(c.id),
            user: { avatar: c.avatar || '', name: c.nickname || c.username || '用户' },
            content: c.content || '',
            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('zh-CN') : '刚刚',
            likes: c.likes || 0,
          })),
          likes: feed.likes || 0,
          isLiked: false,
          shop: feed.shopName || '',
          rating: feed.rating || 3,
          location: feed.location || '',
          sweetness: feed.sweetness || 50,
          tea: feed.tea || 50,
          milk: feed.milk || 50,
          taste: feed.taste || 50,
          coolness: feed.coolness || 50,
          appearance: feed.appearance || 50,
        });
        setIsFollowing(false);
        setIsLiked(false);
        setLikes(feed.likes || 0);
        setComments((feed.comments || []).map((c: any) => ({
          id: Number(c.id),
          user: { avatar: c.avatar || '', name: c.nickname || c.username || '用户' },
          content: c.content || '',
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('zh-CN') : '刚刚',
          likes: c.likes || 0,
        })));
      }
    } catch {
      console.error('Failed to load feed detail');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleFollow = async () => {
    if (!item) return;
    try {
      if (isFollowing) {
        await request<{ success: boolean }>(API.follows.delete, {
          method: 'DELETE',
          body: JSON.stringify({ targetUserId: item.userId }),
        });
      } else {
        await request<{ success: boolean }>(API.follows.create, {
          method: 'POST',
          body: JSON.stringify({ targetUserId: item.userId }),
        });
      }
      setIsFollowing(!isFollowing);
    } catch {
      console.error('Follow failed');
    }
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    setComments([
      {
        id: Date.now(),
        user: { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me', name: '我' },
        content: newComment,
        date: '刚刚',
        likes: 0,
      },
      ...comments,
    ]);
    setNewComment('');
  };

  const handleImageClick = (index: number) => {
    setViewerIndex(index);
    setShowImageViewer(true);
  };

  const renderRadarChart = () => {
    if (!item) return null;

    const labels = ['甜度', '茶味', '奶味', '口感', '凉度', '颜值'];
    const values = [item.sweetness, item.tea, item.milk, item.taste, item.coolness, item.appearance];
    const centerX = 100;
    const centerY = 100;
    const radius = 60;
    const levels = 5;

    const getPoint = (index: number, value: number, maxRadius: number) => {
      const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
      const r = (value / 100) * maxRadius;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      };
    };

    const levelPaths = [];
    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius / levels) * i;
      let path = '';
      for (let j = 0; j < 6; j++) {
        const point = getPoint(j, (i / levels) * 100, levelRadius);
        path += j === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`;
      }
      path += ' Z';
      levelPaths.push(<path key={i} d={path} fill="none" stroke="#E8E8E8" strokeWidth="1" />);
    }

    const axisLines = labels.map((_, index) => {
      const point = getPoint(index, 100, radius);
      return (
        <line
          key={index}
          x1={centerX}
          y1={centerY}
          x2={point.x}
          y2={point.y}
          stroke="#E8E8E8"
          strokeWidth="1"
        />
      );
    });

    const dataPoints = values.map((value, index) => getPoint(index, value, radius));
    const dataPath = `M ${dataPoints[0].x} ${dataPoints[0].y}` + 
      dataPoints.slice(1).map(p => ` L ${p.x} ${p.y}`).join('') + ' Z';

    const labelPoints = labels.map((label, index) => {
      const point = getPoint(index, 115, radius);
      return (
        <text
          key={index}
          x={point.x}
          y={point.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-text-gray"
        >
          {label}
        </text>
      );
    });

    return (
      <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
        {levelPaths}
        {axisLines}
        <path
          d={dataPath}
          fill="rgba(139, 115, 85, 0.2)"
          stroke="#8B7355"
          strokeWidth="2"
        />
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#8B7355"
          />
        ))}
        {labelPoints}
      </svg>
    );
  };

  const renderImages = () => {
    if (!item || item.images.length === 0) return null;

    if (item.images.length === 1) {
      return (
        <div
          className="mt-4 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => handleImageClick(0)}
        >
          <img
            src={item.images[0]}
            alt="内容图片"
            className="w-full h-52 object-cover bg-bg-gray"
          />
        </div>
      );
    }

    return (
      <div className="mt-4 grid grid-cols-3 gap-1">
        {item.images.slice(0, 6).map((img, idx) => (
          <div
            key={idx}
            className="rounded-lg overflow-hidden cursor-pointer aspect-square relative"
            onClick={() => handleImageClick(idx)}
          >
            <img
              src={img}
              alt={`图片${idx + 1}`}
              className="w-full h-full object-cover bg-bg-gray"
            />
            {item.images.length > 6 && idx === 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm">
                +{item.images.length - 6}
              </div>
            )}
          </div>
        ))}
      </div>
    );
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <header className="bg-white px-4 py-3 flex items-center gap-3 border-b border-border-light">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-text-secondary rounded-full hover:bg-bg-gray transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-text-primary">评价详情</h1>
        </header>
        <div className="flex-1 flex items-center justify-center text-text-gray">
          动态不存在
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center gap-3 border-b border-border-light sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-text-secondary rounded-full hover:bg-bg-gray transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-text-primary">评价详情</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="bg-white">
          <div className="flex border-b border-border-light">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'content' ? 'text-primary' : 'text-text-gray'
              }`}
            >
              正文
              {activeTab === 'content' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'comments' ? 'text-primary' : 'text-text-gray'
              }`}
            >
              评论
              {activeTab === 'comments' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'content' && (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-bg-gray overflow-hidden flex-shrink-0">
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{item.user.name}</span>
                    <button
                      onClick={handleFollow}
                      className={`px-3 py-1 rounded-button text-xs font-medium transition-colors ${
                        isFollowing
                          ? 'bg-bg-gray text-text-secondary'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {isFollowing ? '已关注' : '关注'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {item.user.title && (
                      <span className="text-xs text-text-gray">{item.user.title}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary font-medium">#{item.tag}</span>
                  <span className={`tag ${getTagStyle(item.type)}`}>
                    {getTagText(item.type)}
                  </span>
                </div>

                <p className="mt-3 text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>

              <div className="mt-4">
                <span className="text-sm text-text-primary font-medium">奶茶DNA</span>
                {renderRadarChart()}
              </div>

              {renderImages()}

              <div className="mt-4 pt-4 border-t border-border-light flex items-center justify-between">
                <span className="text-xs text-text-gray">{item.date}</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      isLiked ? 'text-warning' : 'text-text-gray hover:text-warning'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                    <span>{formatNumber(likes)}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-sm text-text-gray">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                    </svg>
                    <span>{formatNumber(comments.length)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-text-primary">评论 {formatNumber(comments.length)}</span>
              </div>

              {comments.length === 0 ? (
                <div className="text-center py-12 text-text-gray text-sm">
                  还没有评论，快来抢沙发~
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-bg-gray overflow-hidden flex-shrink-0">
                        <img
                          src={comment.user.avatar}
                          alt={comment.user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{comment.user.name}</span>
                          <span className="text-xs text-text-gray">{comment.date}</span>
                        </div>
                        <p className="mt-1.5 text-sm text-text-secondary">{comment.content}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <button className="text-xs text-text-gray hover:text-primary transition-colors">
                            回复
                          </button>
                          <button className="flex items-center gap-1 text-xs text-text-gray hover:text-warning transition-colors">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                            <span>{formatNumber(comment.likes || 0)}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {activeTab === 'comments' && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-border-light px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="说点什么"
            className="flex-1 h-10 px-4 rounded-button bg-bg-gray text-sm outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
          />
          <button
            onClick={handleSendComment}
            disabled={!newComment.trim()}
            className={`px-4 py-2 rounded-button text-sm font-medium transition-colors ${
              newComment.trim()
                ? 'bg-primary text-white active:scale-95'
                : 'bg-bg-gray text-text-gray cursor-not-allowed'
            }`}
          >
            发送
          </button>
        </div>
      )}

      {showImageViewer && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setShowImageViewer(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white z-10"
            onClick={() => setShowImageViewer(false)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <img
            src={item.images[viewerIndex]}
            alt={`图片 ${viewerIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {item.images.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 text-center text-white text-sm">
              {viewerIndex + 1} / {item.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedDetail;
