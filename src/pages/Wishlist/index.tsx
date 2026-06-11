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
      <header className="sticky top-0 bg-white z-40 px-4">
        <div className="flex border-b border-border-light">
          <button
            onClick={() => setActiveTab('collection')}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
              activeTab === 'collection' ? 'text-primary' : 'text-text-gray'
            }`}
          >
            收藏
            {activeTab === 'collection' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
              activeTab === 'nearby' ? 'text-primary' : 'text-text-gray'
            }`}
          >
            附近
            {activeTab === 'nearby' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        <div className="flex gap-2 mt-3 pb-3">
          <button
            onClick={() => setShowDrank(false)}
            className={`flex-1 py-2 rounded-button text-sm font-medium transition-colors ${
              !showDrank
                ? 'bg-primary text-white'
                : 'bg-bg-gray text-text-gray'
            }`}
          >
            想喝
          </button>
          <button
            onClick={() => setShowDrank(true)}
            className={`flex-1 py-2 rounded-button text-sm font-medium transition-colors ${
              showDrank
                ? 'bg-success text-white'
                : 'bg-bg-gray text-text-gray'
            }`}
          >
            已喝
          </button>
        </div>
      </header>

      <div className="px-4 mt-3">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-bg-gray flex items-center justify-center text-3xl mb-4">
              🧋
            </div>
            <p className="text-text-gray text-sm">
              {showDrank ? '还没有喝过的奶茶' : '还没有想喝的奶茶'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg overflow-hidden relative group"
              >
                <div className="aspect-square relative">
                  <img
                    src={item.image}
                    alt={item.drinkName}
                    className="w-full h-full object-cover"
                  />
                  {statusMap[item.id] && (
                    <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      statusMap[item.id] === 'like' 
                        ? 'bg-success/90 text-white' 
                        : 'bg-warning/90 text-white'
                    }`}>
                      {statusMap[item.id] === 'like' ? '喜欢' : '踩雷'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className="px-3 py-1.5 rounded-button text-xs font-medium bg-white/90 text-text-primary"
                    >
                      {statusMap[item.id] === 'like' ? '取消喜欢' : statusMap[item.id] === 'dislike' ? '取消踩雷' : '标记'}
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {item.drinkName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-text-gray truncate flex-1">{item.shopName}</span>
                    <button
                      onClick={() => handleDrank(item.id)}
                      className="text-xs text-primary ml-2"
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
