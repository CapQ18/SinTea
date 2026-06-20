import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentPosition, calculateDistance, formatDistance } from '../../services/locationService';
import { API, request } from '../../services/apiService';

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

// 通用占位图，店铺没有图片时使用
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400';

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('shops');
  const [shops, setShops] = useState<Shop[]>([]);
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [fetchError, setFetchError] = useState('');

  const fetchShops = async () => {
    setFetchError('');
    try {
      const data = await request<{ success: boolean; shops?: Shop[] }>(API.shops.list);
      if (data.success && data.shops && data.shops.length > 0) {
        setShops(data.shops);
      } else {
        setFetchError('暂无店铺数据');
      }
    } catch {
      setFetchError('加载店铺失败，请检查网络');
    }
  };

  const fetchNearbyShops = async () => {
    setLoading(true);
    setLocationError('');
    setFetchError('');

    try {
      const position = await getCurrentPosition();

      try {
        const data = await request<{ success: boolean; shops?: Shop[] }>(
          `${API.shops.nearby}?lat=${position.latitude}&lng=${position.longitude}&radius=50`
        );
        if (data.success && data.shops && data.shops.length > 0) {
          setNearbyShops(data.shops);
        } else {
          // 附近没有店铺，尝试展示全部店铺并计算距离
          const allData = await request<{ success: boolean; shops?: Shop[] }>(API.shops.list);
          if (allData.success && allData.shops) {
            const withDistance = allData.shops
              .map(shop => ({
                ...shop,
                distance: shop.latitude && shop.longitude
                  ? calculateDistance(position.latitude, position.longitude, shop.latitude, shop.longitude)
                  : undefined,
              }))
              .sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
            setNearbyShops(withDistance);
          } else {
            setFetchError('附近暂无店铺');
          }
        }
      } catch {
        setFetchError('加载附近店铺失败');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '定位失败';
      setLocationError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
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

      {activeTab === 'nearby' && (
        <div className="px-4 py-2 bg-white mt-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-text-gray">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              正在获取位置...
            </div>
          ) : locationError ? (
            <div className="text-sm text-orange-500">
              ⚠️ {locationError}，请允许浏览器定位后重试
            </div>
          ) : nearbyShops.length > 0 && nearbyShops[0].distance !== undefined ? (
            <div className="text-sm text-text-gray">
              📍 按真实距离排序（近→远）
            </div>
          ) : null}
        </div>
      )}

      {fetchError && (
        <div className="px-4 py-3 bg-orange-50 text-orange-600 text-sm text-center">
          {fetchError}
        </div>
      )}

      <div className="px-4 mt-3 space-y-4">
        {displayShops.map((shop) => {
          const images = shop.images && shop.images.length > 0 ? shop.images : [PLACEHOLDER_IMAGE];
          return (
            <div
              key={shop.id}
              className="bg-white rounded-lg overflow-hidden active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/shop/${shop.id}`)}
            >
              <div className="p-4 flex justify-between items-center">
                <div>
                  <span className="text-sm text-text-primary font-medium">#{shop.name}</span>
                  {shop.brand && shop.brand !== shop.name && (
                    <span className="ml-2 text-xs text-text-gray">{shop.brand}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {shop.rating > 0 && (
                    <span className="text-xs text-yellow-500">⭐ {shop.rating}</span>
                  )}
                  {activeTab === 'nearby' && shop.distance !== undefined && (
                    <span className="text-xs text-primary font-medium">
                      {formatDistance(shop.distance)}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-4">
                <div className="flex gap-1">
                  {images.slice(0, 3).map((img, idx) => (
                    <div
                      key={idx}
                      className="flex-1 aspect-square rounded-lg overflow-hidden relative bg-gray-100"
                    >
                      <img
                        src={img}
                        alt={`${shop.name} 图片${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      {images.length > 3 && idx === 2 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs">
                          共{images.length}张
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-3">
                <p className="text-sm text-text-secondary line-clamp-2">{shop.description}</p>
                {shop.address && (
                  <p className="text-xs text-text-gray mt-1">📍 {shop.address}</p>
                )}
                {shop.priceRange && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-bg-gray rounded">
                    {shop.priceRange}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {displayShops.length === 0 && !loading && !fetchError && (
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
