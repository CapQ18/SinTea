import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateProfile } from '../../services/authService';
import { User } from '../../types/user';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setNickname(currentUser.nickname || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatar || '');
    }
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setErrorMessage('请选择图片文件');
      return;
    }

    // 检查文件大小（限制 2MB）
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('图片大小不能超过 2MB');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAvatarUrl(base64);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setErrorMessage('图片读取失败');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorMessage('图片处理失败');
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      const result = await updateProfile({ nickname, bio, avatar: avatarUrl });

      if (result.success) {
        navigate('/profile');
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 bg-white z-40 px-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/profile')}
          className="w-10 h-10 flex items-center justify-center text-text-secondary rounded-full hover:bg-bg-gray transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-text-primary">编辑资料</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-1.5 rounded-button text-sm font-medium transition-all min-w-[60px] ${
            isSaving ? 'bg-bg-gray text-text-gray cursor-not-allowed' : 'btn-primary'
          }`}
        >
          {isSaving ? '保存中' : '保存'}
        </button>
      </header>

      {errorMessage && (
        <div className="bg-warning/10 text-warning px-4 py-2 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg p-6">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-full overflow-hidden bg-bg-gray mb-4 relative cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {isUploading ? (
                <div className="w-full h-full flex items-center justify-center bg-bg-gray">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <img
                  src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt="头像"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-sm text-text-gray">点击更换头像</p>
            <p className="text-xs text-text-gray mt-1">支持 JPG、PNG，建议 2MB 以内</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm font-medium text-text-primary">昵称</span>
          </div>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="输入昵称"
            className="input-field w-full"
            maxLength={20}
          />
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-text-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-sm font-medium text-text-primary">签名</span>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="输入个性签名"
            rows={3}
            className="w-full text-sm text-text-secondary placeholder:text-text-gray bg-transparent border-none outline-none resize-none leading-relaxed"
            maxLength={100}
          />
          <p className="text-xs text-text-gray mt-1 text-right">{bio.length}/100</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
