import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, request } from '../../services/apiService';
import { getCurrentUser, logout } from '../../services/authService';

type TabType = 'dashboard' | 'users' | 'feeds' | 'logs' | 'reports';

type ReportAction = 'approve' | 'reject' | 'delete_content' | 'ban_user';

interface AdminStats {
  totalUsers: number;
  totalFeeds: number;
  totalLikes: number;
  totalComments: number;
  todayNewUsers: number;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  bio: string;
  role: string;
  createdAt: string;
}

interface AdminFeed {
  id: number;
  userId: number;
  shopName: string;
  drinkName: string;
  content: string;
  type: string;
  featured: number;
  likes: number;
  createdAt: string;
  username: string;
  nickname: string;
}

interface AdminLog {
  id: number;
  adminId: number;
  action: string;
  targetType: string;
  targetId: number;
  detail: string;
  createdAt: string;
  adminName: string;
}

interface AdminReport {
  id: number;
  reporterId: number;
  targetType: string;
  targetId: number;
  reason: string;
  detail: string;
  status: string;
  createdAt: string;
  reporterName: string;
  reporterNick: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [feeds, setFeeds] = useState<AdminFeed[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [feedFilter, setFeedFilter] = useState('all');
  const [reportFilter, setReportFilter] = useState('pending');
  const [message, setMessage] = useState('');

  const currentUser = getCurrentUser();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'reports') loadData();
  }, [reportFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const data = await request<{ success: boolean; stats: AdminStats }>(API.admin.stats);
        if (data.success) setStats(data.stats);
      } else if (activeTab === 'users') {
        const data = await request<{ success: boolean; users: AdminUser[] }>(`${API.admin.users}?search=${encodeURIComponent(userSearch)}`);
        if (data.success) setUsers(data.users);
      } else if (activeTab === 'feeds') {
        const data = await request<{ success: boolean; feeds: AdminFeed[] }>(`${API.admin.feeds}?filter=${feedFilter}`);
        if (data.success) setFeeds(data.feeds);
      } else if (activeTab === 'logs') {
        const data = await request<{ success: boolean; logs: AdminLog[] }>(API.admin.logs);
        if (data.success) setLogs(data.logs);
      } else if (activeTab === 'reports') {
        const data = await request<{ reports: AdminReport[]; total: number; page: number; hasMore: boolean }>(
          `${API.admin.reports}?status=${reportFilter}&page=1&limit=20`
        );
        setReports(data.reports || []);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    try {
      await request(
        API.admin.updateUser(String(userId)),
        { method: 'PUT', body: JSON.stringify({ role: newRole }) }
      );
      setMessage(`已将用户 ${userId} 设置为 ${newRole}`);
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm(`确定删除用户 ${userId}？该用户的所有动态、评论、点赞都会被删除。`)) return;
    try {
      await request(API.admin.deleteUser(String(userId)), { method: 'DELETE' });
      setMessage('用户已删除');
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleToggleFeatured = async (feedId: number, featured: number) => {
    try {
      await request(
        API.admin.updateFeed(String(feedId)),
        { method: 'PUT', body: JSON.stringify({ featured: featured === 1 ? 0 : 1 }) }
      );
      setMessage(featured === 1 ? '已取消精华' : '已设为精华');
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleDeleteFeed = async (feedId: number) => {
    if (!confirm(`确定删除动态 ${feedId}？`)) return;
    try {
      await request(API.admin.deleteFeed(String(feedId)), { method: 'DELETE' });
      setMessage('动态已删除');
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleReportAction = async (reportId: number, action: ReportAction) => {
    const actionLabels: Record<ReportAction, string> = {
      approve: '通过',
      reject: '驳回',
      delete_content: '删除内容',
      ban_user: '封禁用户',
    };
    if (!confirm(`确定执行「${actionLabels[action]}」操作？`)) return;
    try {
      await request(API.admin.reportAction(reportId), {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      setMessage(`已${actionLabels[action]}`);
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'dashboard', label: '数据概览', icon: '📊' },
    { key: 'users', label: '用户管理', icon: '👥' },
    { key: 'feeds', label: '动态管理', icon: '📝' },
    { key: 'logs', label: '操作日志', icon: '📋' },
    { key: 'reports', label: '举报管理', icon: '🚩' },
  ];

  return (
    <div className="min-h-screen bg-bg-gray">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-lg">
              🍵
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">SinTea 管理后台</h1>
              <p className="text-xs text-text-gray">
                管理员: {currentUser?.nickname || currentUser?.username}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              返回前台
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* 侧边栏 */}
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setMessage(''); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-bg-gray'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 min-w-0">
          {message && (
            <div className="mb-4 px-4 py-2.5 bg-success/10 text-success rounded-lg text-sm">
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && stats && (
                <Dashboard stats={stats} />
              )}

              {activeTab === 'users' && (
                <UsersTab
                  users={users}
                  search={userSearch}
                  onSearchChange={setUserSearch}
                  onSearch={loadData}
                  onUpdateRole={handleUpdateUserRole}
                  onDelete={handleDeleteUser}
                />
              )}

              {activeTab === 'feeds' && (
                <FeedsTab
                  feeds={feeds}
                  filter={feedFilter}
                  onFilterChange={(f) => { setFeedFilter(f); loadData(); }}
                  onToggleFeatured={handleToggleFeatured}
                  onDelete={handleDeleteFeed}
                />
              )}

              {activeTab === 'logs' && (
                <LogsTab logs={logs} />
              )}

              {activeTab === 'reports' && (
                <ReportsTab
                  reports={reports}
                  filter={reportFilter}
                  onFilterChange={setReportFilter}
                  onAction={handleReportAction}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ stats: AdminStats }> = ({ stats }) => (
  <div>
    <h2 className="text-xl font-bold text-text-primary mb-4">数据概览</h2>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {[
        { label: '总用户数', value: stats.totalUsers, color: 'bg-blue-500' },
        { label: '总动态数', value: stats.totalFeeds, color: 'bg-green-500' },
        { label: '总点赞数', value: stats.totalLikes, color: 'bg-orange-500' },
        { label: '总评论数', value: stats.totalComments, color: 'bg-purple-500' },
        { label: '今日新增', value: stats.todayNewUsers, color: 'bg-red-500' },
      ].map((item) => (
        <div key={item.label} className="bg-white rounded-xl p-4 shadow-sm">
          <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white text-lg mb-2`}>
            📈
          </div>
          <div className="text-2xl font-bold text-text-primary">{item.value}</div>
          <div className="text-xs text-text-gray">{item.label}</div>
        </div>
      ))}
    </div>
  </div>
);

const UsersTab: React.FC<{
  users: AdminUser[];
  search: string;
  onSearchChange: (v: string) => void;
  onSearch: () => void;
  onUpdateRole: (id: number, role: string) => void;
  onDelete: (id: number) => void;
}> = ({ users, search, onSearchChange, onSearch, onUpdateRole, onDelete }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-text-primary">用户管理</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="搜索用户名/昵称/邮箱"
          className="px-3 py-2 text-sm border border-border-light rounded-lg w-64"
        />
        <button onClick={onSearch} className="px-4 py-2 bg-primary text-white text-sm rounded-lg">
          搜索
        </button>
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-bg-gray">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-text-gray">用户</th>
            <th className="px-4 py-3 text-left font-medium text-text-gray">邮箱</th>
            <th className="px-4 py-3 text-left font-medium text-text-gray">角色</th>
            <th className="px-4 py-3 text-left font-medium text-text-gray">注册时间</th>
            <th className="px-4 py-3 text-left font-medium text-text-gray">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-border-light hover:bg-bg-gray">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="font-medium text-text-primary">{user.nickname}</div>
                    <div className="text-xs text-text-gray">@{user.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-text-secondary">{user.email}</td>
              <td className="px-4 py-3">
                <select
                  value={user.role}
                  onChange={(e) => onUpdateRole(user.id, e.target.value)}
                  className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                    user.role === 'admin' ? 'bg-primary/15 text-primary' :
                    user.role === 'banned' ? 'bg-warning/15 text-warning' :
                    'bg-bg-gray text-text-gray'
                  }`}
                >
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                  <option value="banned">已封禁</option>
                </select>
              </td>
              <td className="px-4 py-3 text-text-gray">{user.createdAt}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onDelete(user.id)}
                  className="px-3 py-1 text-xs bg-warning/10 text-warning rounded hover:bg-warning/20"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="px-4 py-12 text-center text-text-gray">暂无用户</div>
      )}
    </div>
  </div>
);

const FeedsTab: React.FC<{
  feeds: AdminFeed[];
  filter: string;
  onFilterChange: (f: string) => void;
  onToggleFeatured: (id: number, featured: number) => void;
  onDelete: (id: number) => void;
}> = ({ feeds, filter, onFilterChange, onToggleFeatured, onDelete }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-text-primary">动态管理</h2>
      <div className="flex gap-2">
        {[
          { key: 'all', label: '全部' },
          { key: 'featured', label: '精华' },
          { key: 'normal', label: '普通' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              filter === f.key ? 'bg-primary text-white' : 'bg-bg-gray text-text-gray'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
    <div className="space-y-3">
      {feeds.map((feed) => (
        <div key={feed.id} className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-text-primary">@{feed.nickname}</span>
                <span className="text-xs text-text-gray">
                  {feed.shopName} · {feed.drinkName}
                </span>
                {feed.featured === 1 && (
                  <span className="px-2 py-0.5 bg-success/15 text-success text-xs rounded">精华</span>
                )}
                <span className="text-xs text-text-gray">{feed.createdAt}</span>
              </div>
              <p className="text-sm text-text-secondary line-clamp-2">{feed.content}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-gray">
                <span>👍 {feed.likes}</span>
                <span>类型: {feed.type}</span>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onToggleFeatured(feed.id, feed.featured)}
                className={`px-3 py-1 text-xs rounded ${
                  feed.featured === 1
                    ? 'bg-bg-gray text-text-gray'
                    : 'bg-success/15 text-success'
                }`}
              >
                {feed.featured === 1 ? '取消精华' : '设为精华'}
              </button>
              <button
                onClick={() => onDelete(feed.id)}
                className="px-3 py-1 text-xs bg-warning/10 text-warning rounded"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
      {feeds.length === 0 && (
        <div className="py-12 text-center text-text-gray">暂无动态</div>
      )}
    </div>
  </div>
);

const LogsTab: React.FC<{ logs: AdminLog[] }> = ({ logs }) => (
  <div>
    <h2 className="text-xl font-bold text-text-primary mb-4">操作日志</h2>
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-bg-gray">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-text-gray">时间</th>
            <th className="px-4 py-3 text-left font-medium text-text-gray">管理员</th>
            <th className="px-4 py-3 text-left font-medium text-text-gray">操作</th>
            <th className="px-4 py-3 text-left font-medium text-text-gray">详情</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-border-light">
              <td className="px-4 py-3 text-text-gray">{log.createdAt}</td>
              <td className="px-4 py-3 font-medium text-text-primary">{log.adminName}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {log.detail || `${log.targetType} #${log.targetId}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && (
        <div className="px-4 py-12 text-center text-text-gray">暂无日志</div>
      )}
    </div>
  </div>
);

const ReportsTab: React.FC<{
  reports: AdminReport[];
  filter: string;
  onFilterChange: (f: string) => void;
  onAction: (id: number, action: ReportAction) => void;
}> = ({ reports, filter, onFilterChange, onAction }) => {
  const typeMap: Record<string, string> = {
    feed: '动态',
    comment: '评论',
    user: '用户',
  };
  const statusMap: Record<string, { label: string; cls: string }> = {
    pending: { label: '待处理', cls: 'bg-warning/15 text-warning' },
    resolved: { label: '已处理', cls: 'bg-success/15 text-success' },
    rejected: { label: '已驳回', cls: 'bg-bg-gray text-text-gray' },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-text-primary">举报管理</h2>
        <div className="flex gap-2">
          {[
            { key: 'pending', label: '待处理' },
            { key: 'resolved', label: '已处理' },
            { key: 'rejected', label: '已驳回' },
            { key: 'all', label: '全部' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filter === f.key ? 'bg-primary text-white' : 'bg-bg-gray text-text-gray'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {reports.map((report) => {
          const statusInfo = statusMap[report.status] || { label: report.status, cls: 'bg-bg-gray text-text-gray' };
          const canDeleteContent = report.targetType === 'feed' || report.targetType === 'comment';
          return (
            <div key={report.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                      {typeMap[report.targetType] || report.targetType}
                    </span>
                    <span className="text-sm font-medium text-text-primary">举报原因：{report.reason}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-text-gray">{report.createdAt}</span>
                  </div>
                  {report.detail && (
                    <p className="text-sm text-text-secondary mb-2 break-words">{report.detail}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-text-gray">
                    <span>举报人：{report.reporterNick || report.reporterName || `用户 #${report.reporterId}`}</span>
                    <span>目标 ID：#{report.targetId}</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  {canDeleteContent && (
                    <button
                      onClick={() => onAction(report.id, 'delete_content')}
                      className="px-3 py-1 text-xs bg-warning/10 text-warning rounded hover:bg-warning/20"
                    >
                      删除内容
                    </button>
                  )}
                  <button
                    onClick={() => onAction(report.id, 'ban_user')}
                    className="px-3 py-1 text-xs bg-warning/10 text-warning rounded hover:bg-warning/20"
                  >
                    封禁用户
                  </button>
                  <button
                    onClick={() => onAction(report.id, 'reject')}
                    className="px-3 py-1 text-xs bg-bg-gray text-text-gray rounded"
                  >
                    驳回
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {reports.length === 0 && (
          <div className="py-12 text-center text-text-gray">暂无举报</div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
