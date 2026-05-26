import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WishlistItem, Category } from '../types';
import { getWishlist, toggleWishlistDrunk, removeFromWishlist } from '../services/mockData';
import MilkTeaSprite from '../components/MilkTeaSprite';

const categories: { key: Category; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'milk-tea', label: '奶茶' },
  { key: 'fruit-tea', label: '果茶' },
  { key: 'coffee', label: '咖啡' },
];

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('all');
  const [showRandom, setShowRandom] = useState(false);
  const [randomItem, setRandomItem] = useState<WishlistItem | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const data = await getWishlist();
      setWishlist(data);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDrunk = async (id: number) => {
    await toggleWishlistDrunk(id);
    await fetchWishlist();
  };

  const handleRemove = async (id: number) => {
    await removeFromWishlist(id);
    await fetchWishlist();
  };

  const handleRandomSelect = () => {
    const notDrunk = wishlist.filter(item => !item.isDrunk);
    if (notDrunk.length > 0) {
      const random = notDrunk[Math.floor(Math.random() * notDrunk.length)];
      setRandomItem(random);
      setShowRandom(true);
    }
  };

  const filteredItems = wishlist.filter(item => {
    if (category === 'all') return true;
    return item.category === category;
  });

  const pendingItems = filteredItems.filter(item => !item.isDrunk);
  const drunkItems = filteredItems.filter(item => item.isDrunk);

  return (
    <div className="min-h-screen bg-cream pb-28">
      <header className="sticky top-0 z-10 bg-white border-b border-milk-tea-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-dark-brown">想喝清单</h1>
            <p className="text-sm text-gray-500">共 {wishlist.length} 杯想喝的</p>
          </div>
          <MilkTeaSprite size="small" animate={false} />
        </div>
      </header>

      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide bg-white">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              category === cat.key
                ? 'bg-milk-tea-500 text-white'
                : 'bg-milk-tea-50 text-dark-brown'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {showRandom && randomItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm bounce-in">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">今天就喝这个吧！</p>
              <div className="w-24 h-24 mx-auto mb-4">
                <img 
                  src={randomItem.image} 
                  alt={randomItem.drinkName}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <h3 className="text-xl font-bold text-dark-brown">{randomItem.drinkName}</h3>
              <p className="text-gray-500">{randomItem.shopName}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRandom(false)}
                className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium"
              >
                换一个
              </button>
              <button
                onClick={() => {
                  handleToggleDrunk(randomItem.id);
                  setShowRandom(false);
                }}
                className="flex-1 py-3 bg-milk-tea-500 rounded-xl text-white font-medium"
              >
                就它了！
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4 space-y-6">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-milk-tea-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && pendingItems.length === 0 && drunkItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <MilkTeaSprite emotion="happy" size="large" />
            <p className="mt-4 text-lg font-medium text-dark-brown">心愿单是空的</p>
            <p className="text-sm text-gray-500 text-center mt-2">把你最想喝的奶茶加入心愿单吧！</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-milk-tea-500 text-white rounded-full font-medium shadow-lg hover:bg-milk-tea-600 transition-colors"
            >
              去发现好喝的
            </button>
          </div>
        )}

        {pendingItems.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">想喝的 ({pendingItems.length})</h2>
            <div className="space-y-3">
              {pendingItems.map(item => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl p-3 flex items-center gap-3 fade-in"
                >
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.drinkName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-dark-brown truncate">{item.drinkName}</h3>
                    <p className="text-xs text-gray-500">{item.shopName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.addedAt).toLocaleDateString('zh-CN')} 添加
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleToggleDrunk(item.id)}
                      className="px-3 py-1.5 bg-matcha-100 text-matcha-700 rounded-full text-xs font-medium"
                    >
                      已喝
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-medium"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {drunkItems.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-3">喝过的记录 ({drunkItems.length})</h2>
            <div className="space-y-3">
              {drunkItems.map(item => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl p-3 flex items-center gap-3 opacity-70"
                >
                  <div className="w-16 h-16 flex-shrink-0 relative">
                    <img 
                      src={item.image} 
                      alt={item.drinkName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute top-1 right-1 w-5 h-5 bg-matcha-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-dark-brown truncate">{item.drinkName}</h3>
                    <p className="text-xs text-gray-500">{item.shopName}</p>
                  </div>
                  <button
                    onClick={() => handleToggleDrunk(item.id)}
                    className="px-3 py-1.5 bg-milk-tea-100 text-milk-tea-700 rounded-full text-xs font-medium"
                  >
                    移回
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-milk-tea-200 px-4 py-4">
        <button
          onClick={handleRandomSelect}
          disabled={wishlist.filter(i => !i.isDrunk).length === 0}
          className={`w-full py-3 rounded-xl font-medium transition-all ${
            wishlist.filter(i => !i.isDrunk).length > 0
              ? 'bg-gradient-to-r from-milk-tea-500 to-matcha-400 text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          🎲 纠结喝什么？随机选一个
        </button>
      </div>
    </div>
  );
};

export default WishlistPage;
