import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, request } from '../../services/apiService';

const LegalLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-border-light sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 text-text-gray hover:text-primary">
            ← 返回
          </button>
          <h1 className="text-lg font-bold text-text-primary">{title}</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 text-sm text-text-secondary leading-relaxed space-y-4 whitespace-pre-wrap">
        {children}
      </main>
    </div>
  );
};

export const TermsOfService: React.FC = () => (
  <LegalLayout title="用户协议">
    <h2 className="text-base font-bold text-text-primary">一、服务内容</h2>
    <p>SinTea（以下简称"本平台"）是一款茶饮爱好者的社交分享平台，为用户提供奶茶店铺发现、动态分享、评价交流、心愿单管理等服务。本协议由您与 SinTea 共同缔结，本协议具有合同效力。</p>
    <h2 className="text-base font-bold text-text-primary">二、账号注册</h2>
    <p>1. 您在注册时应提供真实、准确、完整的个人资料，不得冒用他人信息。</p>
    <p>2. 您应妥善保管账号和密码，因您保管不当造成的损失由您自行承担。</p>
    <p>3. 每个用户只能注册一个账号，禁止恶意注册多个账号。</p>
    <p>4. 您承诺已年满 18 周岁；若您未满 18 周岁，应在监护人陪同下阅读本协议并使用本服务。</p>
    <h2 className="text-base font-bold text-text-primary">三、用户行为规范</h2>
    <p>您在使用本服务过程中，不得发布以下内容：</p>
    <p>· 违反宪法所确定的基本原则的；</p>
    <p>· 危害国家安全，泄露国家秘密，破坏国家统一的；</p>
    <p>· 损害国家荣誉和利益的；</p>
    <p>· 煽动民族仇恨、民族歧视、破坏民族团结的；</p>
    <p>· 涉及淫秽、色情、赌博、暴力、恐怖或教唆犯罪的；</p>
    <p>· 侮辱或诽谤他人，侵害他人合法权益的；</p>
    <p>· 含有虚假、欺诈、有害、胁迫、侵害他人隐私的信息；</p>
    <p>· 未经授权的广告、营销内容或任何形式的商业推广；</p>
    <p>· 含有病毒、木马、恶意代码或破坏性功能的程序。</p>
    <h2 className="text-base font-bold text-text-primary">四、知识产权</h2>
    <p>1. 您在本平台发布的原创内容，著作权归您本人所有。</p>
    <p>2. 您授予 SinTea 在全球范围内免费的、非独占的、可再许可的许可，用于在本平台展示、分发、推广您发布的内容。</p>
    <p>3. 未经本平台书面同意，不得复制、修改、分发本平台任何部分或内容。</p>
    <h2 className="text-base font-bold text-text-primary">五、服务变更与中断</h2>
    <p>1. SinTea 有权根据业务发展需要，随时变更、中断或终止部分或全部服务。</p>
    <p>2. 因系统维护、升级等原因需要暂停服务的，本平台将提前通过公告方式通知。</p>
    <h2 className="text-base font-bold text-text-primary">六、免责声明</h2>
    <p>1. 本平台用户发布的内容仅代表作者本人观点，与 SinTea 无关。因内容不实或侵权产生的责任由发布者承担。</p>
    <p>2. 本平台提供的店铺信息、饮品推荐等仅供参考，实际消费请以商家为准。</p>
    <p>3. 因不可抗力或非本平台原因造成的服务中断或数据丢失，本平台不承担责任。</p>
    <h2 className="text-base font-bold text-text-primary">七、协议修改</h2>
    <p>SinTea 有权在必要时修改本协议。修改后的协议将在本平台公布，您继续使用服务即视为接受修改后的协议。</p>
    <h2 className="text-base font-bold text-text-primary">八、联系我们</h2>
    <p>如对本协议有任何疑问，请通过平台内的「意见反馈」功能与我们联系。</p>
    <p className="text-text-gray">本协议更新日期：2026 年 8 月 1 日</p>
  </LegalLayout>
);

