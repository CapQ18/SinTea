import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentUser } from '../../types/feed';

type PostType = 'recommend' | 'warning' | null;

const FeedPost: React.FC = () => {
  const navigate = useNavigate();
  const [tag, setTag] = useState('');
  const [postType, setPostType] = useState<PostType>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [shop, setShop] = useState('');
  const [rating, setRating] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showShopSuggestions, setShowShopSuggestions] = useState(false);

  const shopSuggestions = [
    '茶百道', '喜茶', '奈雪的茶', '茶颜悦色', '一点点',
    'CoCo都可', '蜜雪冰城', '瑞幸咖啡', '古茗', '星巴克',
  ];

  const filteredShops = shop
    ? shopSuggestions.filter(s => s.includes(shop))
    : shopSuggestions;

  const handleAddImage = () => {
    if (images.length < 3) {
      const newImage = `https://picsum.photos/seed/${Date.now()}/400/400`;
      setImages([...images, newImage]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (!tag.trim() || !postType || !content.trim()) return;

    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 1500);
  };

  const isFormValid = tag.trim() && postType && content.trim() && rating > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center text-gray-600 rounded-full hover:bg-gray-100"
        >
          ✕
        </button>
        <h1 className="text-lg font-semibold text-gray-800">发布评价</h1>
        <button
          onClick={handlePost}
          disabled={!isFormValid || isPosting}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            isFormValid && !isPosting
              ? 'bg-amber-500 text-white active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isPosting ? '发布中...' : '发布'}
        </button>
      </header>

      {showSuccess ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-green-400 flex items-center justify-center text-4xl mb-4">
            ✓
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">发布成功</h2>
          <p className="text-gray-500 text-sm">正在返回首页...</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{currentUser.name}</p>
                    <p className="text-xs text-gray-400">{currentUser.title}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="#输入奶茶名称..."
                    className="w-full text-sm text-gray-800 placeholder:text-gray-400 bg-transparent border-none outline-none"
                  />
                </div>

                <div className="mt-3 relative">
                  <button
                    onClick={() => setShowTypePicker(!showTypePicker)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      postType === 'recommend'
                        ? 'bg-green-400 text-white'
                        : postType === 'warning'
                        ? 'bg-red-400 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {postType === 'recommend'
                      ? '✓ 良心推荐'
                      : postType === 'warning'
                      ? '⚠ 避雷预警'
                      : '选择类型'}
                  </button>

                  {showTypePicker && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-20">
                      <button
                        onClick={() => {
                          setPostType('recommend');
                          setShowTypePicker(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span className="w-3 h-3 rounded-full bg-green-400" />
                        良心推荐
                      </button>
                      <button
                        onClick={() => {
                          setPostType('warning');
                          setShowTypePicker(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        避雷预警
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="写下你的真实感受..."
                    rows={5}
                    className="w-full text-sm text-gray-700 placeholder:text-gray-400 bg-transparent border-none outline-none resize-none leading-relaxed"
                  />
                </div>

                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                        <img
                          src={img}
                          alt={`图片${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  {images.length < 3 && (
                    <button
                      onClick={handleAddImage}
                      className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
                    >
                      <span className="text-xl">+</span>
                      <span className="text-xs">添加图片</span>
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      value={shop}
                      onChange={(e) => setShop(e.target.value)}
                      onFocus={() => setShowShopSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowShopSuggestions(false), 200)}
                      placeholder="选择店铺：搜索..."
                      className="w-full text-sm text-gray-700 placeholder:text-gray-400 bg-gray-50 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-amber-300"
                    />

                    {showShopSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 max-h-40 overflow-y-auto z-20">
                        {filteredShops.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setShop(s);
                              setShowShopSuggestions(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            📍 {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">评分</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="w-8 h-8 rounded flex items-center justify-center transition-transform active:scale-90"
                      >
                        <span className={`text-xl ${star <= rating ? 'text-amber-400' : 'text-gray-300'}`}>
                          ⭐
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">公开可见</span>
                    <button
                      onClick={() => setIsPublic(!isPublic)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        isPublic ? 'bg-amber-400' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          isPublic ? 'left-[22px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FeedPost;
