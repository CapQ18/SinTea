import React, { useState, useEffect } from 'react';
import FeedCard from '../../components/FeedCard';
import { FeedItem } from '../../types/feed';
import { useNavigate, useLocation } from 'react-router-dom';
import { API, request } from '../../services/apiService';

type TabType = 'follow' | 'latest' | 'best';

const FeedHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const [feedList, setFeedList] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: { key: TabType; label: string }[] = [
    { key: 'follow', label: '关注' },
    { key: 'latest', label: '最新' },
    { key: 'best', label: '精华' },
  ];

  const loadUnreadCount = async () => {
    try {
      const data = await request<{ success: boolean; unreadCount?: number }>(
        API.notifications.unreadCount
      );
      if (data.success) setUnreadNotifs(data.unreadCount || 0);
    } catch { /* ignore */ }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      // 获取关注列表
      let followedIds: number[] = [];
      try {
        const followData = await request<{ success: boolean; follows?: any[] }>(API.follows.list);
        if (followData.success && followData.follows) {
          followedIds = followData.follows.map((f: any) => f.id || f.targetUserId);
        }
      } catch { /* 未登录忽略 */ }

      // 根据标签选择排序方式
      const sort = activeTab === 'best' ? 'hot' : 'new';
      const feedData = await request<{
        success: boolean;
        feeds?: any[];
        total?: number;
        hasMore?: boolean;
      }>(`${API.feeds.list}?sort=${sort}`);

      if (feedData.success && feedData.feeds) {
        const apiPosts: FeedItem[] = feedData.feeds.map((feed: any) => ({
          id: Number(feed.id),
          userId: String(feed.userId),
          user: {
            id: Number(feed.userId),
            avatar: feed.avatar || '',
            name: feed.nickname || feed.username || '用户',
            title: '',
            isFollowing: followedIds.includes(Number(feed.userId)),
          },
          tag: feed.drinkName ? `#${feed.drinkName}` : '',
          type: (feed.type as 'recommend' | 'neutral' | 'warning') || 'neutral',
          content: feed.content || '',
          images: feed.images || [],
          imageCount: feed.imageCount || 0,
          date: feed.createdAt
            ? new Date(feed.createdAt).toLocaleDateString('zh-CN')
            : new Date().toLocaleDateString('zh-CN'),
          comments: feed.comments ? feed.comments.length : 0,
          likes: feed.likes || 0,
          isLiked: false,
          shop: feed.shopName || '',
          rating: feed.rating || 3,
          location: feed.location || '',
        }));
        setFeedList(apiPosts);
      } else {
        setFeedList([]);
      }
    } catch {
      setFeedList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    loadUnreadCount();
  }, [location.key, activeTab]);

  const displayFeeds =
    activeTab === 'follow'
      ? feedList.filter((item) => item.user.isFollowing)
      : feedList;

  const handleImageClick = (images: string[], index: number) => {
    if (images.length === 0) return; // 列表无图片数据，不能预览
    setViewerImages(images);
    setViewerIndex(index);
    setShowImageViewer(true);
  };

  const handleCardClick = (id: number) => {
    navigate(`/detail/${id}`);
  };

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await request<{ success: boolean }>(API.follows.delete, {
          method: 'DELETE',
          body: JSON.stringify({ targetUserId: userId }),
        });
      } else {
        await request<{ success: boolean }>(API.follows.create, {
          method: 'POST',
          body: JSON.stringify({ targetUserId: userId }),
        });
      }
      loadPosts();
    } catch {
      // ignore
    }
  };

  return (
    <div className="h-screen flex flex-col bg-cream">
      {/* 顶部栏：搜索 + 通知 */}
      <div className="flex-shrink-0 bg-white px-4 py-2 flex items-center justify-between border-b border-border-light">
        <h1 className="text-lg font-bold text-primary">SinTea</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/search')}
            className="w-9 h-9 flex items-center justify-center text-text-gray rounded-full hover:bg-bg-gray"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="relative w-9 h-9 flex items-center justify-center text-text-gray rounded-full hover:bg-bg-gray"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                {unreadNotifs > 99 ? '99+' : unreadNotifs}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 bg-white">
        <div className="flex border-b border-border-light">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key ? 'text-primary' : 'text-text-gray'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-3">
          {displayFeeds.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              onImageClick={handleImageClick}
              onCardClick={handleCardClick}
              onFollow={handleFollow}
            />
          ))}
        </div>

        {!loading && displayFeeds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-gray">
            <svg className="w-16 h-16 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
              <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
            </svg>
            <p className="text-sm">暂无评价内容</p>
            <button
              onClick={() => navigate('/post')}
              className="mt-3 px-4 py-2 bg-primary text-white text-sm rounded-button"
            >
              去发布第一条评价
            </button>
          </div>
        )}
      </div>

      {showImageViewer && viewerImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowImageViewer(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
            onClick={() => setShowImageViewer(false)}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
            onClick={(e) => {
              e.stopPropagation();
              setViewerIndex((prev) => (prev > 0 ? prev - 1 : viewerImages.length - 1));
            }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img
            src={viewerImages[viewerIndex]}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
            onClick={(e) => {
              e.stopPropagation();
              setViewerIndex((prev) => (prev < viewerImages.length - 1 ? prev + 1 : 0));
            }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedHome;
