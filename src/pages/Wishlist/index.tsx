import React, { useState } from 'react';
import { mockWishlist, WishlistItem } from '../../mock';

type TabType = 'collection' | 'nearby';

const Wishlist: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>(mockWishlist);
  const [activeTab, setActiveTab] = useState<TabType>('collection');
  const [showDrank, setShowDrank] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<number, 'like' | 'dislike' | null>>({});

  const filteredItems = items.filter((item) => item.isDrank === showDrank);

  const toggleStatus = (id: number) => {
    setStatusMap((prev) => ({
      ...prev,
      [id]: prev[id] === 'like' ? 'dislike' : prev[id] === 'dislike' ? null : 'like'
    }));
  };

  const handleDrank = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isDrank: !item.isDrank } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 bg-white z-40 px-4 shadow-sm">
        <div className="flex border-b border-border-light">
          <button
            onClick={() => setActiveTab('collection')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'collection' ? 'text-primary' : 'text-text-gray'
            }`}
          >
            收藏
            {activeTab === 'collection' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'nearby' ? 'text-primary' : 'text-text-gray'
            }`}
          >
            附近
            {activeTab === 'nearby' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        <div className="flex gap-2 mt-4 pb-4">
          <button
            onClick={() => setShowDrank(false)}
            className={`flex-1 py-2.5 rounded-button text-sm font-medium transition-all ${
              !showDrank
                ? 'btn-primary'
                : 'bg-bg-gray text-text-gray hover:bg-border'
            }`}
          >
            想喝
          </button>
          <button
            onClick={() => setShowDrank(true)}
            className={`flex-1 py-2.5 rounded-button text-sm font-medium transition-all ${
              showDrank
                ? 'bg-success text-white shadow-md'
                : 'bg-bg-gray text-text-gray hover:bg-border'
            }`}
          >
            已喝
          </button>
        </div>
      </header>

      <div className="px-4 mt-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary-light to-accent flex items-center justify-center text-5xl mb-4 shadow-md">
              🧋
            </div>
            <p className="text-text-gray text-base">
              {showDrank ? '还没有喝过的奶茶' : '还没有想喝的奶茶'}
            </p>
            <button className="mt-4 px-6 py-2.5 btn-primary text-sm">
              {showDrank ? '去发现' : '去添加'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-border-light group hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative">
                  <img
                    src={item.image}
                    alt={item.drinkName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {statusMap[item.id] && (
                    <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                      statusMap[item.id] === 'like' 
                        ? 'bg-success text-white' 
                        : 'bg-warning text-white'
                    }`}>
                      {statusMap[item.id] === 'like' ? '👍' : '👎'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className="w-full py-2 rounded-button text-xs font-medium bg-white/90 text-text-primary hover:bg-white transition-colors"
                    >
                      {statusMap[item.id] === 'like' ? '取消喜欢' : statusMap[item.id] === 'dislike' ? '取消踩雷' : '标记'}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {item.drinkName}
                      </p>
                      <p className="text-xs text-text-gray mt-0.5 truncate">{item.shopName}</p>
                    </div>
                    {item.price && (
                      <span className="text-xs font-bold text-primary ml-2">{item.price}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {item.rating && (
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, idx) => (
                          <svg
                            key={idx}
                            className={`w-3 h-3 ${idx < item.rating! ? 'rating-star' : 'rating-star-empty'}`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => handleDrank(item.id)}
                      className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      {item.isDrank ? '移回' : '已喝'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;