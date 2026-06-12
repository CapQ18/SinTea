import React, { useState } from 'react';
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
  const [shopName, setShopName] = useState('');
  const [drinkName, setDrinkName] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('neutral');
  const [images, setImages] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [milkTeaDNA, setMilkTeaDNA] = useState<MilkTeaDNA>({
    sweetness: 50,
    tea: 50,
    milk: 50,
    taste: 50,
    coolness: 50,
    appearance: 50,
  });

  const handleAddImage = () => {
    if (images.length < 6) {
      const newImage = `https://picsum.photos/seed/${Date.now()}/400/400`;
      setImages([...images, newImage]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    if (!shopName.trim() || !drinkName.trim() || !content.trim()) return;

    setIsPosting(true);
    
    createPost({
      shopName: shopName.trim(),
      drinkName: drinkName.trim(),
      content: content.trim(),
      type: postType,
      images: images,
      dna: milkTeaDNA,
    });
    
    setTimeout(() => {
      setIsPosting(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }, 500);
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
      let path = `M ${centerX + levelRadius} ${centerY}`;
      for (let j = 1; j <= 6; j++) {
        const point = getPoint(j, (i / levels) * 100, levelRadius);
        path += ` L ${point.x} ${point.y}`;
      }
      path += ' Z';
      levelPaths.push(<path key={i} d={path} fill="none" stroke="#E8E8E8" strokeWidth="1" />);
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
          stroke="#E8E8E8"
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
          className={`px-4 py-1.5 rounded-button text-sm font-medium transition-all ${
            isFormValid && !isPosting
              ? 'bg-primary text-white active:scale-95'
              : 'bg-bg-gray text-text-gray cursor-not-allowed'
          }`}
        >
          {isPosting ? '发布中...' : '发布'}
        </button>
      </header>

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
            <div className="bg-white rounded-lg">
              <div className="p-4">
                <div
                  className="w-24 h-24 rounded-lg bg-bg-gray flex items-center justify-center cursor-pointer hover:bg-border transition-colors"
                  onClick={handleAddImage}
                >
                  <svg className="w-8 h-8 text-text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
                    <path d="M12 8v8M8 12h8" strokeWidth="1.5" />
                  </svg>
                </div>

                {images.length > 0 && (
                  <div className="mt-3 flex gap-2">
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
                      <div
                        className="w-20 h-20 rounded-lg bg-bg-gray flex items-center justify-center cursor-pointer hover:bg-border transition-colors"
                        onClick={handleAddImage}
                      >
                        <svg className="w-6 h-6 text-text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 4v16m8-8H4" strokeWidth="1.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-4 pb-4">
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="奶茶店名"
                  className="input-field"
                />
              </div>

              <div className="px-4 pb-4">
                <input
                  type="text"
                  value={drinkName}
                  onChange={(e) => setDrinkName(e.target.value)}
                  placeholder="奶茶名"
                  className="input-field"
                />
              </div>

              <div className="px-4 pb-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="添加具体评价"
                  rows={4}
                  className="w-full text-sm text-text-secondary placeholder:text-text-gray bg-transparent border-none outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="px-4 pb-4">
                <span className="text-sm text-text-primary font-medium">奶茶DNA</span>
                {renderDNARadar()}
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {dnaLabels.map((dna) => (
                    <div key={dna.key} className="flex items-center justify-between">
                      <span className="text-xs text-text-gray">{dna.label}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={milkTeaDNA[dna.key as keyof MilkTeaDNA]}
                        onChange={(e) => setMilkTeaDNA({
                          ...milkTeaDNA,
                          [dna.key]: Number(e.target.value)
                        })}
                        className="w-20 h-1.5 bg-bg-gray rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="flex justify-center gap-3">
                  {postTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setPostType(type.key)}
                      className={`px-4 py-2 rounded-button text-xs font-medium transition-colors ${
                        postType === type.key
                          ? `${type.color} ring-1 ring-offset-1 ring-current`
                          : 'bg-bg-gray text-text-gray'
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
