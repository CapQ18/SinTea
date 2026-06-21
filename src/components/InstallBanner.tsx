import { useState, useEffect } from 'react';

// 扩展 beforeinstallprompt 事件类型
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA 安装提示横幅
 * 当浏览器支持 PWA 安装且用户尚未安装时，显示引导条
 * iOS 用户会看到引导文案（Safari 不支持 beforeinstallprompt）
 */
export default function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 检测是否已安装为 PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone;

    if (isStandalone) return;

    // 检测 iOS
    const ua = navigator.userAgent || '';
    const iOS = /iphone|ipad|ipod/.test(ua.toLowerCase());
    setIsIOS(iOS);

    // Android/Desktop Chrome: 监听 beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: 在 localStorage 中记录，首次访问时展示
    if (iOS && !localStorage.getItem('sintea-pwa-ios-hint')) {
      // 延迟展示，等页面加载完
      const timer = setTimeout(() => {
        setShowBanner(true);
        localStorage.setItem('sintea-pwa-ios-hint', 'shown');
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('🎉 用户安装了 SinTea');
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const dismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="mx-3 mt-2 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur shadow-lg border border-[#F5D0A9]/50 flex items-center gap-3">
        {/* 图标 */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5D0A9] to-[#E8B88A] flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-xl">🧋</span>
        </div>

        {/* 文案 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#5D4037] truncate">
            {isIOS ? '添加到主屏幕' : '安装 SinTea 应用'}
          </p>
          <p className="text-xs text-[#8D6E63] truncate">
            {isIOS
              ? '点击分享按钮 → 添加到主屏幕 📲'
              : '像 App 一样使用，体验更流畅 ✨'}
          </p>
        </div>

        {/* 按钮 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isIOS ? (
            <button
              onClick={dismiss}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#F5D0A9]/30 text-[#8D6E63] hover:bg-[#F5D0A9]/50 transition-colors"
            >
              知道了
            </button>
          ) : (
            <>
              <button
                onClick={handleInstall}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#F5D0A9] to-[#E8B88A] text-[#5D4037] shadow hover:shadow-md active:scale-95 transition-all"
              >
                安装
              </button>
              <button
                onClick={dismiss}
                className="text-[#8D6E63] hover:text-[#5D4037] transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
