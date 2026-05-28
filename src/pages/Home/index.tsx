import React, { useState, useEffect, useRef } from 'react';
import ReviewCard from '../../components/ReviewCard';
import IPCharacter from '../../components/IPCharacter';
import { mockReviews } from '../../mock';

const Home: React.FC = () => {
  const [reviews] = useState(mockReviews);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'hot'>('time');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const pullDistance = useRef(0);

  const filteredReviews = reviews
    .filter(
      (r) =>
        r.drinkName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.shopName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'hot') {
        return b.likes - a.likes;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const loadMore = () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHasMore(false);
    }, 1000);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setShowScrollTop(scrollTop > 300);
      
      const list = listRef.current;
      if (list && !loading && hasMore) {
        const { scrollHeight, scrollTop: listScrollTop, clientHeight } = list;
        if (scrollHeight - listScrollTop - clientHeight < 100) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY;
    const distance = startY.current - currentY.current;
    if (distance < 0 && window.scrollY === 0) {
      pullDistance.current = Math.abs(distance);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance.current > 50) {
      handleRefresh();
    }
    pullDistance.current = 0;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 bg-cream z-40 pt-4 pb-2 px-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索饮品或店铺..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-button bg-white border border-border text-dark-brown placeholder:text-gray focus:outline-none focus:border-milk-tea transition-colors"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray">
            🔍
          </span>
        </div>

        <div className="flex gap-3 mt-3">
          <button
            onClick={() => setSortBy('time')}
            className={`px-4 py-2 rounded-button text-sm font-medium transition-all ${
              sortBy === 'time'
                ? 'bg-milk-tea text-dark-brown'
                : 'bg-white text-mid-brown'
            }`}
          >
            ⏰ 时间排序
          </button>
          <button
            onClick={() => setSortBy('hot')}
            className={`px-4 py-2 rounded-button text-sm font-medium transition-all ${
              sortBy === 'hot'
                ? 'bg-milk-tea text-dark-brown'
                : 'bg-white text-mid-brown'
            }`}
          >
            🔥 热度排序
          </button>
        </div>
      </header>

      <div
        ref={listRef}
        className="px-4 mt-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isRefreshing && (
          <div className="flex flex-col items-center py-4">
            <IPCharacter size="small" state="loading" />
            <span className="text-sm text-mid-brown mt-2">正在刷新...</span>
          </div>
        )}

        {filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <IPCharacter size="large" state="sleepy" />
            <p className="text-mid-brown mt-4">还没有评价</p>
            <button className="mt-4 px-6 py-2 bg-milk-tea rounded-button text-dark-brown font-medium">
              发布第一条评价
            </button>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard key={review.id} {...review} />
          ))
        )}

        {loading && filteredReviews.length > 0 && (
          <div className="flex justify-center py-4">
            <IPCharacter size="small" state="loading" />
          </div>
        )}

        {!hasMore && filteredReviews.length > 0 && (
          <div className="text-center py-4 text-mid-brown text-sm">
            —— 已经到底了 ——
          </div>
        )}
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 w-10 h-10 bg-milk-tea rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Home;
