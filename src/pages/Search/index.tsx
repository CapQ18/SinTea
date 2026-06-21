import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, request } from '../../services/apiService';

type SearchType = 'all' | 'feeds' | 'shops' | 'drinks';

interface SearchResult {
  feeds?: any[];
  shops?: any[];
  drinks?: any[];
}

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    try {
      const data = await request<{ success: boolean; results?: SearchResult }>(
        `${API.search}?q=${encodeURIComponent(q)}&type=${searchType}`
      );
      if (data.success && data.results) {
        setResults(data.results);
      } else {
        setError('未找到相关内容');
      }
    } catch {
      setError('搜索失败，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  const types: { key: SearchType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'feeds', label: '动态' },
    { key: 'shops', label: '店铺' },
    { key: 'drinks', label: '饮品' },
  ];

  const totalCount =
    (results?.feeds?.length || 0) +
    (results?.shops?.length || 0) +
    (results?.drinks?.length || 0);

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* 搜索栏 */}
      <header className="sticky top-0 bg-white z-40 px-4 py-3 border-b border-border-light">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-text-secondary rounded-full hover:bg-bg-gray"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索奶茶、店铺…"
              className="w-full h-10 pl-4 pr-10 bg-bg-gray rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-text-gray"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </div>
        </div>

        {/* 类型切换 */}
        <div className="flex gap-2 mt-3">
          {types.map((t) => (
            <button
              key={t.key}
              onClick={() => setSearchType(t.key)}
              className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                searchType === t.key
                  ? 'bg-primary text-white'
                  : 'bg-bg-gray text-text-gray'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* 结果 */}
      <div className="px-4 pt-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-text-gray text-sm">{error}</div>
        )}

        {results && !error && (
          <>
            {totalCount > 0 && (
              <p className="text-xs text-text-gray mb-3">
                找到 {totalCount} 条结果
              </p>
            )}

            {/* 动态 */}
            {results.feeds && results.feeds.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2">动态</h3>
                <div className="space-y-2">
                  {results.feeds.map((feed: any) => (
                    <div
                      key={feed.id}
                      className="bg-white rounded-lg p-3 cursor-pointer active:scale-[0.99]"
                      onClick={() => navigate(`/detail/${feed.id}`)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <img src={feed.avatar} alt="" className="w-5 h-5 rounded-full" />
                        <span className="text-xs font-medium">{feed.nickname || feed.username}</span>
                        <span className="text-xs text-text-gray">#{feed.drinkName}</span>
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-2">{feed.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 店铺 */}
            {results.shops && results.shops.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-text-primary mb-2">店铺</h3>
                <div className="space-y-2">
                  {results.shops.map((shop: any) => (
                    <div
                      key={shop.id}
                      className="bg-white rounded-lg p-3 cursor-pointer active:scale-[0.99]"
                      onClick={() => navigate(`/shop/${shop.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{shop.name}</span>
                        {shop.rating > 0 && (
                          <span className="text-xs text-yellow-500">⭐ {shop.rating}</span>
                        )}
                      </div>
                      {shop.address && (
                        <p className="text-xs text-text-gray mt-0.5">{shop.address}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 饮品 */}
            {results.drinks && results.drinks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-2">饮品</h3>
                <div className="space-y-2">
                  {results.drinks.map((drink: any) => (
                    <div
                      key={drink.id}
                      className="bg-white rounded-lg p-3 flex gap-3 cursor-pointer active:scale-[0.99]"
                      onClick={() => navigate(`/shop/${drink.shopId}`)}
                    >
                      {drink.imageUrl && (
                        <img src={drink.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                      )}
                      <div>
                        <span className="text-sm font-medium">{drink.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-gray">{drink.shopName}</span>
                          {drink.price > 0 && (
                            <span className="text-xs text-primary">¥{drink.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {totalCount === 0 && (
              <div className="text-center py-12 text-text-gray text-sm">
                未找到相关内容
              </div>
            )}
          </>
        )}

        {!results && !loading && !error && (
          <div className="text-center py-12 text-text-gray text-sm">
            输入关键词开始搜索
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