export const PrivacyPolicy: React.FC = () => (
  <LegalLayout title="隐私政策">
    <h2 className="text-base font-bold text-text-primary">引言</h2>
    <p>SinTea（以下简称"我们"）非常重视您的个人信息和隐私保护。本隐私政策将向您说明我们如何收集、使用、存储、共享和保护您的个人信息，以及您享有哪些权利。</p>
    <h2 className="text-base font-bold text-text-primary">一、我们收集的信息</h2>
    <p className="font-semibold">1. 您主动提供的信息</p>
    <p>· 注册信息：用户名、昵称、邮箱/手机号、密码（加密存储）；</p>
    <p>· 个人资料：头像、个性签名；</p>
    <p>· 发布内容：您发布的动态、图片、评论、点赞、心愿单等。</p>
    <p className="font-semibold">2. 自动收集的信息</p>
    <p>· 设备信息：设备型号、操作系统版本、浏览器类型；</p>
    <p>· 日志信息：访问时间、IP 地址（用于风控与安全）；</p>
    <p>· 位置信息：仅在您授权后获取粗略位置，用于展示附近奶茶店。您可随时在系统设置中关闭。</p>
    <h2 className="text-base font-bold text-text-primary">二、我们如何使用信息</h2>
    <p>· 为您提供注册登录、内容发布、社交互动等核心服务；</p>
    <p>· 基于位置展示附近店铺（仅在授权时）；</p>
    <p>· 维护产品安全与正常运行，防范违规内容与恶意攻击；</p>
    <p>· 改进产品体验，进行匿名化的数据分析；</p>
    <p>· 向您发送系统通知（如被点赞、评论、关注提醒）。</p>
    <h2 className="text-base font-bold text-text-primary">三、信息的共享与披露</h2>
    <p>我们不会向任何第三方出售您的个人信息。仅在以下情况共享：</p>
    <p>· 获得您的明确同意；</p>
    <p>· 为实现服务所必需（如使用第三方地图展示店铺时，仅提供匿名位置）；</p>
    <p>· 遵守法律法规要求，或配合司法/行政机关的合法请求；</p>
    <p>· 保护本平台、用户或公众的合法权益免受侵害。</p>
    <h2 className="text-base font-bold text-text-primary">四、信息的存储与安全</h2>
    <p>1. 您的密码采用 PBKDF2 加盐哈希加密存储，即使平台工作人员也无法查看原文。</p>
    <p>2. 我们采用业界标准的安全措施（HTTPS 加密传输、数据访问权限控制、WAF 防护）来保护您的个人信息。</p>
    <p>3. 我们将在中华人民共和国境内存储和处理您的个人信息。如需跨境传输，我们会告知并取得您的同意。</p>
    <h2 className="text-base font-bold text-text-primary">五、您的权利</h2>
    <p>· 访问权：您可以在「我的」页面查看和导出您的个人资料；</p>
    <p>· 更正权：您可以在「编辑资料」页面修改您的信息；</p>
    <p>· 删除权/注销权：您可以在「我的 - 注销账号」中删除您的账号和所有数据；</p>
    <p>· 撤回同意：您可以撤回对位置、通知等授权（通过系统设置或联系我们）；</p>
    <p>· 注销后，我们将在 15 个工作日内删除或匿名化您的个人信息（法律法规另有规定的除外）。</p>
    <h2 className="text-base font-bold text-text-primary">六、未成年人保护</h2>
    <p>我们非常重视对未成年人个人信息的保护。若您是未满 18 周岁的未成年人，请在监护人的陪同下阅读本政策，并在监护人同意后使用本服务。</p>
    <h2 className="text-base font-bold text-text-primary">七、政策更新</h2>
    <p>本政策可能会不时更新。更新后我们将在平台发布公告，重大变更将通过站内信或邮件通知您。</p>
    <h2 className="text-base font-bold text-text-primary">八、联系我们</h2>
    <p>如您对本隐私政策有任何疑问、意见或建议，或希望行使上述权利，请通过平台内「意见反馈」功能与我们联系。</p>
    <p className="text-text-gray">本政策更新日期：2026 年 8 月 1 日</p>
  </LegalLayout>
);

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendCode = async () => {
    if (!account) { setError('请输入邮箱'); return; }
    setLoading(true);
    setError('');
    try {
      await request(API.auth.resetRequest, {
        method: 'POST',
        body: JSON.stringify({ email: account }),
      });
      setCountdown(60);
      alert('验证码已发送（演示/本地模式固定为 123456，有效期 10 分钟）');
    } catch (e: any) {
      setError(e?.message || '验证码发送失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) { setError('请输入邮箱'); return; }
    // 进入下一步前先触发一次发送验证码流程
    sendCode();
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 4) { setError('请输入验证码'); return; }
    setStep(3);
    setError('');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError('密码至少6位'); return; }
    if (newPassword !== confirmPassword) { setError('两次密码不一致'); return; }
    setLoading(true);
    setError('');
    try {
      await request(API.auth.resetConfirm, {
        method: 'POST',
        body: JSON.stringify({ email: account, code, password: newPassword }),
      });
      alert('密码重置成功！请使用新密码登录');
      navigate('/login');
    } catch (e: any) {
      setError(e?.message || '重置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #FFFBF0 0%, #FDEBC8 100%)' }}>
      <div className="px-6 pt-10 pb-4">
        <button onClick={() => navigate('/login')} className="text-sm hover:underline" style={{ color: '#6B4423' }}>
          ← 返回登录
        </button>
        <h1 className="text-2xl font-bold mt-4" style={{ color: '#6B4423' }}>找回密码</h1>
        <p className="text-sm mt-1" style={{ color: '#8B7355' }}>步骤 {step}/3：{step === 1 ? '输入账号' : step === 2 ? '验证码验证' : '设置新密码'}</p>
      </div>

      <div className="flex-1 px-6">
        <div className="bg-white/80 rounded-3xl p-8 shadow-sm space-y-4">
          {step === 1 && (
            <form onSubmit={handleStep1}>
              <input type="text" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="请输入注册邮箱" className="w-full px-5 py-3.5 rounded-2xl outline-none mb-4" style={{ border: '1.5px solid #E8D5B7', background: '#FFFBF5' }} />
              {error && <div className="text-sm mb-3" style={{ color: '#D64545' }}>{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl font-semibold" style={{ background: 'linear-gradient(135deg, #F5D0A9 0%, #E8B87D 100%)', color: '#6B4423' }}>下一步（发送验证码）</button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleStep2}>
              <div className="relative mb-4">
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入验证码" className="w-full px-5 py-3.5 pr-28 rounded-2xl outline-none" style={{ border: '1.5px solid #E8D5B7', background: '#FFFBF5' }} />
                <button type="button" disabled={countdown > 0 || loading} onClick={sendCode} className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-sm" style={{ background: (countdown > 0 || loading) ? '#E8D5B7' : '#F5D0A9', color: '#6B4423' }}>
                  {loading ? '发送中' : countdown > 0 ? `${countdown}s` : '重发验证码'}
                </button>
              </div>
              <p className="text-xs mb-3" style={{ color: '#8B7355' }}>演示/本地模式验证码固定为 123456</p>
              {error && <div className="text-sm mb-3" style={{ color: '#D64545' }}>{error}</div>}
              <button type="submit" className="w-full py-3.5 rounded-2xl font-semibold" style={{ background: 'linear-gradient(135deg, #F5D0A9 0%, #E8B87D 100%)', color: '#6B4423' }}>下一步</button>
            </form>
          )}
          {step === 3 && (
            <form onSubmit={handleReset}>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="请输入新密码（至少6位）" className="w-full px-5 py-3.5 rounded-2xl outline-none mb-3" style={{ border: '1.5px solid #E8D5B7', background: '#FFFBF5' }} />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="请再次输入新密码" className="w-full px-5 py-3.5 rounded-2xl outline-none mb-3" style={{ border: '1.5px solid #E8D5B7', background: '#FFFBF5' }} />
              {error && <div className="text-sm text-warning mb-3">{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl font-semibold" style={{ background: 'linear-gradient(135deg, #F5D0A9 0%, #E8B87D 100%)', color: '#6B4423' }}>
                {loading ? '提交中...' : '确认重置'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
