import React from 'react';

const ICP_NUMBER = '';

const Footer: React.FC = () => (
  <footer className="text-center text-xs py-4 px-4 select-none" style={{ color: '#A89580' }}>
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <span>© 2025 SinTea</span>
      <a href="#/terms" className="hover:underline">用户协议</a>
      <span className="opacity-40">|</span>
      <a href="#/privacy" className="hover:underline">隐私政策</a>
    </div>
    {ICP_NUMBER && (
      <div className="mt-1">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          京ICP备 {ICP_NUMBER} 号
        </a>
      </div>
    )}
  </footer>
);

export default Footer;
