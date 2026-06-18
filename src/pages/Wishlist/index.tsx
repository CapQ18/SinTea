import React, { useState, useEffect } from 'react';
import { API, request } from '../../services/apiService';

interface WishlistItem {
  id: number;
  drinkName: string;
  shopName: string;
  category: string;
  imageUrl?: string;
  isDrank: boolean;
  notes?: string;
}

type TabType = 'collection' | 'nearby';

const Wishlist: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('collection');
  const [showDrank, setShowDrank] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<number, 'like' | 'dislike' | null>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ shopName: '', drinkName: '', category: '奶茶', notes: '' });

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      const response = await request<{ success: boolean; wishlists?: WishlistItem[] }>(API.wishlists.list);
      if (response.success && response.wishlists) {
        setItems(response.wishlists);
      }
    } catch {
      console.error('Failed to load wishlists');
    }
  };

  const filteredItems = items.filter((item) => item.isDrank === showDrank);

  const toggleStatus = (id: number) => {
    setStatusMap((prev) => ({
      ...prev,
      [id]: prev[id] === 'like' ? 'dislike' : prev[id] === 'dislike' ? null : 'like'
    }));
  };

  const handleDrank = async (id: number, currentIsDrank: boolean) => {
    try {
      await request<{ success: boolean }>(API.wishlists.update(String(id)), {
        method: 'PUT',
        body: JSON.stringify({ isDrank: !currentIsDrank }),
      });
      loadWishlists();
    } catch {
      console.error('Failed to update wishlist');
    }
  };

  const handleAdd = async () => {
    if (!newItem.shopName || !newItem.drinkName) {
      return;
    }

    try {
      await request<{ success: boolean }>(API.wishlists.create, {
        method: 'POST',
        body: JSON.stringify(newItem),
      });
      setShowAddModal(false);
      setNewItem({ shopName: '', drinkName: '', category: '奶茶', notes: '' });
      loadWishlists();
    } catch {
      console.error('Failed to add wishlist');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除吗？')) {
      return;
    }

    try {
      await request<{ success: boolean }>(API.wishlists.delete(String(id)), {
        method: 'DELETE',
      });
      loadWishlists();
    } catch {
      console.error('Failed to delete wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 bg-white z-40 px-4 shadow-sm">
        <div className="flex border-b border-border-light">
          <button
            onClick={() => setActiveTab('collection')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'collection' ? 'text-primary' : 'text-text-gray'
            }`}
          >
            收藏
            {activeTab === 'collection' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-4 text-sm font-medium transition-colors relative ${
              activeTab === 'nearby' ? 'text-primary' : 'text-text-gray'
            }`}
          >
            附近
            {activeTab === 'nearby' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        <div className="flex gap-2 mt-4 pb-4">
          <button
            onClick={() => setShowDrank(false)}
            className={`flex-1 py-2.5 rounded-button text-sm font-medium transition-all ${
              !showDrank
                ? 'btn-primary'
                : 'bg-bg-gray text-text-gray hover:bg-border'
            }`}
          >
            想喝
          </button>
          <button
            onClick={() => setShowDrank(true)}
            className={`flex-1 py-2.5 rounded-button text-sm font-medium transition-all ${
              showDrank
                ? 'bg-success text-white shadow-md'
                : 'bg-bg-gray text-text-gray hover:bg-border'
            }`}
          >
            已喝
          </button>
        </div>
      </header>

      <div className="px-4 mt-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary-light to-accent flex items-center justify-center text-5xl mb-4 shadow-md">
              🧋
            </div>
            <p className="text-text-gray text-base">
              {showDrank ? '还没有喝过的奶茶' : '还没有想喝的奶茶'}
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-6 py-2.5 btn-primary text-sm"
            >
              {showDrank ? '去发现' : '去添加'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-border-light group hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative">
                  <img
                    src={item.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.drinkName}`}
                    alt={item.drinkName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {statusMap[item.id] && (
                    <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                      statusMap[item.id] === 'like' 
                        ? 'bg-success text-white' 
                        : 'bg-warning text-white'
                    }`}>
                      {statusMap[item.id] === 'like' ? '👍' : '👎'}
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className="w-full py-2 rounded-button text-xs font-medium bg-white/90 text-text-primary hover:bg-white transition-colors"
                    >
                      {statusMap[item.id] === 'like' ? '取消喜欢' : statusMap[item.id] === 'dislike' ? '取消踩雷' : '标记'}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {item.drinkName}
                      </p>
                      <p className="text-xs text-text-gray mt-0.5 truncate">{item.shopName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-text-gray">{item.category}</span>
                    <button
                      onClick={() => handleDrank(item.id, item.isDrank)}
                      className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      {item.isDrank ? '移回' : '已喝'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full btn-primary shadow-lg flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform z-30"
      >
        +
      </button>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-2xl w-full p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">添加心愿</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-gray">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary mb-1 block">店铺名称</label>
                <input
                  type="text"
                  value={newItem.shopName}
                  onChange={(e) => setNewItem({ ...newItem, shopName: e.target.value })}
                  placeholder="输入店铺名"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1 block">奶茶名称</label>
                <input
                  type="text"
                  value={newItem.drinkName}
                  onChange={(e) => setNewItem({ ...newItem, drinkName: e.target.value })}
                  placeholder="输入奶茶名"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1 block">分类</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="奶茶">奶茶</option>
                  <option value="果茶">果茶</option>
                  <option value="纯茶">纯茶</option>
                  <option value="咖啡">咖啡</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1 block">备注（可选）</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  placeholder="添加备注..."
                  rows={2}
                  className="input-field w-full resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!newItem.shopName || !newItem.drinkName}
              className={`w-full mt-6 py-3 rounded-button text-sm font-medium transition-all ${
                newItem.shopName && newItem.drinkName
                  ? 'btn-primary'
                  : 'bg-bg-gray text-text-gray cursor-not-allowed'
              }`}
            >
              确认添加
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
