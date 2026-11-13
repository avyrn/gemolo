'use client';
// ============================================================
// Social Profile Page (Community)
// Displays a user's forum avatar, nickname, and recent posts & comments
// Allows the owner to edit their avatar and nickname
// ============================================================

import { useState, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useStore, ForumPost, ForumComment } from '@/lib/store';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon, Heart, MessageSquare, ChevronLeft, Edit3, Save, X, Image as ImageIcon
} from 'lucide-react';

// Emojis for quick avatar selection
const EMOJIS = ['🧑', '👨', '👩', '🧔', '👱‍♂️', '👱‍♀️', '👲', '🧕', '🦸‍♂️', '🐱', '🦁', '🐻', '🐼', '🦊', '🐨'];

// Time ago helper (repeated, but could be grouped to a util later)
const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} мин назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  const days = Math.floor(hrs / 24);
  return `${days} д назад`;
};

export default function SocialProfilePage({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { forumPosts } = useStore();
  const { account, updatePatient } = useAuth();
  const { id } = params;

  const isOwner = account?.iin === id;

  const [editing, setEditing] = useState(false);
  const [draftNick, setDraftNick] = useState('');
  const [draftAvatar, setDraftAvatar] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive profile info from latest post or from account if owner
  let profileName = 'Аноним';
  let profileAvatar = '🧑';

  if (isOwner && account) {
    profileName = account.patient.socialNickname || account.patient.fullName.split(' ')[0] || 'Аноним';
    profileAvatar = account.patient.avatar || '🧑';
  } else {
    // Find among posts/comments to infer profile
    const latestPost = forumPosts.find((p) => p.authorId === id);
    if (latestPost) {
      profileName = latestPost.authorNickname;
      profileAvatar = latestPost.authorAvatar;
    } else {
      // search comments
      const commentWithAuthor = forumPosts.flatMap(p => p.comments).find(c => c.authorId === id);
      if (commentWithAuthor) {
        profileName = commentWithAuthor.authorNickname;
        profileAvatar = commentWithAuthor.authorAvatar;
      }
    }
  }

  // Get user's content
  const userPosts = forumPosts.filter((p) => p.authorId === id);
  const userComments = forumPosts
    .flatMap((p) => p.comments.map((c) => ({ ...c, targetPostId: p.id })))
    .filter((c) => c.authorId === id);

  const startEditing = () => {
    setDraftNick(profileName);
    setDraftAvatar(profileAvatar);
    setEditing(true);
  };

  const saveEditing = () => {
    if (isOwner) {
      updatePatient({ socialNickname: draftNick, avatar: draftAvatar });
    }
    setEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setDraftAvatar(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header Back Button */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => router.back()}
          className="btn btn-ghost"
          style={{ padding: '8px 12px', marginLeft: -12 }}
        >
          <ChevronLeft size={18} /> Назад
        </button>
      </div>

      {/* Main Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--color-primary), var(--color-purple))' }} />
        
        <div style={{ padding: '0 24px 24px', position: 'relative' }}>
          {/* Avatar Area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -40, marginBottom: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--color-surface)', border: '4px solid var(--color-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', overflow: 'hidden', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {profileAvatar.length > 5 ? (
                <img src={profileAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profileAvatar
              )}
            </div>

            {isOwner && !editing && (
              <button className="btn btn-ghost" onClick={startEditing}>
                <Edit3 size={16} /> Редактировать
              </button>
            )}
            {isOwner && editing && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Отмена</button>
                <button className="btn btn-primary btn-sm" onClick={saveEditing}>Сохранить</button>
              </div>
            )}
          </div>

          {/* Profile Details or Edit Form */}
          {!editing ? (
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{profileName}</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginTop: 4 }}>
                Помогает сообществу • Участник
              </p>
            </div>
          ) : (
            <div style={{ background: 'var(--color-surface)', padding: 16, borderRadius: 12, border: '1px solid var(--color-border)' }}>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Ваше имя в сообществе (никнейм)</label>
                <input
                  type="text" className="input" placeholder="Введите имя..."
                  value={draftNick} onChange={(e) => setDraftNick(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Аватар (Фото или эмодзи)</label>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', fontSize: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', overflow: 'hidden' }}>
                    {draftAvatar.length > 5 ? <img src={draftAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : draftAvatar}
                  </div>
                  <div style={{ flex: 1, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {EMOJIS.slice(0, 5).map(em => (
                      <button key={em} onClick={() => setDraftAvatar(em)} style={{ border: 'none', background: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>{em}</button>
                    ))}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ padding: '4px 10px' }}
                    >
                      <ImageIcon size={14} /> Свое фото
                    </button>
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageUpload} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {/* Posts Tab */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={18} color="var(--color-primary)" />
            Посты ({userPosts.length})
          </h2>
          {userPosts.length === 0 ? (
            <div style={{ color: 'var(--color-text-subtle)', fontSize: '0.9375rem', padding: '12px 0' }}>Нет публикаций.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {userPosts.map(post => (
                <div key={post.id} style={{ paddingBottom: 12, borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }} onClick={() => router.push('/community')}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginBottom: 4 }}>{timeAgo(post.createdAt)} • В теме &quot;{post.category}&quot;</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-text)' }}>{post.content.length > 80 ? post.content.slice(0, 80) + '...' : post.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments Tab */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Heart size={18} color="var(--color-sos)" />
            Комментарии ({userComments.length})
          </h2>
          {userComments.length === 0 ? (
            <div style={{ color: 'var(--color-text-subtle)', fontSize: '0.9375rem', padding: '12px 0' }}>Нет комментариев.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {userComments.map(comment => (
                <div key={comment.id} style={{ paddingBottom: 12, borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }} onClick={() => router.push('/community')}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginBottom: 4 }}>{timeAgo(comment.createdAt)}</div>
                  <div style={{ fontSize: '0.9375rem', color: 'var(--color-text)', fontStyle: 'italic' }}>"{comment.content}"</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
