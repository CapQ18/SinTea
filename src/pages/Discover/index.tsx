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
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=milk%20tea%20with%20boba%20pearls%20in%20clear%20cup%20food%20photography&image_size=square',
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=creamy%20milk%20tea%20drink%20with%20tapioca%20bubbles%20professional%20photo&image_size=square',
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=delicious%20bubble%20tea%20close%20up%20shot%20warm%20lighting&image_size=square',
      ],
      description: '创立于2008年，主打鲜果茶和创意奶茶，以杨枝甘露和豆乳玉麒麟闻名。',
    },
    {
      id: 2,
      name: '茶颜悦色',
      images: [
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=traditional%20chinese%20milk%20tea%20with%20cream%20foam%20artistic%20presentation&image_size=square',
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=elegant%20milk%20tea%20cup%20with%20chinese%20style%20decoration&image_size=square',
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=premium%20milk%20tea%20with%20cheese%20foam%20on%20top&image_size=square',
      ],
      description: '源自长沙的新中式茶饮品牌，以幽兰拿铁和声声乌龙为招牌，茶香浓郁。',
    },
    {
      id: 3,
      name: '喜茶',
      images: [
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20fruit%20milk%20tea%20with%20grape%20slices%20modern%20style&image_size=square',
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=premium%20cheese%20tea%20with%20fresh%20fruit%20professional%20food%20photo&image_size=square',
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=stylish%20milk%20tea%20drink%20with%20aesthetic%20presentation&image_size=square',
      ],
      description: '创立于2012年，以芝士奶盖茶和多肉葡萄闻名，引领新式茶饮潮流。',
    },
    {
      id: 4,
      name: '一点点',
      images: [
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=classic%20pearl%20milk%20tea%20with%20black%20tapioca%20bubbles&image_size=square',
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=taro%20milk%20tea%20with%20purple%20color%20creamy%20texture&image_size=square',
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=milk%20tea%20with%20grass%20jelly%20and%20coconut%20jelly&image_size=square',
      ],
      description: '台湾连锁奶茶品牌，以丰富的配料选择和实惠的价格深受喜爱。',
    },
    {
      id: 5,
      name: '奈雪的茶',
      images: [
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fresh%20orange%20tea%20with%20slices%20of%20orange%20refreshing%20drink&image_size=square',
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cheese%20tea%20with%20fresh%20strawberry%20beautiful%20presentation&image_size=square',
        'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=fruit%20tea%20with%20mixed%20berries%20colorful%20and%20fresh&image_size=square',
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
