'use client';
// ============================================================
// Community page — Forum with real state, reactions, comments, images
// Enhanced with official Kazakhstan Hemophilia Association category
// and role indicators (Patient vs Caregiver)
// ============================================================

import { useState, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useStore, ForumPost, ForumComment } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  MessageSquare, Heart, Stethoscope, Plus, X, Image as ImageIcon,
  MoreHorizontal, Flag, User as UserIcon, Send, Shield
} from 'lucide-react';

const FORUM_CATEGORY_INFO = [
  {
    id: 'association',
    icon: <Shield size={20} />,
    title: 'Ассоциация и права РК',
    description: 'Официальные данные hemophilya.kz, защита прав в СК-Фармация и ГОБМП',
    color: '#E63946',
    bg: '#FFE8EA',
    members: 420,
  },
  {
    id: 'doctors',
    icon: <Stethoscope size={20} />,
    title: 'Вопросы врачам',
    description: 'Консультации республиканских гематологов (ННОЦ, КазНИИОиР, ГКБ №7)',
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-muted)',
    members: 342,
  },
  {
    id: 'meds',
    icon: <MessageSquare size={20} />,
    title: 'Препараты и аптеки',
    description: 'Опыт терапии, наличие факторов свертывания, логистика СК-Фармация',
    color: '#059669',
    bg: 'var(--color-success-light)',
    members: 218,
  },
  {
    id: 'psych',
    icon: <Heart size={20} />,
    title: 'Поддержка и опекуны',
    description: 'Истории родителей, принятие диагноза, адаптация детей в школах',
    color: 'var(--color-purple)',
    bg: 'var(--color-purple-light)',
    members: 295,
  },
];

const POPULAR_REACTIONS = ['👍', '❤️', '🙏', '🎉', '😢'];

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  const days = Math.floor(hrs / 24);
  return `${days} д назад`;
};

