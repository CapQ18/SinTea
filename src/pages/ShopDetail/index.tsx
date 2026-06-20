import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API, request } from '../../services/apiService';

interface Shop {
  id: string;
  name: string;
  brand: string;
  images: string[];
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  priceRange: string;
}

interface Drink {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  rating: number;
  imageUrl: string;
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1558857561-c7e2c2d36b0a?w=400';

const ShopDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchShop = async () => {
      setLoading(true);
      try {
        const data = await request<{
          success: boolean;
          shop?: Shop;
          drinks?: Drink[];
        }>(API.shops.get(id));
        if (data.success && data.shop) {
          setShop(data.shop);
          setDrinks(data.drinks || []);
        } else {
          setError('店铺不存在');
        }
      } catch {
        setError('加载失败，请检查网络');
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex items-center gap-2 text-text-gray">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          加载中...
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-text-gray">{error || '店铺不存在'}</p>
        <button onClick={() => navigate('/discover')} className="btn-primary px-4 py-2 rounded-lg text-sm">
          返回发现页
        </button>
      </div>
    );
  }

  const images = shop.images && shop.images.length > 0 ? shop.images : [PLACEHOLDER];

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-3 flex items-center gap-3 border-b border-border-light sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-text-secondary rounded-full hover:bg-bg-gray"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-text-primary">{shop.name}</h1>
        {shop.brand && shop.brand !== shop.name && (
          <span className="text-xs text-text-gray">{shop.brand}</span>
        )}
      </header>

      {/* Images */}
      <div className="bg-white">
        <div className="flex gap-1 px-4 pt-4">
          {images.slice(0, 3).map((img, idx) => (
            <div key={idx} className="flex-1 aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={img}
                alt={`${shop.name} ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER;
                }}
              />
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-text-primary">{shop.name}</h2>
            {shop.rating > 0 && (
              <span className="text-sm text-yellow-500">⭐ {shop.rating}</span>
            )}
            {shop.priceRange && (
              <span className="text-xs px-2 py-0.5 bg-bg-gray rounded">{shop.priceRange}</span>
            )}
          </div>
          {shop.description && (
            <p className="text-sm text-text-secondary mb-3">{shop.description}</p>
          )}
          {shop.address && (
            <p className="text-xs text-text-gray flex items-center gap-1">
              <span>📍</span> {shop.address}
            </p>
          )}
        </div>
      </div>

      {/* Drinks */}
      <div className="mt-3 bg-white">
        <div className="px-4 py-3 border-b border-border-light">
          <h3 className="text-sm font-semibold text-text-primary">
            饮品菜单 ({drinks.length})
          </h3>
        </div>
        {drinks.length > 0 ? (
          <div className="divide-y divide-border-light">
            {drinks.map((drink) => (
              <div key={drink.id} className="px-4 py-3 flex gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={drink.imageUrl || PLACEHOLDER}
                    alt={drink.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER;
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{drink.name}</span>
                    <span className="text-xs text-text-gray">{drink.category}</span>
                  </div>
                  {drink.description && (
                    <p className="text-xs text-text-gray mt-0.5 line-clamp-1">{drink.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {drink.price > 0 && (
                      <span className="text-sm text-primary font-medium">¥{drink.price}</span>
                    )}
                    {drink.rating > 0 && (
                      <span className="text-xs text-yellow-500">⭐ {drink.rating}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-text-gray text-sm">暂无饮品</div>
        )}
      </div>
    </div>
  );
};

export default ShopDetail;
