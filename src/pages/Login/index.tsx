import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, sendLoginCode, loginWithCode } from '../../services/authService';
import { LoginFormData } from '../../types/user';

const TeaMascots: React.FC = () => (
  <div className="flex justify-end items-end gap-1.5 mb-4 select-none">
    <svg viewBox="0 0 48 56" className="w-10 h-auto" style={{ display: 'block' }}>
      <ellipse cx="24" cy="52" rx="16" ry="3" fill="#D4A574" opacity="0.3" />
      <path d="M12 18 Q12 8 24 8 Q36 8 36 18 L36 30 Q36 46 24 46 Q12 46 12 30 Z" fill="#F5D0A9" stroke="#C4956A" strokeWidth="1.5"/>
      <ellipse cx="24" cy="8" rx="14" ry="4" fill="#8B6F47" />
      <circle cx="19" cy="24" r="2.5" fill="#3D3530"/>
      <circle cx="29" cy="24" r="2.5" fill="#3D3530"/>
      <circle cx="19.5" cy="23.5" r="0.8" fill="white"/>
      <circle cx="29.5" cy="23.5" r="0.8" fill="white"/>
      <path d="M21 31 Q24 34 27 31" stroke="#8B5E3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="17" cy="28" r="2" fill="#FFB3B3" opacity="0.5"/>
      <circle cx="31" cy="28" r="2" fill="#FFB3B3" opacity="0.5"/>
      <path d="M14 14 Q18 10 24 10 Q30 10 34 14" stroke="#6B8E4E" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="22" cy="10" rx="2" ry="3" fill="#6B8E4E" transform="rotate(-20 22 10)"/>
      <ellipse cx="28" cy="9" rx="2" ry="3" fill="#7BA85C" transform="rotate(15 28 9)"/>
    </svg>
    <svg viewBox="0 0 44 52" className="w-10 h-auto" style={{ display: 'block' }}>
      <ellipse cx="22" cy="48" rx="14" ry="2.5" fill="#D4A574" opacity="0.3" />
      <path d="M14 16 Q14 10 22 10 Q30 10 30 16 L30 28 Q30 42 22 42 Q14 42 14 28 Z" fill="#D4A8C8" stroke="#B088A8" strokeWidth="1.5"/>
      <ellipse cx="22" cy="10" rx="10" ry="3" fill="#9B7BA8" />
      <circle cx="18" cy="22" r="2" fill="#3D3530"/>
      <circle cx="26" cy="22" r="2" fill="#3D3530"/>
      <circle cx="18.5" cy="21.5" r="0.7" fill="white"/>
      <circle cx="26.5" cy="21.5" r="0.7" fill="white"/>
      <path d="M19 28 Q22 30 25 28" stroke="#8B5E8B" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <circle cx="15" cy="25" r="1.5" fill="#FFB3C8" opacity="0.5"/>
      <circle cx="29" cy="25" r="1.5" fill="#FFB3C8" opacity="0.5"/>
      <circle cx="20" cy="15" r="1.5" fill="#E8C8DC" opacity="0.8"/>
      <circle cx="24" cy="17" r="1" fill="#E8C8DC" opacity="0.6"/>
    </svg>
    <svg viewBox="0 0 40 48" className="w-10 h-auto" style={{ display: 'block' }}>
      <ellipse cx="20" cy="44" rx="12" ry="2" fill="#D4A574" opacity="0.3" />
      <path d="M10 14 Q10 8 20 8 Q30 8 30 14 L30 26 Q30 40 20 40 Q10 40 10 26 Z" fill="#C8E6C9" stroke="#81C784" strokeWidth="1.5"/>
      <ellipse cx="20" cy="8" rx="8" ry="2.5" fill="#5D8A5E" />
      <circle cx="16" cy="20" r="2" fill="#3D3530"/>
      <circle cx="24" cy="20" r="2" fill="#3D3530"/>
      <circle cx="16.5" cy="19.5" r="0.7" fill="white"/>
      <circle cx="24.5" cy="19.5" r="0.7" fill="white"/>
      <path d="M17 26 Q20 28 23 26" stroke="#4E7A4F" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <circle cx="13" cy="23" r="1.5" fill="#FFB3B3" opacity="0.4"/>
      <circle cx="27" cy="23" r="1.5" fill="#FFB3B3" opacity="0.4"/>
      <path d="M15 10 Q18 5 20 5 Q22 5 25 10" stroke="#4A7C59" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
    <svg viewBox="0 0 44 52" className="w-10 h-auto" style={{ display: 'block' }}>
      <ellipse cx="22" cy="48" rx="14" ry="2.5" fill="#D4A574" opacity="0.3" />
      <path d="M14 16 Q14 10 22 10 Q30 10 30 16 L30 28 Q30 42 22 42 Q14 42 14 28 Z" fill="#FFE0B2" stroke="#E0A850" strokeWidth="1.5"/>
      <ellipse cx="22" cy="10" rx="10" ry="3" fill="#D4943A" />
      <circle cx="18" cy="22" r="2" fill="#3D3530"/>
      <circle cx="26" cy="22" r="2" fill="#3D3530"/>
      <circle cx="18.5" cy="21.5" r="0.7" fill="white"/>
      <circle cx="26.5" cy="21.5" r="0.7" fill="white"/>
      <path d="M19 28 Q22 31 25 28" stroke="#8B4513" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <circle cx="15" cy="25" r="1.5" fill="#FFB3B3" opacity="0.5"/>
      <circle cx="29" cy="25" r="1.5" fill="#FFB3B3" opacity="0.5"/>
      <path d="M16 12 L18 6 L20 12" stroke="#6B8E23" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="18" cy="6" rx="2" ry="2.5" fill="#7BA85C"/>
    </svg>
    <svg viewBox="0 0 48 56" className="w-10 h-auto" style={{ display: 'block' }}>
      <ellipse cx="24" cy="52" rx="16" ry="3" fill="#D4A574" opacity="0.3" />
      <path d="M12 18 Q12 10 24 10 Q36 10 36 18 L36 32 Q36 48 24 48 Q12 48 12 32 Z" fill="#D7CCC8" stroke="#A1887F" strokeWidth="1.5"/>
      <ellipse cx="24" cy="10" rx="12" ry="3.5" fill="#795548" />
      <circle cx="19" cy="24" r="2.5" fill="#3D3530"/>
      <circle cx="29" cy="24" r="2.5" fill="#3D3530"/>
      <circle cx="19.5" cy="23.5" r="0.8" fill="white"/>
      <circle cx="29.5" cy="23.5" r="0.8" fill="white"/>
      <path d="M20 31 Q24 34 28 31" stroke="#5D4037" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="17" cy="28" r="2" fill="#FFB3B3" opacity="0.4"/>
      <circle cx="31" cy="28" r="2" fill="#FFB3B3" opacity="0.4"/>
      <path d="M15 8 Q20 3 24 3 Q28 3 33 8" stroke="#558B2F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="20" cy="4" rx="2" ry="3" fill="#689F38" transform="rotate(-30 20 4)"/>
      <ellipse cx="28" cy="3" rx="2" ry="3" fill="#7CB342" transform="rotate(20 28 3)"/>
      <rect x="20" y="36" width="8" height="4" rx="1" fill="#A1887F" opacity="0.4"/>
    </svg>
  </div>
);

