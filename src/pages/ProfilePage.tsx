import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { User } from '../types';
import { getUserProfile } from '../services/mockData';
import MilkTeaSprite from '../components/MilkTeaSprite';

const menuItems = [
  { label: '我的评价', icon: 'review', path: '/reviews' },
  { label: '心愿单', icon: 'wishlist', path: '/wishlist' },
  { label: '喝过的记录', icon: 'history', path: '/history' },
  { label: '设置', icon: 'settings', path: '/settings' },
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile();
      setUser(data);
    } finally {
      setLoading(false);
    }
  };

  const getTasteLabel = (profile: User['tasteProfile']) => {
    const traits = [];
    if (profile.sweetness > 70) traits.push('偏甜');
    if (profile.teaFlavor > 70) traits.push('茶味重');
    if (profile.milkFlavor > 70) traits.push('奶味浓');
    if (profile.iceLevel > 70) traits.push('爱喝冰');
    if (profile.sweetness < 40) traits.push('低糖');
    if (profile.iceLevel < 40) traits.push('常喝热');
    
    if (traits.length === 0) return '均衡口味';
    return `你喜欢${traits.join('、')}的奶茶`;
  };

  const radarData = user ? [
    { name: '甜度', value: user.tasteProfile.sweetness },
    { name: '茶味', value: user.tasteProfile.teaFlavor },
    { name: '奶味', value: user.tasteProfile.milkFlavor },
    { name: '冰度', value: user.tasteProfile.iceLevel },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <MilkTeaSprite emotion="happy" size="large" />
          <div className="w-6 h-6 border-2 border-milk-tea-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      <div className="bg-gradient-to-br from-milk-tea-400 to-milk-tea-600 px-4 pt-12 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">我的</h1>
          <button className="p-2 bg-white/20 rounded-full">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <img 
              src={user?.avatar} 
              alt={user?.nickname}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{user?.nickname}</h2>
            <p className="text-sm text-white/70">{user?.bio}</p>
          </div>
          <button className="px-4 py-2 bg-white text-milk-tea-600 rounded-full text-sm font-medium">
            编辑资料
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user?.drinksCount}</p>
            <p className="text-xs text-white/70">喝过的杯数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user?.reviewCount}</p>
            <p className="text-xs text-white/70">评价数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{user?.likeCount}</p>
            <p className="text-xs text-white/70">获赞数</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-16 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <MilkTeaSprite size="small" emotion="happy" />
            <div>
              <h3 className="font-bold text-dark-brown">AI口味画像</h3>
              <p className="text-sm text-matcha-600">{user ? getTasteLabel(user.tasteProfile) : ''}</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#D4A574" strokeWidth={1} />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fill: '#5C4033', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fill: '#999', fontSize: 10 }}
                />
                <Radar
                  name="口味偏好"
                  dataKey="value"
                  stroke="#8FBC8F"
                  fill="#8FBC8F"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.path === '/wishlist') {
                  navigate('/wishlist');
                }
              }}
              className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-milk-tea-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                item.icon === 'review' ? 'bg-milk-tea-100' :
                item.icon === 'wishlist' ? 'bg-matcha-100' :
                item.icon === 'history' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                {item.icon === 'review' && (
                  <svg className="w-5 h-5 text-milk-tea-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                )}
                {item.icon === 'wishlist' && (
                  <svg className="w-5 h-5 text-matcha-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                )}
                {item.icon === 'history' && (
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                )}
                {item.icon === 'settings' && (
                  <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </div>
              <span className="flex-1 text-left font-medium text-dark-brown">{item.label}</span>
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4">
          <h3 className="font-bold text-dark-brown mb-3">我的成就</h3>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🥇</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">奶茶达人</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">评论能手</p>
            </div>
            <div className="flex flex-col items-center opacity-50">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">神秘成就</p>
            </div>
            <div className="flex flex-col items-center opacity-50">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">神秘成就</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
