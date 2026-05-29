import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { feedMockData, Comment } from '../../types/feed';

const FeedDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item] = useState(() => feedMockData.find(f => f.id === Number(id)) || feedMockData[0]);
  const [isFollowing, setIsFollowing] = useState(item.user.isFollowing || false);
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [likes, setLikes] = useState(item.likes);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: { avatar: 'https://i.pravatar.cc/150?img=11', name: '奶茶新手' },
      content: '同感！我也觉得好喝，下次去试试~',
      date: '2小时前',
    },
    {
      id: 2,
      user: { avatar: 'https://i.pravatar.cc/150?img=12', name: '饮茶小能手' },
      content: '谢谢分享，已经加入心愿单了！',
      date: '1小时前',
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    setComments([
      {
        id: Date.now(),
        user: { avatar: 'https://i.pravatar.cc/150?img=0', name: '我的头像' },
        content: newComment,
        date: '刚刚',
      },
      ...comments,
    ]);
    setNewComment('');
  };

  const handleImageClick = (index: number) => {
    setViewerIndex(index);
    setShowImageViewer(true);
  };

  const renderImages = () => {
    if (item.images.length === 0) return null;

    if (item.images.length === 1) {
      return (
        <div
          className="mt-4 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => handleImageClick(0)}
        >
          <img
            src={item.images[0]}
            alt="内容图片"
            className="w-full object-cover bg-gray-100 max-h-80"
          />
        </div>
      );
    }

    return (
      <div className="mt-4 grid grid-cols-2 gap-1">
        {item.images.slice(0, 4).map((img, idx) => (
          <div
            key={idx}
            className={`rounded-xl overflow-hidden cursor-pointer bg-gray-100 ${
              item.images.length === 3 && idx === 0 ? 'col-span-2' : ''
            }`}
            onClick={() => handleImageClick(idx)}
          >
            <img
              src={img}
              alt={`图片${idx + 1}`}
              className={`w-full object-cover bg-gray-100 ${
                item.images.length === 3 && idx === 0 ? 'h-48' : 'h-36'
              }`}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-gray-600 rounded-full hover:bg-gray-100"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-800">评价详情</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img
                src={item.user.avatar}
                alt={item.user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{item.user.name}</span>
                <button
                  onClick={handleFollow}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {isFollowing ? '已关注' : '关注'}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {item.user.title && (
                  <span className="text-xs text-gray-400">{item.user.title}</span>
                )}
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-600 font-medium">{item.tag}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${
                item.type === 'recommend' ? 'bg-green-400' : 'bg-red-400'
              }`}>
                {item.type === 'recommend' ? '良心推荐' : '避雷预警'}
              </span>
            </div>

            <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-wrap">
              {item.content}
            </p>
          </div>

          {renderImages()}

          {item.rating && (
            <div className="mt-4 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-lg ${star <= item.rating! ? 'text-amber-400' : 'text-gray-300'}`}
                >
                  ⭐
                </span>
              ))}
            </div>
          )}

          {item.shop && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <span>📍</span>
              <span>{item.shop}</span>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{formatNumber(likes)}</span>
            </button>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{formatNumber(comments.length)}</span>
            </div>

            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-1.5 text-sm text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>分享</span>
            </button>
          </div>

          {showShareMenu && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-around">
                <button className="flex flex-col items-center gap-1">
                  <span className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg">微</span>
                  <span className="text-xs text-gray-500">微信</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                  <span className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg">微</span>
                  <span className="text-xs text-gray-500">微博</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                  <span className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-lg">📋</span>
                  <span className="text-xs text-gray-500">复制</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 bg-white p-4">
          <h3 className="font-semibold text-gray-800 mb-4">评论</h3>

          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              还没有评论，快来抢沙发~
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{comment.user.name}</span>
                      <span className="text-xs text-gray-400">{comment.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写评论..."
          className="flex-1 h-10 px-4 rounded-full bg-gray-100 text-sm outline-none focus:ring-1 focus:ring-amber-300"
          onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
        />
        <button
          onClick={handleSendComment}
          disabled={!newComment.trim()}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            newComment.trim()
              ? 'bg-amber-500 text-white active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          发送
        </button>
      </div>

      {showImageViewer && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setShowImageViewer(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl z-10"
            onClick={() => setShowImageViewer(false)}
          >
            ✕
          </button>

          <img
            src={item.images[viewerIndex]}
            alt={`图片 ${viewerIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />

          {item.images.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 text-center text-white text-sm">
              {viewerIndex + 1} / {item.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedDetail;
