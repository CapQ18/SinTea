import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentPosition, calculateDistance, formatDistance } from '../../services/locationService';

type TabType = 'shops' | 'nearby';

interface Shop {
  id: string;
  name: string;
  brand: string;
  images: string[];
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  rating: number;
  priceRange: string;
}

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('shops');
  const [shops, setShops] = useState<Shop[]>([]);
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // 模拟商店数据
  const mockShops: Shop[] = [
    {
      id: '1',
      name: '茶百道',
      brand: '茶百道',
      images: [
        '/images/856aa34131c166c61ec6951e596c0d12.jpg',
        '/images/c24c68ad9368971d227d5a0439e229a6.jpg',
        '/images/735ae66aea25d12fe267f84ea7a24bba.jpg',
      ],
      description: '创立于2008年，主打鲜果茶和创意奶茶，以杨枝甘露和豆乳玉麒麟闻名。',
      address: '上海市静安区南京西路1266号',
      latitude: 31.2397,
      longitude: 121.4998,
      rating: 4.7,
      priceRange: '$$'
    },
    {
      id: '2',
      name: '茶颜悦色',
      brand: '茶颜悦色',
      images: [
        '/images/76fbb72dc2fee8cc6bebfd437e346232.jpg',
        '/images/139deb276805c2024f1d4c65a832472b.jpg',
        '/images/d0849ec52e1a0509b164c7d8ee94bf27.jpg',
      ],
      description: '源自长沙的新中式茶饮品牌，以幽兰拿铁和声声乌龙为招牌，茶香浓郁。',
      address: '上海市黄浦区淮海中路999号',
      latitude: 31.2346,
      longitude: 121.4854,
      rating: 4.8,
      priceRange: '$$'
    },
    {
      id: '3',
      name: '喜茶',
      brand: '喜茶',
      images: [
        '/images/f0dcdcb42a597722303f37931c3d54f8.jpg',
        '/images/d494e22e02ecabe7a0635767a488c616.jpg',
        '/images/73c5db3391954742b2b52be1c62f7190.jpg',
      ],
      description: '创立于2012年，以芝士奶盖茶和多肉葡萄闻名，引领新式茶饮潮流。',
      address: '上海市浦东新区陆家嘴环路1000号',
      latitude: 31.2397,
      longitude: 121.5079,
      rating: 4.6,
      priceRange: '$$'
    },
    {
      id: '4',
      name: '一点点',
      brand: '一点点',
      images: [
        '/images/26703b2b90e8a1d7de66c4ebc3e7298a.jpg',
        '/images/ac1e95b49265b2b8165e72ae3f3f5827.jpg',
        '/images/b7c319a2dc2e1ee5202cc584e734148a.jpg',
      ],
      description: '台湾连锁奶茶品牌，以丰富的配料选择和实惠的价格深受喜爱。',
      address: '上海市徐汇区漕溪北路88号',
      latitude: 31.1987,
      longitude: 121.4369,
      rating: 4.5,
      priceRange: '$'
    },
    {
      id: '5',
      name: '奈雪的茶',
      brand: '奈雪的茶',
      images: [
        '/images/874f4e7528ae465193c34c9055185559.jpg',
        '/images/856aa34131c166c61ec6951e596c0d12.jpg',
        '/images/c24c68ad9368971d227d5a0439e229a6.jpg',
      ],
      description: '以霸气橙子和草莓魔法棒闻名，茶饮与软欧包的完美结合。',
      address: '上海市长宁区虹桥路1号',
      latitude: 31.2167,
      longitude: 121.3964,
      rating: 4.7,
      priceRange: '$$'
    },
  ];

  // 获取附近奶茶店
  const fetchNearbyShops = async () => {
    setLoading(true);
    setLocationError('');

    try {
      // 获取用户当前位置（浏览器原生API）
      const position = await getCurrentPosition();
      
      // 如果后端服务运行中，调用API获取附近店铺
      try {
        const response = await fetch(
          `http://localhost:3001/api/locations/search?lat=${position.latitude}&lng=${position.longitude}&radius=10`
        );
        const data = await response.json();
        if (data.shops && data.shops.length > 0) {
          setNearbyShops(data.shops);
        } else {
          // 后端无数据，使用模拟数据并计算距离
          const shopsWithDistance = mockShops.map(shop => ({
            ...shop,
            distance: shop.latitude && shop.longitude
              ? calculateDistance(position.latitude, position.longitude, shop.latitude, shop.longitude)
              : undefined
          })).filter(shop => shop.distance !== undefined && shop.distance <= 10)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0));
          setNearbyShops(shopsWithDistance);
        }
      } catch (apiError) {
        // 后端未运行，使用模拟数据计算距离
        const shopsWithDistance = mockShops.map(shop => ({
          ...shop,
          distance: shop.latitude && shop.longitude
            ? calculateDistance(position.latitude, position.longitude, shop.latitude, shop.longitude)
            : undefined
        })).filter(shop => shop.distance !== undefined && shop.distance <= 10)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setNearbyShops(shopsWithDistance);
      }
    } catch (error) {
      setLocationError(error.message);
      // 定位失败，显示所有店铺
      setNearbyShops(mockShops);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShops(mockShops);
  }, []);

  useEffect(() => {
    if (activeTab === 'nearby') {
      fetchNearbyShops();
    }
  }, [activeTab]);

  const displayShops = activeTab === 'shops' ? shops : nearbyShops;

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

      {/* 定位状态提示 */}
      {activeTab === 'nearby' && (
        <div className="px-4 py-2 bg-white mt-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-text-gray">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              正在获取位置...
            </div>
          ) : locationError ? (
            <div className="text-sm text-orange-500">
              ⚠️ {locationError}，显示所有店铺
            </div>
          ) : nearbyShops.length > 0 && nearbyShops[0].distance !== undefined ? (
            <div className="text-sm text-text-gray">
              📍 按真实距离排序（近→远）
            </div>
          ) : null}
        </div>
      )}

      <div className="px-4 mt-3 space-y-4">
        {displayShops.map((shop) => (
          <div
            key={shop.id}
            className="bg-white rounded-lg overflow-hidden"
            onClick={() => navigate(`/shop/${shop.id}`)}
          >
            <div className="p-4 flex justify-between items-center">
              <div>
                <span className="text-sm text-text-primary font-medium">#{shop.name}</span>
                {shop.brand && shop.brand !== shop.name && (
                  <span className="ml-2 text-xs text-text-gray">{shop.brand}</span>
                )}
              </div>
              {activeTab === 'nearby' && shop.distance !== undefined && (
                <span className="text-xs text-primary font-medium">
                  {formatDistance(shop.distance)}
                </span>
              )}
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
              {shop.address && (
                <p className="text-xs text-text-gray mt-1">{shop.address}</p>
              )}
            </div>
          </div>
        ))}

        {displayShops.length === 0 && !loading && (
          <div className="text-center py-12 text-text-gray">
            <p className="text-lg mb-2">暂无店铺</p>
            <p className="text-sm">快来添加第一家奶茶店吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;