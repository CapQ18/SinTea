import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type TabType = 'shops' | 'nearby';

interface Shop {
  id: number;
  name: string;
  images: string[];
  description: string;
}

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('shops');

  const shops: Shop[] = [
    {
      id: 1,
      name: '某某某奶茶店',
      images: [
        'https://picsum.photos/seed/shop1/400/400',
        'https://picsum.photos/seed/shop2/400/400',
        'https://picsum.photos/seed/shop3/400/400',
      ],
      description: '成立于19XX年，主打奶味茶品，日均销售量XXX杯。',
    },
    {
      id: 2,
      name: '茶颜悦色',
      images: [
        'https://picsum.photos/seed/shop4/400/400',
        'https://picsum.photos/seed/shop5/400/400',
        'https://picsum.photos/seed/shop6/400/400',
      ],
      description: '成立于19XX年，主打奶味茶品，日均销售量XXX杯。',
    },
    {
      id: 3,
      name: '喜茶',
      images: [
        'https://picsum.photos/seed/shop7/400/400',
        'https://picsum.photos/seed/shop8/400/400',
        'https://picsum.photos/seed/shop9/400/400',
      ],
      description: '成立于19XX年，主打奶味茶品，日均销售量XXX杯。',
    },
  ];

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 bg-white z-40 px-4">
        <div className="flex border-b border-border-light">
          <button
            onClick={() => setActiveTab('shops')}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
              activeTab === 'shops' ? 'text-primary' : 'text-text-gray'
            }`}
          >
            小店
            {activeTab === 'shops' && (
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
      </header>

      <div className="px-4 mt-3 space-y-4">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="bg-white rounded-lg overflow-hidden"
            onClick={() => navigate(`/shop/${shop.id}`)}
          >
            <div className="p-4">
              <span className="text-sm text-text-primary font-medium">#{shop.name}</span>
            </div>
            
            <div className="px-4">
              <div className="flex gap-1">
                {shop.images.slice(0, 3).map((img, idx) => (
                  <div
                    key={idx}
                    className="flex-1 aspect-square rounded-lg overflow-hidden relative"
                  >
                    <img
                      src={img}
                      alt={`店铺图片${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {shop.images.length > 3 && idx === 2 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs">
                        共{shop.images.length}张
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-sm text-text-secondary line-clamp-2">{shop.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discover;