function PostCard({ post, color, currentUserId }: { post: ForumPost; color: string; currentUserId: string }) {
  const { updateForumPost, addComment } = useStore();
  const { account } = useAuth();
  const router = useRouter();

  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReact = (emoji: string) => {
    if (!currentUserId) return;
    const newReacts = { ...post.reactions };
    if (!newReacts[emoji]) newReacts[emoji] = [];

    if (newReacts[emoji].includes(currentUserId)) {
      newReacts[emoji] = newReacts[emoji].filter((id) => id !== currentUserId);
      if (newReacts[emoji].length === 0) delete newReacts[emoji];
    } else {
      newReacts[emoji].push(currentUserId);
    }
    updateForumPost(post.id, { reactions: newReacts });
  };

  const handleReplySubmit = () => {
    if (!replyText.trim() || !account) return;
    const comment: ForumComment = {
      id: Date.now().toString(),
      authorId: account.iin,
      authorNickname: account.patient.socialNickname || account.patient.fullName.split(' ')[0] || 'Аноним',
      authorAvatar: account.patient.avatar || '🧑',
      content: replyText.trim(),
      createdAt: new Date().toISOString(),
    };
    addComment(post.id, comment);
    setReplyText('');
  };

  return (
    <div style={{
      padding: '18px', borderRadius: 14,
      background: 'var(--color-bg)', border: '1px solid var(--color-border)',
      marginBottom: 14, position: 'relative',
    }}>
      {/* Options Menu */}
      <div style={{ position: 'absolute', top: 14, right: 14 }}>
        <button
          onClick={() => setShowOptions(!showOptions)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)' }}
        >
          <MoreHorizontal size={20} />
        </button>
        {showOptions && (
          <div style={{
            position: 'absolute', right: 0, top: 24, zIndex: 10,
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: 6, width: 160,
          }}>
            <button
              onClick={() => router.push(`/community/profile/${post.authorId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 10px', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <UserIcon size={14} /> Профиль
            </button>
            <button
              onClick={() => { alert('Жалоба передана модераторам'); setShowOptions(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 10px', fontSize: '0.875rem', color: '#E63946', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <Flag size={14} /> Пожаловаться
            </button>
          </div>
        )}
      </div>

      {post.pinned && (
        <span className="badge badge-primary" style={{ position: 'absolute', top: 14, right: 44, fontSize: '0.72rem' }}>
          📌 Важное
        </span>
      )}

      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem', flexShrink: 0, overflow: 'hidden',
        }}>
          {post.authorAvatar.length > 5 ? (
            <img src={post.authorAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            post.authorAvatar
          )}
        </div>
        <div style={{ flex: 1, paddingRight: post.pinned ? 80 : 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span
              style={{ fontSize: '0.9125rem', fontWeight: 700, color: 'var(--color-text)', cursor: 'pointer' }}
              onClick={() => router.push(`/community/profile/${post.authorId}`)}
            >
              {post.authorNickname}
            </span>
            {post.authorRole === 'caregiver' && (
              <span className="badge" style={{ background: '#F0EBFF', color: '#7B5EA7', fontSize: '0.7rem' }}>
                🛡️ Опекун
              </span>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>{timeAgo(post.createdAt)}</span>
          </div>

          {post.title && (
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)', marginBottom: 6 }}>
              {post.title}
            </div>
          )}

          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text)', lineHeight: 1.6, marginBottom: 12, whiteSpace: 'pre-wrap' }}>
            {post.content}
          </p>

          {/* Attachment */}
          {post.attachment && (
            <div style={{ marginBottom: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <img src={post.attachment} alt="attachment" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {POPULAR_REACTIONS.map((emoji) => {
                const count = post.reactions[emoji]?.length || 0;
                const iReacted = currentUserId && post.reactions[emoji]?.includes(currentUserId);
                return (
                  <button
                    key={emoji}
                    onClick={() => handleReact(emoji)}
                    style={{
                      background: iReacted ? `${color}22` : 'var(--color-surface)',
                      border: `1px solid ${iReacted ? color : 'var(--color-border)'}`,
                      borderRadius: 14, padding: '4px 8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: '0.875rem', transition: 'all 0.15s',
                    }}
                  >
                    <span>{emoji}</span> {count > 0 && <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>{count}</span>}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                color: 'var(--color-text-subtle)', fontSize: '0.875rem', fontWeight: 500,
              }}
            >
              <MessageSquare size={16} />
              {post.comments.length}
            </button>
          </div>
        </div>
      </div>

      {/* Inline Comments */}
      {showComments && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border)', marginLeft: 44 }}>
          {post.comments.map((comment) => (
            <div key={comment.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', overflow: 'hidden', flexShrink: 0,
              }}>
                {comment.authorAvatar.length > 5 ? (
                  <img src={comment.authorAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  comment.authorAvatar
                )}
              </div>
              <div style={{ background: 'var(--color-surface)', padding: '8px 12px', borderRadius: 12, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}>{comment.authorNickname}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>{timeAgo(comment.createdAt)}</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.4 }}>{comment.content}</div>
              </div>
            </div>
          ))}

          {/* Reply Input */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
            <input
              type="text"
              className="input"
              placeholder="Написать ответ..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.875rem' }}
            />
            <button
              onClick={handleReplySubmit}
              disabled={!replyText.trim()}
              style={{
                width: 36, height: 36, borderRadius: 10, background: color, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                opacity: replyText.trim() ? 1 : 0.5,
              }}
            >
              <Send size={16} color="white" style={{ marginLeft: -2 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityPage() {
  const { t } = useLanguage();
  const { forumPosts, addForumPost } = useStore();
  const { account } = useAuth();
  
  const [activeCategory, setActiveCategory] = useState('association');
  const [showNewPost, setShowNewPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postText, setPostText] = useState('');
  const [attachmentSrc, setAttachmentSrc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCatInfo = FORUM_CATEGORY_INFO.find((c) => c.id === activeCategory) || FORUM_CATEGORY_INFO[0];
  const currentPosts = forumPosts.filter((p) => p.category === activeCategory);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setAttachmentSrc(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = () => {
    if (!postText.trim() || !account) return;

    const nickname = account.patient.socialNickname || account.patient.fullName.split(' ')[0] || 'Пользователь';
    const avatar = account.patient.avatar || '🧑';

    const newPost: ForumPost = {
      id: `p_${Date.now()}`,
      authorId: account.iin,
      authorNickname: nickname,
      authorAvatar: avatar,
      authorRole: account.patient.role,
      category: activeCategory,
      title: postTitle.trim() || undefined,
      content: postText.trim(),
      attachment: attachmentSrc || undefined,
      reactions: {},
      comments: [],
      createdAt: new Date().toISOString(),
    };

    addForumPost(newPost);
    setShowNewPost(false);
    setPostTitle('');
    setPostText('');
    setAttachmentSrc('');
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">{t('community_title')}</h1>
          <p className="page-subtitle">Сообщество пациентов и опекунов Казахстана (Казахстанская Ассоциация Гемофилии)</p>
        </div>
        <button
          id="btn-new-post"
          className="btn btn-primary"
          onClick={() => setShowNewPost(true)}
        >
          <Plus size={16} /> Создать публикацию
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
        {FORUM_CATEGORY_INFO.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '12px 14px', borderRadius: 14, border: '2px solid',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s ease',
              borderColor: activeCategory === cat.id ? cat.color : 'var(--color-border)',
              background: activeCategory === cat.id ? cat.bg : 'var(--color-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: cat.color, marginBottom: 4 }}>
              {cat.icon}
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{cat.title}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
              {cat.members} участников
            </div>
          </button>
        ))}
      </div>

      {/* Category description */}
      <div className="card" style={{ background: currentCatInfo.bg, border: `1px solid ${currentCatInfo.color}22`, marginBottom: 16, padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: currentCatInfo.color }}>{currentCatInfo.icon}</div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9375rem' }}>{currentCatInfo.title}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{currentCatInfo.description}</div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        {currentPosts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-subtle)' }}>
            В этой категории пока нет публикаций. Будьте первым!
          </div>
        ) : (
          currentPosts.map((post) => (
            <PostCard key={post.id} post={post} color={currentCatInfo.color} currentUserId={account?.iin || ''} />
          ))
        )}
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="modal-overlay" onClick={() => setShowNewPost(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600, width: '100%', padding: '24px' }}>
            <div className="modal-header" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Создать новую запись</h3>
              <button onClick={() => setShowNewPost(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="var(--color-text-muted)" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 14 }}>
                <label className="label">Категория</label>
                <select className="input" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
                  {FORUM_CATEGORY_INFO.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="label">Заголовок (необязательно)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Краткая суть темы..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="label">Ваше сообщение</label>
                <textarea
                  className="input"
                  rows={5}
                  placeholder="Поделитесь опытом, новостью об аптеках или задайте вопрос сообществу..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button
                  className="btn btn-ghost"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <ImageIcon size={18} /> Прикрепить фото
                </button>
                {attachmentSrc && (
                  <div style={{ position: 'relative', marginTop: 10, display: 'inline-block' }}>
                    <img src={attachmentSrc} alt="Preview" style={{ height: 100, borderRadius: 8, objectFit: 'cover' }} />
                    <button
                      onClick={() => setAttachmentSrc('')}
                      style={{ position: 'absolute', top: -8, right: -8, background: '#E63946', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <button className="btn btn-ghost" onClick={() => setShowNewPost(false)}>Отмена</button>
              <button
                className="btn btn-primary"
                onClick={handlePublish}
                disabled={!postText.trim()}
                style={{ opacity: !postText.trim() ? 0.6 : 1 }}
              >
                Опубликовать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
