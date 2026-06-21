import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API, request } from '../../services/apiService';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface UserProfile {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  bio: string;
  feedsCount: number;
  likesCount: number;
  tasteProfile?: {
    sweetness: number; tea: number; milk: number; taste: number; coolness: number; appearance: number;
  };
}

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [treatingId, setTreatingId] = useState<number | null>(null);
  const [userFeeds, setUserFeeds] = useState<any[]>([]);
  const [feedsPage, setFeedsPage] = useState(1);
  const [hasMoreFeeds, setHasMoreFeeds] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadUser();
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await request<{ success: boolean; user?: UserProfile }>(API.users.get(id!));
      if (data.success && data.user) setUser(data.user);

      // Check follow status
      try {
        const follows = await request<{ success: boolean; follows?: any[] }>(API.follows.list);
        if (follows.success && follows.follows) {
          setIsFollowing(follows.follows.some((f: any) => f.id === parseInt(id!)));
        }
      } catch { /* ignore */ }

      // Load wishlist
      try {
        const wl = await request<{ success: boolean; wishlists?: any[] }>(
          API.wishlists.userWishlist(id!)
        );
        if (wl.success && wl.wishlists) setWishlists(wl.wishlists);
      } catch { /* ignore */ }

      // Load user feeds
      loadUserFeeds(1);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const loadUserFeeds = async (page: number) => {
    try {
      const data = await request<{ success: boolean; feeds?: any[]; hasMore?: boolean }>(
        `${API.users.feeds(id!)}?page=${page}`
      );
      if (data.success && data.feeds) {
        setUserFeeds(prev => page === 1 ? data.feeds! : [...prev, ...data.feeds!]);
        setHasMoreFeeds(data.hasMore || false);
        setFeedsPage(page);
      }
    } catch { /* ignore */ }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await request(API.follows.delete, {
          method: 'DELETE',
          body: JSON.stringify({ targetUserId: parseInt(id!) }),
        });
      } else {
        await request(API.follows.create, {
          method: 'POST',
          body: JSON.stringify({ targetUserId: parseInt(id!) }),
        });
      }
      setIsFollowing(!isFollowing);
    } catch { /* ignore */ }
  };

  const handleTreat = async (wishlistId: number) => {
    setTreatingId(wishlistId);
    try {
      const data = await request<{ success: boolean; message?: string; conversationId?: number }>(
        API.wishlists.treat(String(wishlistId)),
        { method: 'POST' }
      );
      if (data.success) {
        alert(data.message || '已发送！');
        navigate(`/chat/${user!.id}`);
      } else {
        alert(data.message || '操作失败');
      }
    } catch {
      alert('操作失败');
    } finally {
      setTreatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-text-gray">用户不存在</p>
        <button onClick={() => navigate(-1)} className="btn-primary px-4 py-2 rounded-lg text-sm">返回</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 bg-white z-40 px-4 py-3 border-b border-border-light flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-text-secondary rounded-full hover:bg-bg-gray">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-semibold">{user.nickname || user.username}</h1>
      </header>

      <div className="px-4 mt-3">
        {/* 用户信息 */}
        <div className="bg-white rounded-lg p-6 text-center">
          <img src={user.avatar} alt="" className="w-20 h-20 rounded-full mx-auto object-cover bg-gray-100" />
          <h2 className="text-lg font-semibold mt-3">{user.nickname || user.username}</h2>
          <p className="text-sm text-text-gray mt-1">@{user.username}</p>
          {user.bio && <p className="text-sm text-text-secondary mt-2">{user.bio}</p>}

          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <p className="text-xl font-semibold">{user.feedsCount}</p>
              <p className="text-xs text-text-gray">动态</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">{user.likesCount}</p>
              <p className="text-xs text-text-gray">获赞</p>
            </div>
          </div>

          <div className="flex gap-3 mt-4 justify-center">
            <button onClick={handleFollow}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing ? 'bg-bg-gray text-text-gray' : 'bg-primary text-white'}`}>
              {isFollowing ? '已关注' : '+ 关注'}
            </button>
            <button onClick={() => navigate(`/chat/${user.id}`)}
              className="px-6 py-2 rounded-full text-sm font-medium border border-primary text-primary">
              发消息
            </button>
          </div>
        </div>

        {/* 口味画像 */}
        {user.tasteProfile && (
          <div className="bg-white rounded-lg p-4 mt-3">
            <h3 className="text-sm font-semibold text-text-primary mb-2">口味画像</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[
                  { name: '甜度', value: user.tasteProfile.sweetness },
                  { name: '茶味', value: user.tasteProfile.tea },
                  { name: '奶味', value: user.tasteProfile.milk },
                  { name: '口感', value: user.tasteProfile.taste },
                  { name: '清凉', value: user.tasteProfile.coolness },
                  { name: '颜值', value: user.tasteProfile.appearance },
                ]}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="口味" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 心愿单 */}
        <div className="bg-white rounded-lg p-4 mt-3">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            心愿单 ({wishlists.length})
          </h3>
          {wishlists.length === 0 ? (
            <p className="text-xs text-text-gray text-center py-4">暂无心愿饮品</p>
          ) : (
            <div className="space-y-2">
              {wishlists.map((w: any) => (
                <div key={w.id} className="flex items-center gap-3 p-2 bg-bg-gray rounded-lg">
                  {w.imageUrl ? (
                    <img src={w.imageUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-lg">🧋</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{w.drinkName}</p>
                    <p className="text-xs text-text-gray">{w.shopName} · {w.category}</p>
                  </div>
                  {isFollowing && (
                    <button
                      onClick={() => handleTreat(w.id)}
                      disabled={treatingId === w.id}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary text-white flex-shrink-0 disabled:opacity-50"
                    >
                      {treatingId === w.id ? '...' : '请她喝'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TA 的动态 */}
        <div className="bg-white rounded-lg p-4 mt-3">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            TA 的动态 ({user.feedsCount})
          </h3>
          {userFeeds.length === 0 ? (
            <p className="text-xs text-text-gray text-center py-4">暂无动态</p>
          ) : (
            <div className="space-y-2">
              {userFeeds.map((feed: any) => (
                <div
                  key={feed.id}
                  className="p-3 bg-bg-gray rounded-lg cursor-pointer active:scale-[0.99]"
                  onClick={() => navigate(`/detail/${feed.id}`)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`tag text-xs ${
                      feed.type === 'recommend' ? 'tag-recommend' :
                      feed.type === 'warning' ? 'tag-warning' : 'tag-neutral'
                    }`}>
                      {feed.type === 'recommend' ? '推荐' : feed.type === 'warning' ? '避雷' : '客观'}
                    </span>
                    <span className="text-xs text-text-gray">#{feed.drinkName}</span>
                    <span className="text-xs text-yellow-500 ml-auto">⭐ {feed.rating}</span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">{feed.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-gray">
                    <span>❤️ {feed.likes || 0}</span>
                    <span>💬 {feed.comments?.length || 0}</span>
                  </div>
                </div>
              ))}
              {hasMoreFeeds && (
                <button
                  onClick={() => loadUserFeeds(feedsPage + 1)}
                  className="w-full py-2 text-xs text-primary font-medium"
                >
                  加载更多
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
