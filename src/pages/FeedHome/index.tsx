import React, { useState, useRef, useEffect } from 'react';
import FeedCard from '../../components/FeedCard';
import { feedMockData, FeedItem } from '../../types/feed';

type TabType = 'follow' | 'latest' | 'best' | 'nearby';

const FeedHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const [feedList] = useState<FeedItem[]>(feedMockData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

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

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex-shrink-0 bg-white">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-amber-600'
                  : 'text-gray-400'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isRefreshing && (
          <div className="flex justify-center py-2 mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
              <span>正在刷新...</span>
            </div>
          </div>
        )}

        {displayedFeeds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl mb-4">
              📭
            </div>
            <p className="text-gray-500 text-sm">
              {activeTab === 'follow' ? '还没有关注的人发的评价' : '暂无内容'}
            </p>
          </div>
        ) : (
          displayedFeeds.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              onCardClick={(id) => console.log('查看详情:', id)}
              onUserClick={(userId) => console.log('查看用户:', userId)}
              onImageClick={handleImageClick}
            />
          ))
        )}

        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}

        {!isLoadingMore && displayedFeeds.length > 0 && (
          <div className="text-center py-4 text-xs text-gray-400">
            — 已加载全部内容 —
          </div>
        )}
      </div>

      {showImageViewer && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setShowImageViewer(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl"
            onClick={() => setShowImageViewer(false)}
          >
            ✕
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
