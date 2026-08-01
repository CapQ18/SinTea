import React, { useState } from 'react';
import { API, request } from '../services/apiService';

interface ReportModalProps {
  targetType: 'feed' | 'comment' | 'user';
  targetId: number;
  onClose: () => void;
}

const REASONS = ['垃圾广告', '色情低俗', '违法违规', '不实信息', '人身攻击', '抄袭侵权', '其他'];

const ReportModal: React.FC<ReportModalProps> = ({ targetType, targetId, onClose }) => {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) { alert('请选择举报原因'); return; }
    setSubmitting(true);
    try {
      await request(API.reports, {
        method: 'POST',
        body: JSON.stringify({ targetType, targetId, reason, detail }),
      });
      alert('举报已提交，我们会尽快处理');
      onClose();
    } catch (e: any) {
      alert(e?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-t-3xl w-full max-w-md p-6 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">举报</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-text-gray">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-text-gray mb-3">请选择举报原因</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                reason === r
                  ? 'bg-primary text-white'
                  : 'bg-bg-gray text-text-secondary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="补充说明（可选，最多 500 字）"
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-4"
          style={{ border: '1.5px solid #E8D5B7', background: '#FFFBF5', minHeight: 80 }}
        />

        <button
          onClick={handleSubmit}
          disabled={submitting || !reason}
          className="w-full py-3.5 rounded-2xl font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #D64545 0%, #B83838 100%)' }}
        >
          {submitting ? '提交中...' : '提交举报'}
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
