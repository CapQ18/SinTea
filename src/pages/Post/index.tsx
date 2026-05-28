import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IPCharacter from '../../components/IPCharacter';
import { drinkSuggestions, shopSuggestions } from '../../mock';

const Post: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    drinkName: '',
    shopName: '',
    reviewType: 'positive' as 'positive' | 'negative',
    content: '',
    rating: 5,
    isPrivate: false,
  });
  const [images, setImages] = useState<string[]>([]);
  const [showDrinkSuggestions, setShowDrinkSuggestions] = useState(false);
  const [showShopSuggestions, setShowShopSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = () => {
    if (images.length < 9) {
      const newImage = `https://neeko-copilot.bytedance.net/api/text_to_image?prompt=milk%20tea%20drink%20${images.length + 1}&image_size=square`;
      setImages((prev) => [...prev, newImage]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.drinkName.trim()) {
      newErrors.drinkName = '请输入饮品名称';
    }
    if (!formData.shopName.trim()) {
      newErrors.shopName = '请输入店铺名称';
    }
    if (formData.rating < 1) {
      newErrors.rating = '请选择评分';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 bg-white z-40 px-4 py-3 flex items-center justify-between border-b border-border">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center text-dark-brown hover:bg-cream rounded-full"
        >
          ✕
        </button>
        <h1 className="text-lg font-bold text-dark-brown">发布评价</h1>
        <button
          onClick={handleSubmit}
          className="px-4 py-1.5 bg-milk-tea rounded-button text-dark-brown text-sm font-medium active:scale-95 transition-transform"
          disabled={isSubmitting}
        >
          {isSubmitting ? '发布中...' : '发布'}
        </button>
      </header>

      {showSuccess ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <div className="w-24 h-24 rounded-full bg-matcha flex items-center justify-center mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-xl font-bold text-dark-brown mb-2">发布成功</h2>
          <p className="text-mid-brown">正在返回首页...</p>
        </div>
      ) : isSubmitting ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <IPCharacter size="large" state="loading" />
          <p className="text-mid-brown mt-4">🤖 AI正在分析关键词...</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-brown mb-2">
              📷 添加照片
            </label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-medium overflow-hidden"
                >
                  <img src={img} alt={`图片${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {images.length < 9 && (
                <button
                  onClick={handleImageUpload}
                  className="aspect-square rounded-medium border-2 border-dashed border-border flex flex-col items-center justify-center text-gray hover:border-milk-tea hover:text-milk-tea transition-colors"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-xs mt-1">添加</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-brown mb-2">
              饮品名称 *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.drinkName}
                onChange={(e) => handleInputChange('drinkName', e.target.value)}
                onFocus={() => setShowDrinkSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDrinkSuggestions(false), 200)}
                placeholder="搜索或输入..."
                className={`w-full h-11 pl-4 pr-4 rounded-medium bg-white border text-dark-brown placeholder:text-gray focus:outline-none transition-colors ${
                  errors.drinkName ? 'border-rose' : 'border-border focus:border-milk-tea'
                }`}
              />
              {showDrinkSuggestions && formData.drinkName.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-medium shadow-lg z-10">
                  {drinkSuggestions.slice(0, 5).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleInputChange('drinkName', suggestion);
                        setShowDrinkSuggestions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-dark-brown hover:bg-cream transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.drinkName && (
              <p className="text-xs text-rose mt-1">{errors.drinkName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-brown mb-2">
              店铺名称 *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => handleInputChange('shopName', e.target.value)}
                onFocus={() => setShowShopSuggestions(true)}
                onBlur={() => setTimeout(() => setShowShopSuggestions(false), 200)}
                placeholder="搜索或输入..."
                className={`w-full h-11 pl-4 pr-4 rounded-medium bg-white border text-dark-brown placeholder:text-gray focus:outline-none transition-colors ${
                  errors.shopName ? 'border-rose' : 'border-border focus:border-milk-tea'
                }`}
              />
              {showShopSuggestions && formData.shopName.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-medium shadow-lg z-10">
                  {shopSuggestions.slice(0, 5).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleInputChange('shopName', suggestion);
                        setShowShopSuggestions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-dark-brown hover:bg-cream transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.shopName && (
              <p className="text-xs text-rose mt-1">{errors.shopName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-brown mb-2">
              评价类型
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => handleInputChange('reviewType', 'positive')}
                className={`flex-1 py-3 rounded-medium flex items-center justify-center gap-2 transition-all ${
                  formData.reviewType === 'positive'
                    ? 'bg-matcha text-white'
                    : 'bg-white text-mid-brown'
                }`}
              >
                <span>😊</span>
                <span className="font-medium">好喝</span>
              </button>
              <button
                onClick={() => handleInputChange('reviewType', 'negative')}
                className={`flex-1 py-3 rounded-medium flex items-center justify-center gap-2 transition-all ${
                  formData.reviewType === 'negative'
                    ? 'bg-rose text-white'
                    : 'bg-white text-mid-brown'
                }`}
              >
                <span>😫</span>
                <span className="font-medium">踩雷</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-brown mb-2">
              详细评价
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="写下你的真实感受..."
              rows={4}
              className="w-full px-4 py-3 rounded-medium bg-white border border-border text-dark-brown placeholder:text-gray focus:outline-none focus:border-milk-tea resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-brown mb-2">
              评分
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleInputChange('rating', star)}
                  className={`w-12 h-12 rounded-medium flex items-center justify-center text-xl transition-transform active:scale-90 ${
                    star <= formData.rating
                      ? 'bg-yellow-100 text-yellow-400'
                      : 'bg-white text-gray border border-border'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-xs text-rose mt-1">{errors.rating}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-brown mb-2">
              隐私设置
            </label>
            <div className="bg-white rounded-medium p-4">
              <button
                onClick={() => handleInputChange('isPrivate', false)}
                className={`w-full flex items-center justify-between py-2 ${
                  !formData.isPrivate ? 'text-dark-brown' : 'text-gray'
                }`}
              >
                <span>公开可见</span>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    !formData.isPrivate ? 'bg-milk-tea' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      !formData.isPrivate ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
              <button
                onClick={() => handleInputChange('isPrivate', true)}
                className={`w-full flex items-center justify-between py-2 ${
                  formData.isPrivate ? 'text-dark-brown' : 'text-gray'
                }`}
              >
                <span>仅自己可见</span>
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    formData.isPrivate ? 'bg-milk-tea' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.isPrivate ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
