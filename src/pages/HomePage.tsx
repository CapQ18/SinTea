import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Review, Category } from '../types';
import { getReviews } from '../services/mockData';
import ReviewCard from '../components/ReviewCard';
import MilkTeaSprite from '../components/MilkTeaSprite';

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'milk-tea', label: '奶茶' },
  { key: 'fruit-tea', label: '果茶' },
  { key: 'coffee', label: '咖啡' },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<Category>('all');
  const [, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchReviews = async (pageNum: number, cat: Category, refresh = false) => {
    if (loading && !refresh) return;
    if (!hasMore && !refresh) return;
    
    setLoading(true);
    try {
      const result = await getReviews(pageNum, cat);
      if (refresh) {
        setReviews(result.data);
      } else {
        setReviews(prev => [...prev, ...result.data]);
      }
      setHasMore(result.data.length === result.pageSize);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setReviews([]);
    fetchReviews(1, category, true);
  }, [category]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current && !loading && hasMore) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight - scrollTop - clientHeight < 200) {
          setPage(prev => {
            const nextPage = prev + 1;
            fetchReviews(nextPage, category);
            return nextPage;
          });
        }
      }
    };

    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [loading, hasMore, category]);

  

  const filteredReviews = reviews.filter(r => 
    r.drinkName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.shopName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-milk-tea-200">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <MilkTeaSprite size="small" animate={false} />
            <div>
              <h1 className="text-xl font-bold text-dark-brown">SinTea</h1>
              <p className="text-xs text-gray-500">每一杯奶茶都值得被真实记录</p>
            </div>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="搜索奶茶或店铺..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-milk-tea-50 rounded-full border-none focus:ring-2 focus:ring-milk-tea-400 outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat.key
                  ? 'bg-milk-tea-500 text-white'
                  : 'bg-white text-dark-brown hover:bg-milk-tea-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="px-4 py-4 space-y-4 overflow-y-auto"
        style={{ height: 'calc(100vh - 200px)' }}
      >
        {refreshing && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-milk-tea-600">
              <div className="w-5 h-5 border-2 border-milk-tea-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">刷新中...</span>
            </div>
          </div>
        )}

        {!loading && filteredReviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <MilkTeaSprite emotion="happy" size="large" />
            <p className="mt-4 text-lg font-medium text-dark-brown">还没有评价</p>
            <p className="text-sm text-gray-500 text-center mt-2">成为第一个分享的人吧！</p>
            <button 
              onClick={() => navigate('/post')}
              className="mt-6 px-6 py-3 bg-milk-tea-500 text-white rounded-full font-medium shadow-lg hover:bg-milk-tea-600 transition-colors"
            >
              发布第一条评价
            </button>
          </div>
        )}

        {filteredReviews.map(review => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            onClick={() => {}} 
          />
        ))}

        {loading && !refreshing && (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-milk-tea-600">
              <div className="w-5 h-5 border-2 border-milk-tea-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">加载中...</span>
            </div>
          </div>
        )}

        {!loading && !hasMore && reviews.length > 0 && (
          <div className="text-center py-4 text-gray-400 text-sm">
            - 已加载全部内容 -
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
