import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../../services/postService';

type PostType = 'recommend' | 'neutral' | 'warning';

interface MilkTeaDNA {
  sweetness: number;
  tea: number;
  milk: number;
  taste: number;
  coolness: number;
  appearance: number;
}

const FeedPost: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shopName, setShopName] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('neutral');
  const [images, setImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rating, setRating] = useState(3);

  const [milkTeaDNA, setMilkTeaDNA] = useState<MilkTeaDNA>({
    sweetness: 50,
    tea: 50,
    milk: 50,
    taste: 50,
    coolness: 50,
    appearance: 50,
  });

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    if (images.length >= 6) {
      setErrorMessage('最多只能上传6张图片');
      return;
    }

    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      setErrorMessage('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImages(prev => [...prev, result]);
    };
    reader.onerror = () => {
      setErrorMessage('图片读取失败');
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!shopName.trim()) {
      setErrorMessage('请填写奶茶店名');
      return;
    }
    if (!drinkName.trim()) {
      setErrorMessage('请填写奶茶名');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('请填写评价内容');
      return;
    }

    setIsPosting(true);
    setErrorMessage('');

    try {
      await createPost({
        shopName: shopName.trim(),
        drinkName: drinkName.trim(),
        content: content.trim(),
        type: postType,
        images: images,
        rating: rating,
        dna: milkTeaDNA,
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '发布失败，请重试');
    } finally {
      setIsPosting(false);
    }
  };

  const isFormValid = shopName.trim() && drinkName.trim() && content.trim();

  const postTypes: { key: PostType; label: string; color: string }[] = [
    { key: 'recommend', label: '良心推荐', color: 'bg-success/15 text-success' },
    { key: 'neutral', label: '中肯客观', color: 'bg-primary/15 text-primary' },
    { key: 'warning', label: '避雷预警', color: 'bg-warning/15 text-warning' },
  ];

  const dnaLabels = [
    { key: 'sweetness', label: '甜度' },
    { key: 'tea', label: '茶味' },
    { key: 'milk', label: '奶味' },
    { key: 'taste', label: '口感' },
    { key: 'coolness', label: '凉度' },
    { key: 'appearance', label: '颜值' },
  ];

  const renderDNARadar = () => {
    const labels = dnaLabels.map(d => d.label);
    const values = dnaLabels.map(d => milkTeaDNA[d.key as keyof MilkTeaDNA]);
    const centerX = 100;
    const centerY = 100;
    const radius = 50;
    const levels = 5;

    const getPoint = (index: number, value: number, maxRadius: number) => {
      const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
      const r = (value / 100) * maxRadius;
      return {
        x: centerX + r * Math.cos(angle),
        y: centerY + r * Math.sin(angle),
      };
    };

    const levelPaths = [];
    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius / levels) * i;
      let path = '';
      for (let j = 0; j < 6; j++) {
        const point = getPoint(j, (i / levels) * 100, levelRadius);
        path += j === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`;
      }
      path += ' Z';
      levelPaths.push(<path key={i} d={path} fill="none" stroke="#E8E4DF" strokeWidth="1" />);
    }

    const axisLines = labels.map((_, index) => {
      const point = getPoint(index, 100, radius);
      return (
        <line
          key={index}
          x1={centerX}
          y1={centerY}
          x2={point.x}
          y2={point.y}
          stroke="#E8E4DF"
          strokeWidth="1"
        />
      );
    });

    const dataPoints = values.map((value, index) => getPoint(index, value, radius));
    const dataPath = `M ${dataPoints[0].x} ${dataPoints[0].y}` + 
      dataPoints.slice(1).map(p => ` L ${p.x} ${p.y}`).join('') + ' Z';

    const labelPoints = labels.map((label, index) => {
      const point = getPoint(index, 110, radius);
      return (
        <text
          key={index}
          x={point.x}
          y={point.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-text-gray"
        >
          {label}
        </text>
      );
    });

    return (
      <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto">
        {levelPaths}
        {axisLines}
        <path
          d={dataPath}
          fill="rgba(139, 115, 85, 0.15)"
          stroke="#8B7355"
          strokeWidth="2"
        />
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#8B7355"
          />
        ))}
        {labelPoints}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-border-light sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center text-text-secondary rounded-full hover:bg-bg-gray transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-text-primary">写评价</h1>
        <button
          onClick={handlePost}
          disabled={!isFormValid || isPosting}
          className={`px-4 py-1.5 rounded-button text-sm font-medium transition-all min-w-[60px] ${
            isFormValid && !isPosting
              ? 'btn-primary'
              : 'bg-bg-gray text-text-gray cursor-not-allowed'
          }`}
        >
          {isPosting ? '发布中' : '发布'}
        </button>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />

      {errorMessage && (
        <div className="bg-warning/10 text-warning px-4 py-2 text-sm">
          {errorMessage}
        </div>
      )}

      {showSuccess ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center text-4xl text-white mb-4">
            ✓
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">发布成功</h2>
          <p className="text-text-gray text-sm">正在返回首页...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="bg-white rounded-lg shadow-sm border border-border-light">
              <div className="p-4 border-b border-border-light">
                <span className="text-sm font-medium text-text-primary mb-3 block">上传图片</span>
                <div className="flex flex-wrap gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <img
                        src={img}
                        alt={`图片${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {images.length < 6 && (
                    <label
                      htmlFor="image-upload"
                      className="block w-20 h-20 rounded-lg bg-gradient-to-br from-bg-gray to-border-light flex items-center justify-center cursor-pointer hover:from-border hover:to-bg-gray transition-all border-2 border-dashed border-border"
                    >
                      <svg className="w-6 h-6 text-text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 4v16m8-8H4" strokeWidth="1.5" />
                      </svg>
                    </label>
                  )}
                </div>
              </div>

              <div className="p-4 border-b border-border-light">
                <span className="text-sm font-medium text-text-primary mb-3 block">店铺信息</span>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="奶茶店名"
                  className="input-field"
                />
              </div>

              <div className="p-4 border-b border-border-light">
                <span className="text-sm font-medium text-text-primary mb-3 block">奶茶名称</span>
                <input
                  type="text"
                  value={drinkName}
                  onChange={(e) => setDrinkName(e.target.value)}
                  placeholder="奶茶名"
                  className="input-field"
                />
              </div>

              <div className="p-4 border-b border-border-light">
                <span className="text-sm font-medium text-text-primary mb-3 block">评分</span>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }, (_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRating(idx + 1)}
                      className="transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-8 h-8 ${idx < rating ? 'rating-star' : 'rating-star-empty'}`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-text-gray">{rating}分</span>
                </div>
              </div>

              <div className="p-4 border-b border-border-light">
                <span className="text-sm font-medium text-text-primary mb-3 block">评价内容</span>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="添加具体评价"
                  rows={4}
                  className="w-full text-sm text-text-secondary placeholder:text-text-gray bg-transparent border-none outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="p-4 border-b border-border-light">
                <span className="text-sm font-medium text-text-primary mb-3 block">奶茶DNA</span>
                {renderDNARadar()}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {dnaLabels.map((dna) => (
                    <div key={dna.key} className="flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-gray">{dna.label}</span>
                        <span className="text-xs font-medium text-primary">{milkTeaDNA[dna.key as keyof MilkTeaDNA]}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={milkTeaDNA[dna.key as keyof MilkTeaDNA]}
                        onChange={(e) => setMilkTeaDNA({
                          ...milkTeaDNA,
                          [dna.key]: Number(e.target.value)
                        })}
                        className="w-full h-2 bg-bg-gray rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <span className="text-sm font-medium text-text-primary mb-3 block">评价类型</span>
                <div className="flex justify-center gap-3">
                  {postTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setPostType(type.key)}
                      className={`px-5 py-2.5 rounded-button text-sm font-medium transition-all ${
                        postType === type.key
                          ? `${type.color} ring-2 ring-offset-1 ring-current`
                          : 'bg-bg-gray text-text-gray hover:bg-border'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPost;