import React, { useState, useRef } from 'react';
import IPCharacter from '../../components/IPCharacter';
import { mockWishlist, WishlistItem } from '../../mock';

const Wishlist: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>(mockWishlist);
  const [activeCategory, setActiveCategory] = useState<'全部' | '奶茶' | '果茶' | '咖啡'>('全部');
  const [showDrank, setShowDrank] = useState(false);
  const [randomIndex, setRandomIndex] = useState<number | null>(null);
  const [slidingId, setSlidingId] = useState<number | null>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const categories = ['全部', '奶茶', '果茶', '咖啡'] as const;

  const filteredItems = items.filter((item) => {
    if (activeCategory !== '全部' && item.category !== activeCategory) return false;
    return item.isDrank === showDrank;
  });

  const handleDrank = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isDrank: !item.isDrank } : item
      )
    );
  };

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSlidingId(null);
  };

  const handleRandom = () => {
    const undrankItems = items.filter((item) => !item.isDrank && (activeCategory === '全部' || item.category === activeCategory));
    if (undrankItems.length === 0) return;

    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * undrankItems.length);
      setRandomIndex(randomIdx);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setTimeout(() => {
          setRandomIndex(null);
        }, 3000);
      }
    }, 100);
  };

  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    startX.current = e.touches[0].clientX;
    setSlidingId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (slidingId === null) return;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setSlidingId(null);
  };

  const getTranslateX = (id: number) => {
    if (slidingId !== id) return 0;
    const diff = startX.current - currentX.current;
    return Math.max(-80, Math.min(0, diff));
  };

  const undrankCount = items.filter((item) => !item.isDrank).length;
  const drankCount = items.filter((item) => item.isDrank).length;

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 bg-cream z-40 pt-4 pb-2 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-dark-brown">
            {showDrank ? '喝过的记录' : '想喝清单'}
          </h1>
          <span className="text-sm text-mid-brown">
            ({showDrank ? drankCount : undrankCount})
          </span>
        </div>

        <div className="flex gap-2 mt-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 rounded-tag text-sm transition-all ${
                activeCategory === category
                  ? 'bg-milk-tea text-dark-brown font-medium'
                  : 'bg-white text-mid-brown'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setShowDrank(false)}
            className={`flex-1 py-2 rounded-medium text-sm font-medium transition-all ${
              !showDrank
                ? 'bg-milk-tea text-dark-brown'
                : 'bg-white text-mid-brown'
            }`}
          >
            想喝
          </button>
          <button
            onClick={() => setShowDrank(true)}
            className={`flex-1 py-2 rounded-medium text-sm font-medium transition-all ${
              showDrank
                ? 'bg-matcha text-white'
                : 'bg-white text-mid-brown'
            }`}
          >
            已喝
          </button>
        </div>
      </header>

      <div className="px-4 mt-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <IPCharacter size="large" state="sleepy" />
            <p className="text-mid-brown mt-4">
              {showDrank ? '还没有喝过的奶茶' : '还没有想喝的奶茶'}
            </p>
            {!showDrank && (
              <button className="mt-4 px-6 py-2 bg-milk-tea rounded-button text-dark-brown font-medium">
                去逛逛
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="relative"
                  onTouchStart={(e) => handleTouchStart(e, item.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="absolute inset-y-0 right-0 flex">
                    {!item.isDrank && (
                      <>
                        <button
                          onClick={() => handleDrank(item.id)}
                          className="w-20 bg-matcha flex items-center justify-center text-white font-medium"
                        >
                          已喝
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-20 bg-rose flex items-center justify-center text-white font-medium"
                        >
                          删除
                        </button>
                      </>
                    )}
                    {item.isDrank && (
                      <button
                        onClick={() => handleDrank(item.id)}
                        className="w-20 bg-milk-tea flex items-center justify-center text-dark-brown font-medium"
                      >
                        移回
                      </button>
                    )}
                  </div>

                  <div
                    className={`card-sm p-3 flex items-center gap-3 cursor-pointer transition-transform ${
                      randomIndex === index ? 'ring-2 ring-matcha' : ''
                    }`}
                    style={{ transform: `translateX(${getTranslateX(item.id)}px)` }}
                  >
                    <div className="w-12 h-12 rounded-medium overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.drinkName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark-brown truncate">
                        🧋 {item.drinkName}
                      </p>
                      <p className="text-sm text-mid-brown">{item.shopName}</p>
                      <p className="text-xs text-gray">{item.addedAt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!showDrank && undrankCount > 1 && (
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleRandom}
                  className="w-full py-4 bg-milk-tea rounded-button text-dark-brown font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="text-lg">🤔</span>
                  <span>纠结喝什么？随机选一个！</span>
                </button>
                <button
                  onClick={() => {
                    const shareText = `我的 SinTea 想喝清单：${items.filter(i => !i.isDrank).map(i => i.drinkName).join('、')}`;
                    if (navigator.share) {
                      navigator.share({ title: 'SinTea 想喝清单', text: shareText });
                    } else {
                      navigator.clipboard.writeText(shareText);
                      alert('清单链接已复制到剪贴板！');
                    }
                  }}
                  className="w-full py-3 bg-white border border-milk-tea rounded-button text-mid-brown font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="text-lg">📤</span>
                  <span>分享我的想喝清单</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
