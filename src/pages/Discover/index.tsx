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
      name: '茶百道',
      images: [
        '/images/856aa34131c166c61ec6951e596c0d12.jpg',
        '/images/c24c68ad9368971d227d5a0439e229a6.jpg',
        '/images/735ae66aea25d12fe267f84ea7a24bba.jpg',
      ],
      description: '创立于2008年，主打鲜果茶和创意奶茶，以杨枝甘露和豆乳玉麒麟闻名。',
    },
    {
      id: 2,
      name: '茶颜悦色',
      images: [
        '/images/76fbb72dc2fee8cc6bebfd437e346232.jpg',
        '/images/139deb276805c2024f1d4c65a832472b.jpg',
        '/images/d0849ec52e1a0509b164c7d8ee94bf27.jpg',
      ],
      description: '源自长沙的新中式茶饮品牌，以幽兰拿铁和声声乌龙为招牌，茶香浓郁。',
    },
    {
      id: 3,
      name: '喜茶',
      images: [
        '/images/f0dcdcb42a597722303f37931c3d54f8.jpg',
        '/images/d494e22e02ecabe7a0635767a488c616.jpg',
        '/images/73c5db3391954742b2b52be1c62f7190.jpg',
      ],
      description: '创立于2012年，以芝士奶盖茶和多肉葡萄闻名，引领新式茶饮潮流。',
    },
    {
      id: 4,
      name: '一点点',
      images: [
        '/images/26703b2b90e8a1d7de66c4ebc3e7298a.jpg',
        '/images/ac1e95b49265b2b8165e72ae3f3f5827.jpg',
        '/images/b7c319a2dc2e1ee5202cc584e734148a.jpg',
      ],
      description: '台湾连锁奶茶品牌，以丰富的配料选择和实惠的价格深受喜爱。',
    },
    {
      id: 5,
      name: '奈雪的茶',
      images: [
        '/images/874f4e7528ae465193c34c9055185559.jpg',
        '/images/856aa34131c166c61ec6951e596c0d12.jpg',
        '/images/c24c68ad9368971d227d5a0439e229a6.jpg',
      ],
      description: '以霸气橙子和草莓魔法棒闻名，茶饮与软欧包的完美结合。',
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
