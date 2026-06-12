import React, { useState, useRef, useEffect } from 'react';
import FeedCard from '../../components/FeedCard';
import { feedMockData, FeedItem } from '../../types/feed';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../../services/postService';

type TabType = 'follow' | 'latest' | 'best' | 'nearby';

const FeedHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const [feedList, setFeedList] = useState<FeedItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  useEffect(() => {
    const userPosts = getPosts();
    setFeedList([...userPosts, ...feedMockData]);
  }, []);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const navigate = useNavigate();

  const tabs: { key: TabType; label: string }[] = [
    { key: 'follow', label: '关注' },
    { key: 'latest', label: '最新' },
    { key: 'best', label: '精华' },
    { key: 'nearby', label: '附近' },
  ];

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
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
          <div className="flex justify-center py-3 mb-2">
            <div className="flex items-center gap-2 text-sm text-text-gray">
              <div className="w-4 h-4 border-2 border-text-gray border-t-primary rounded-full animate-spin" />
              <span>正在刷新...</span>
            </div>
          </div>
        )}

        {displayedFeeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-bg-gray flex items-center justify-center text-3xl mb-4">
              📭
            </div>
            <p className="text-text-gray text-sm">
              {activeTab === 'follow' ? '还没有关注的人' : '暂无内容'}
            </p>
          </div>
        ) : (
          displayedFeeds.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              onCardClick={handleCardClick}
              onUserClick={(userId) => console.log('查看用户:', userId)}
              onImageClick={handleImageClick}
            />
          ))
        )}

        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-text-gray border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {!isLoadingMore && displayedFeeds.length > 0 && (
          <div className="text-center py-4 text-xs text-text-gray">
            — 已加载全部内容 —
          </div>
        )}
      </div>

      {showImageViewer && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setShowImageViewer(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
            onClick={() => setShowImageViewer(false)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={viewerImages[viewerIndex]}
              alt={`图片 ${viewerIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {viewerImages.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 text-center text-white text-sm">
              {viewerIndex + 1} / {viewerImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedHome;
