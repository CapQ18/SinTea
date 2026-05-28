import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { mockUserProfile, mockRanking } from '../../mock';

const Discover: React.FC = () => {
  const dnaData = [
    { name: '甜度', value: mockUserProfile.dna.sweet },
    { name: '茶味', value: mockUserProfile.dna.tea },
    { name: '奶味', value: mockUserProfile.dna.milk },
    { name: '冰度', value: mockUserProfile.dna.ice },
    { name: '口感', value: mockUserProfile.dna.texture },
    { name: '颜值', value: mockUserProfile.dna.look },
  ];

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 bg-cream z-40 pt-4 pb-2 px-4">
        <h1 className="text-xl font-bold text-dark-brown">发现</h1>
      </header>

      <div className="px-4 mt-4">
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-milk-tea to-caramel flex items-center justify-center">
              <span className="text-lg">🧬</span>
            </div>
            <div>
              <h2 className="font-semibold text-dark-brown">奶茶DNA</h2>
              <p className="text-sm text-mid-brown">你的专属口味画像</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={dnaData}>
                  <PolarGrid stroke="#F0E6D8" />
                  <PolarAngleAxis 
                    dataKey="name" 
                    tick={{ fill: '#8B7355', fontSize: 11 }} 
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 10]} 
                    tick={{ fill: '#C4B5A5', fontSize: 8 }}
                  />
                  <Radar
                    name="口味"
                    dataKey="value"
                    stroke="#F5D0A9"
                    fill="#F5D0A9"
                    fillOpacity={0.5}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-2">
            <span className="text-xs text-mid-brown">甜度</span>
            <span className="text-xs text-mid-brown">茶味</span>
            <span className="text-xs text-mid-brown">奶味</span>
          </div>
          <div className="flex justify-center gap-5 mt-1">
            <span className="text-xs text-mid-brown">冰度</span>
            <span className="text-xs text-mid-brown">口感</span>
            <span className="text-xs text-mid-brown">颜值</span>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-dark-brown mb-3">你的口味标签</h3>
          <div className="flex flex-wrap gap-2">
            {mockUserProfile.tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-milk-tea rounded-button text-dark-brown text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="card mt-4 p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🏆</span>
            <div>
              <h3 className="font-semibold text-dark-brown">本周榜单</h3>
              <p className="text-sm text-mid-brown">大家都在喝什么</p>
            </div>
          </div>

          <div className="space-y-3">
            {mockRanking.map((item) => (
              <div
                key={item.rank}
                className={`flex items-center gap-3 p-3 rounded-medium transition-colors ${
                  item.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : 'bg-cream'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.rank === 1
                      ? 'bg-yellow-400 text-white'
                      : item.rank === 2
                      ? 'bg-gray-300 text-white'
                      : item.rank === 3
                      ? 'bg-orange-400 text-white'
                      : 'bg-cream text-mid-brown border border-border'
                  }`}
                >
                  {item.rank}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-dark-brown">{item.name}</p>
                  <p className="text-xs text-mid-brown">{item.shop}</p>
                </div>
                <span className="text-sm font-semibold text-milk-tea">
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-4 p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">🔥</span>
            <div>
              <h3 className="font-semibold text-dark-brown">热门搜索</h3>
              <p className="text-sm text-mid-brown">大家都在搜</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['多肉葡萄', '杨枝甘露', '生椰拿铁', '幽兰拿铁', '芋泥波波', '芝士奶盖'].map(
              (keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-white rounded-tag text-sm text-dark-brown border border-border"
                >
                  {keyword}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
