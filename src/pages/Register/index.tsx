import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../../services/authService';
import { RegisterFormData } from '../../types/user';

const TeaMascots: React.FC = () => (
  <div className="flex justify-center items-end gap-1 mb-4 select-none">
    <div className="w-12 h-14 flex items-end justify-center">
      <svg viewBox="0 0 48 56" className="w-full h-full">
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
    </div>
    <div className="w-11 h-13 flex items-end justify-center">
      <svg viewBox="0 0 44 52" className="w-full h-full">
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
    </div>
    <div className="w-10 h-12 flex items-end justify-center">
      <svg viewBox="0 0 40 48" className="w-full h-full">
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
    </div>
    <div className="w-11 h-13 flex items-end justify-center">
      <svg viewBox="0 0 44 52" className="w-full h-full">
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
    </div>
    <div className="w-12 h-14 flex items-end justify-center">
      <svg viewBox="0 0 48 56" className="w-full h-full">
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
  </div>
);

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = () => {
    if (!formData.username) {
      setError('请先输入手机号/邮箱');
      return;
    }
    setError('');
    setCountdown(60);
    alert('验证码已发送（演示模式：123456）');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码至少6位');
      return;
    }

    setIsLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email || formData.username,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      nickname: formData.nickname,
    });
    
    if (result.success) {
      await login({ username: formData.username, password: formData.password });
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const inputStyle: React.CSSProperties = {
    border: '1.5px solid #E8D5B7',
    background: '#FFFBF5',
    color: '#3D3530',
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FFFBF0 0%, #FFF5E1 50%, #FDEBC8 100%)' }}>
      <div className="flex-1 flex flex-col px-6 pt-12 pb-8">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold tracking-wider" style={{ color: '#6B4423' }}>
            SinTea <span className="text-2xl font-normal ml-2">欢迎你</span>
          </h1>
        </div>

        <TeaMascots />

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mt-2" style={{ boxShadow: '0 8px 32px rgba(139, 115, 85, 0.12)', border: '1px solid rgba(139, 115, 85, 0.1)' }}>
          <h2 className="text-2xl font-bold text-center mb-6 tracking-widest" style={{ color: '#6B4423' }}>
            注 册
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="请输入手机号/邮箱"
                className="w-full px-5 py-3.5 rounded-2xl text-base outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#C4956A'}
                onBlur={(e) => e.target.style.borderColor = '#E8D5B7'}
                required
              />
            </div>

            <div>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="请输入昵称"
                className="w-full px-5 py-3.5 rounded-2xl text-base outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#C4956A'}
                onBlur={(e) => e.target.style.borderColor = '#E8D5B7'}
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="请输入密码"
                className="w-full px-5 py-3.5 pr-12 rounded-2xl text-base outline-none transition-all"
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
                {showPassword ? '👁️' : '👁'}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="请再次输入密码"
                className="w-full px-5 py-3.5 pr-12 rounded-2xl text-base outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#C4956A'}
                onBlur={(e) => e.target.style.borderColor = '#E8D5B7'}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                style={{ color: '#B8A088' }}
              >
                {showConfirmPassword ? '👁️' : '👁'}
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入验证码"
                className="w-full px-5 py-3.5 pr-28 rounded-2xl text-base outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#C4956A'}
                onBlur={(e) => e.target.style.borderColor = '#E8D5B7'}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: countdown > 0 ? '#E8D5B7' : '#F5D0A9',
                  color: countdown > 0 ? '#9A928B' : '#6B4423',
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </button>
            </div>

            {error && (
              <div className="text-sm text-center py-1" style={{ color: '#D64545' }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl text-base font-semibold tracking-wider transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #F5D0A9 0%, #E8B87D 100%)',
                color: '#6B4423',
                boxShadow: '0 4px 12px rgba(232, 184, 125, 0.4)',
                border: 'none',
              }}
            >
              {isLoading ? '注册中...' : '注 册'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm" style={{ color: '#8B7355' }}>
            已有账号？{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hover:underline font-medium"
              style={{ color: '#6B4423' }}
            >
              立即登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
