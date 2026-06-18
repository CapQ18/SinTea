import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateProfile } from '../../services/authService';
import { User } from '../../types/user';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setNickname(currentUser.nickname || '');
      setBio(currentUser.bio || '');
      setAvatarSeed(currentUser.username || '');
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
      const result = await updateProfile({ nickname, bio, avatar });

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

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

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
            <div className="w-24 h-24 rounded-full overflow-hidden bg-bg-gray mb-4">
              <img
                src={avatarUrl}
                alt="头像"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="text"
              value={avatarSeed}
              onChange={(e) => setAvatarSeed(e.target.value)}
              placeholder="输入昵称生成头像"
              className="input-field text-center w-full max-w-xs"
            />
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
