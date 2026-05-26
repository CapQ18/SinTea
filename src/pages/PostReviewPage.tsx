import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postReview } from '../services/mockData';
import MilkTeaSprite from '../components/MilkTeaSprite';

const PostReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    drinkName: string;
    shopName: string;
    reviewType: 'positive' | 'negative';
    content: string;
    rating: number;
    isPublic: boolean;
  }>({
    drinkName: '',
    shopName: '',
    reviewType: 'positive',
    content: '',
    rating: 5,
    isPublic: true,
  });
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIProcessing, setShowAIProcessing] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const drinkSuggestions = [
    '波波奶茶', '珍珠奶茶', '芋泥波波', '杨枝甘露', '芝士奶盖',
    '多肉葡萄', '霸气橙子', '生椰拿铁', '满杯橙子', '抹茶拿铁',
  ];

  const handleImageUpload = () => {
    if (images.length >= 9) return;
    const mockImage = `https://picsum.photos/seed/milktea/200/200`;
    setImages([...images, mockImage]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.drinkName.trim()) {
      newErrors.drinkName = '饮品名称为必填项';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setShowAIProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      await postReview({
        drinkName: formData.drinkName,
        shopName: formData.shopName,
        shopId: 1,
        image: images[0] || 'https://picsum.photos/seed/cup/200/200',
        rating: formData.rating,
        keywords: formData.reviewType === 'positive' ? ['推荐', '好喝'] : ['踩雷', '不推荐'],
        isPositive: formData.reviewType === 'positive',
        content: formData.content,
        userId: 1,
        images: images.length > 0 ? images : ['https://picsum.photos/seed/cup/200/200'],
        isPublic: formData.isPublic,
      });

      navigate('/');
    } finally {
      setIsSubmitting(false);
      setShowAIProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 z-10 bg-white border-b border-milk-tea-200 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="text-gray-600 font-medium"
        >
          取消
        </button>
        <h1 className="text-lg font-bold text-dark-brown">发布评价</h1>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            formData.drinkName.trim()
              ? 'bg-milk-tea-500 text-white'
              : 'bg-gray-200 text-gray-400'
          } ${isSubmitting ? 'opacity-50' : ''}`}
        >
          发布
        </button>
      </header>

      {showAIProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center bounce-in">
            <MilkTeaSprite emotion="happy" size="large" />
            <p className="mt-4 text-dark-brown font-medium">AI正在分析关键词...</p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-milk-tea-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4 space-y-6">
        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm font-medium text-dark-brown mb-3">上传图片</p>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square">
                <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                <button 
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <button 
                onClick={handleImageUpload}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-milk-tea-400 hover:text-milk-tea-500 transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs mt-1">添加</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm font-medium text-dark-brown mb-3">饮品名称</p>
          <div className="relative">
            <input
              type="text"
              value={formData.drinkName}
              onChange={(e) => setFormData({ ...formData, drinkName: e.target.value })}
              placeholder="输入饮品名称"
              className={`w-full px-4 py-3 bg-milk-tea-50 rounded-xl border-none outline-none ${errors.drinkName ? 'ring-2 ring-red-400' : ''}`}
            />
          </div>
          {errors.drinkName && (
            <p className="text-xs text-red-500 mt-2">{errors.drinkName}</p>
          )}
          {formData.drinkName && (
            <div className="mt-3 flex flex-wrap gap-2">
              {drinkSuggestions.filter(d => d.includes(formData.drinkName)).slice(0, 3).map(drink => (
                <button
                  key={drink}
                  onClick={() => setFormData({ ...formData, drinkName: drink })}
                  className="px-3 py-1 bg-milk-tea-100 text-milk-tea-700 rounded-full text-sm"
                >
                  {drink}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm font-medium text-dark-brown mb-3">店铺名称</p>
          <input
            type="text"
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            placeholder="输入店铺名称"
            className="w-full px-4 py-3 bg-milk-tea-50 rounded-xl border-none outline-none"
          />
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm font-medium text-dark-brown mb-3">评价类型</p>
          <div className="flex gap-4">
            <button
              onClick={() => setFormData({ ...formData, reviewType: 'positive' })}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                formData.reviewType === 'positive'
                  ? 'bg-matcha-500 text-white'
                  : 'bg-matcha-50 text-matcha-700'
              }`}
            >
              😊 好喝
            </button>
            <button
              onClick={() => setFormData({ ...formData, reviewType: 'negative' })}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                formData.reviewType === 'negative'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              😢 踩雷
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm font-medium text-dark-brown mb-3">评分</p>
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setFormData({ ...formData, rating: idx + 1 })}
                className="p-2"
              >
                <svg 
                  className={`w-10 h-10 transition-transform hover:scale-110 ${
                    idx < formData.rating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300'
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="text-sm font-medium text-dark-brown mb-3">详细评价</p>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="分享你的真实感受..."
            rows={4}
            className="w-full px-4 py-3 bg-milk-tea-50 rounded-xl border-none outline-none resize-none"
          />
        </div>

        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-brown">隐私设置</p>
              <p className="text-xs text-gray-500">选择评价的可见范围</p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                formData.isPublic ? 'bg-milk-tea-500' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                formData.isPublic ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
          <p className="text-sm mt-2 text-gray-500">
            {formData.isPublic ? '公开可见' : '仅自己可见'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostReviewPage;