const inputCls = 'w-full px-5 py-3.5 rounded-2xl text-base outline-none transition-all';
const inputStyle = { border: '1.5px solid #E8D5B7', background: '#FFFBF5', color: '#3D3530' } as React.CSSProperties;
const btnPrimaryStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #F5D0A9 0%, #E8B87D 100%)',
  color: '#6B4423',
  boxShadow: '0 4px 12px rgba(232, 184, 125, 0.4)',
  border: 'none',
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'password' | 'code'>('code');

  // 密码登录
  const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // 验证码登录
  const [codeEmail, setCodeEmail] = useState('');
  const [codeValue, setCodeValue] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  // ===== 密码登录 =====
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(formData);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  // ===== 验证码登录 =====
  const handleSendCode = async () => {
    if (!codeEmail) { setError('请输入邮箱'); return; }
    setSending(true);
    setError('');
    const result = await sendLoginCode(codeEmail);
    setSending(false);
    if (result.success) {
      setCountdown(60);
      if (result.demoCode) {
        setError(`演示模式：验证码为 ${result.demoCode}`);
      } else {
        setError('');
        alert('验证码已发送到您的邮箱');
      }
    } else {
      setError(result.message);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeEmail) { setError('请输入邮箱'); return; }
    if (!codeValue) { setError('请输入验证码'); return; }
    setError('');
    setIsLoading(true);
    const result = await loginWithCode(codeEmail, codeValue);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FFFBF0 0%, #FFF5E1 50%, #FDEBC8 100%)' }}>
      <div className="flex-1 flex flex-col px-6 pt-16 pb-8">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold tracking-wider" style={{ color: '#6B4423' }}>
            SinTea <span className="text-2xl font-normal ml-2">欢迎你</span>
          </h1>
        </div>

        <TeaMascots />

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mt-4" style={{ boxShadow: '0 8px 32px rgba(139, 115, 85, 0.12)', border: '1px solid rgba(139, 115, 85, 0.1)' }}>
          {/* Tab 切换 */}
          <div className="flex mb-6 rounded-2xl p-1" style={{ background: '#F5EDE0' }}>
            <button
              type="button"
              onClick={() => { setTab('code'); setError(''); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={tab === 'code' ? { background: 'white', color: '#6B4423', boxShadow: '0 2px 8px rgba(139,115,85,0.1)' } : { color: '#8B7355' }}
            >
              验证码登录
            </button>
            <button
              type="button"
              onClick={() => { setTab('password'); setError(''); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={tab === 'password' ? { background: 'white', color: '#6B4423', boxShadow: '0 2px 8px rgba(139,115,85,0.1)' } : { color: '#8B7355' }}
            >
              密码登录
            </button>
          </div>

          {/* 验证码登录 */}
          {tab === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <input
                type="email"
                value={codeEmail}
                onChange={(e) => setCodeEmail(e.target.value)}
                placeholder="请输入邮箱"
                className={inputCls}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#C4956A'}
                onBlur={(e) => e.target.style.borderColor = '#E8D5B7'}
                required
              />
              <div className="relative">
                <input
                  type="text"
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                  placeholder="请输入验证码"
                  className={inputCls + ' pr-28'}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#C4956A'}
                  onBlur={(e) => e.target.style.borderColor = '#E8D5B7'}
                  required
                />
                <button
                  type="button"
                  disabled={countdown > 0 || sending}
                  onClick={handleSendCode}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-sm font-medium"
                  style={{ background: (countdown > 0 || sending) ? '#E8D5B7' : '#F5D0A9', color: '#6B4423' }}
                >
                  {sending ? '发送中' : countdown > 0 ? `${countdown}s` : '发送验证码'}
                </button>
              </div>

              {error && <div className="text-sm text-center py-2" style={{ color: '#D64545' }}>{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl text-base font-semibold tracking-wider transition-all active:scale-95"
                style={btnPrimaryStyle}
              >
                {isLoading ? '登录中...' : '登 录'}
              </button>

              <p className="text-xs text-center" style={{ color: '#A89580' }}>
                新用户输入邮箱即可自动注册
              </p>
            </form>
          )}

          {/* 密码登录 */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="请输入用户名/邮箱"
                className={inputCls}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#C4956A'}
                onBlur={(e) => e.target.style.borderColor = '#E8D5B7'}
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码"
                  className={inputCls + ' pr-12'}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#C4956A'}
                  onBlur={(e) => e.target.style.borderColor = '#E8D5B7'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: '#B8A088' }}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>

              {error && <div className="text-sm text-center py-2" style={{ color: '#D64545' }}>{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl text-base font-semibold tracking-wider transition-all active:scale-95"
                style={btnPrimaryStyle}
              >
                {isLoading ? '登录中...' : '登 录'}
              </button>
            </form>
          )}

          <div className="mt-6 flex justify-between text-sm" style={{ color: '#8B7355' }}>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="hover:underline"
            >
              忘记密码
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="hover:underline font-medium"
              style={{ color: '#6B4423' }}
            >
              注册
            </button>
          </div>

          <div className="mt-6 pt-4 border-t text-xs text-center" style={{ borderColor: '#F0E6D2', color: '#A89580' }}>
            登录即代表您同意
            <a href="#/terms" target="_blank" className="underline mx-1" style={{ color: '#6B4423' }}>《用户协议》</a>
            与
            <a href="#/privacy" target="_blank" className="underline mx-1" style={{ color: '#6B4423' }}>《隐私政策》</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
