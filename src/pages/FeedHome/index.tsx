import React, { useState, useRef, useEffect } from 'react';
import FeedCard from '../../components/FeedCard';
import { feedMockData, FeedItem } from '../../types/feed';
import { useNavigate, useLocation } from 'react-router-dom';
import { enrichPostsWithUser } from '../../services/postService';
import { API, request } from '../../services/apiService';

type TabType = 'follow' | 'latest' | 'best' | 'nearby';

const FeedHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const [feedList, setFeedList] = useState<FeedItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: { key: TabType; label: string }[] = [
    { key: 'follow', label: '关注' },
    { key: 'latest', label: '最新' },
    { key: 'best', label: '精华' },
    { key: 'nearby', label: '附近' },
  ];

  const loadPosts = async () => {
    try {
      const [feedData, followData] = await Promise.all([
        request<{ success: boolean; feeds?: any[] }>(API.feeds.list),
        request<{ success: boolean; follows?: any[] }>(API.follows.list),
      ]);

      const followedIds = followData.success && followData.follows
        ? followData.follows.map(f => String(f.targetUserId))
        : [];

      if (feedData.success && feedData.feeds) {
        const apiPosts: FeedItem[] = feedData.feeds.map((feed: any) => ({
          id: Number(feed.id),
          userId: String(feed.userId),
          user: {
            id: Number(feed.userId),
            avatar: feed.avatar || '',
            name: feed.nickname || feed.username || '用户',
            title: '',
            isFollowing: followedIds.includes(String(feed.userId)),
          },
          tag: feed.drinkName ? `#${feed.drinkName}` : '',
          type: feed.type as 'recommend' | 'neutral' | 'warning' || 'neutral',
          content: feed.content || '',
          images: feed.images || [],
          date: feed.createdAt ? new Date(feed.createdAt).toLocaleDateString('zh-CN') : new Date().toLocaleDateString('zh-CN'),
          comments: feed.comments ? feed.comments.length : 0,
          likes: feed.likes || 0,
          isLiked: false,
          shop: feed.shopName || '',
          rating: feed.rating || 3,
          location: feed.location || '',
        }));
        const enrichedPosts = await enrichPostsWithUser([...apiPosts, ...feedMockData], followedIds);
        setFeedList(enrichedPosts);
      } else {
        const enrichedPosts = await enrichPostsWithUser([...feedMockData], followedIds);
        setFeedList(enrichedPosts);
      }
    } catch {
      const enrichedPosts = await enrichPostsWithUser([...feedMockData]);
      setFeedList(enrichedPosts);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [location.key]);

  const filterAndSortFeeds = (feeds: FeedItem[], tab: TabType): FeedItem[] => {
    let result = [...feeds];

    switch (tab) {
      case 'follow':
        result = result.filter((item) => item.user.isFollowing);
        break;
      case 'latest':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'best':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'nearby':
        result = result.filter((item) => item.location);
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      default:
        break;
    }

    return result;
  };

  const displayedFeeds = filterAndSortFeeds(feedList, activeTab);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPosts();
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 1000);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight - scrollTop - clientHeight < 100) {
          handleLoadMore();
        }
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [isLoadingMore]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = () => {
    if (startY.current === 0) return;
  };

  const handleTouchEnd = () => {
    if (startY.current > 60) {
      handleRefresh();
    }
    startY.current = 0;
  };

  const handleImageClick = (images: string[], index: number) => {
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
      console.error('Follow failed');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-cream">
      <div className="flex-shrink-0 bg-white">
        <div className="flex border-b border-border-light">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-primary'
                  : 'text-text-gray'
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

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isRefreshing && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <div className="space-y-3">
          {displayedFeeds.map((item) => (
          <FeedCard
            key={item.id}
            item={item}
            onImageClick={handleImageClick}
            onCardClick={handleCardClick}
            onFollow={handleFollow}
          />
        ))}
        </div>

        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoadingMore && displayedFeeds.length === 0 && (
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

      {showImageViewer && (
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {viewerImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === viewerIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedHome;