import React, { useState } from 'react';
import { Conversation, Message } from '../../types';
import { Avatar } from '../ui/Avatar';
import {
  X,
  Phone,
  Video,
  Bell,
  BellOff,
  Trash2,
  Ban,
  UserMinus,
  Image as ImageIcon,
  FileText,
  Mic,
  Download,
  ExternalLink,
} from 'lucide-react';
import { SharedMediaModal } from './SharedMediaModal';
import { triggerHaptic } from '../../services/capacitor';

interface ContactDetailsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Conversation;
  messages: Message[];
  onAudioCall: (username: string) => void;
  onVideoCall: (username: string) => void;
  onToggleMute: (username: string, isMuted: boolean) => void;
  onToggleBlock: (username: string, isBlocked: boolean) => void;
  onUnfriend: (username: string) => void;
  onClearChat: (username: string) => void;
  onMediaClick: (url: string) => void;
  isMuted?: boolean;
  isBlocked?: boolean;
}

export const ContactDetailsSidebar: React.FC<ContactDetailsSidebarProps> = ({
  isOpen,
  onClose,
  contact,
  messages,
  onAudioCall,
  onVideoCall,
  onToggleMute,
  onToggleBlock,
  onUnfriend,
  onClearChat,
  onMediaClick,
  isMuted = false,
  isBlocked = false,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'media' | 'docs' | 'voice'>('media');
  const [isSharedMediaModalOpen, setIsSharedMediaModalOpen] = useState(false);
  const [showConfirmUnfriend, setShowConfirmUnfriend] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  // Extract shared media attachments from message history
  const mediaItems = messages.filter(
    (m) =>
      m.attachment &&
      (m.attachment.kind === 'image' || m.attachment.mime?.startsWith('image/'))
  );

  const docItems = messages.filter(
    (m) =>
      m.attachment &&
      m.attachment.kind === 'file' &&
      !m.attachment.mime?.startsWith('image/') &&
      !m.attachment.mime?.startsWith('audio/')
  );

  const voiceItems = messages.filter(
    (m) =>
      m.isVoice ||
      m.attachment?.kind === 'audio' ||
      m.attachment?.mime?.startsWith('audio/')
  );

  const recentMedia = mediaItems.slice(0, 2);
  const recentDocs = docItems.slice(0, 2);
  const recentVoice = voiceItems.slice(0, 2);

  return (
    <>
      <div
        style={{
          width: '340px',
          minWidth: '340px',
          maxWidth: '340px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 20,
          animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
            Contact Info
          </h3>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="header-action-btn"
            style={{ width: '32px', height: '32px' }}
            title="Close details"
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="conversations-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* User Card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ marginBottom: '12px' }}>
              <Avatar
                name={contact.displayName || contact.username}
                avatarUrl={contact.avatarId}
                online={contact.online}
                size="xl"
              />
            </div>

            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '2px' }}>
              {contact.displayName || contact.username}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
              @{contact.username}
            </p>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: contact.online ? '#34d399' : '#64748b',
                background: contact.online ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                padding: '2px 10px',
                borderRadius: '9999px',
                marginBottom: '16px',
              }}
            >
              {contact.online ? '● Online' : 'Offline'}
            </span>

            {/* Quick Call Actions */}
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onAudioCall(contact.username);
                }}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '9px', borderRadius: '12px', fontSize: '0.8rem' }}
              >
                <Phone style={{ width: '15px', height: '15px', color: '#34d399' }} /> Call
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onVideoCall(contact.username);
                }}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '9px', borderRadius: '12px', fontSize: '0.8rem' }}
              >
                <Video style={{ width: '15px', height: '15px', color: '#38bdf8' }} /> Video
              </button>
            </div>
          </div>

          {/* Bio / Status Content */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid var(--border)',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              {contact.bio || 'Hey there! I am using Novyn Chat.'}
            </p>
          </div>

          {/* Shared Media & Files Section */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Shared Files & Media
              </span>

              {/* View All Button on the right of header */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setIsSharedMediaModalOpen(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#10b981',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '2px 4px',
                  borderRadius: '4px',
                }}
                title="View all shared media on popup screen"
              >
                View All <ExternalLink style={{ width: '12px', height: '12px' }} />
              </button>
            </div>

            {/* Media Filter Tabs */}
            <div className="tab-switcher" style={{ marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveMediaTab('media')}
                className={`tab-btn ${activeMediaTab === 'media' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                <ImageIcon style={{ width: '13px', height: '13px' }} /> Media ({mediaItems.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab('docs')}
                className={`tab-btn ${activeMediaTab === 'docs' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                <FileText style={{ width: '13px', height: '13px' }} /> Docs ({docItems.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab('voice')}
                className={`tab-btn ${activeMediaTab === 'voice' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                <Mic style={{ width: '13px', height: '13px' }} /> Voice ({voiceItems.length})
              </button>
            </div>

            {/* 1. Media Grid (Photos / Videos - 1-2 Recent Items) */}
            {activeMediaTab === 'media' && (
              mediaItems.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <ImageIcon style={{ width: '28px', height: '28px', margin: '0 auto 6px', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.78rem', margin: 0 }}>No photos or videos yet</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {recentMedia.map((item, idx) => {
                    const mediaUrl = item.attachment?.url;
                    return (
                      <div
                        key={item.id || idx}
                        onClick={() => mediaUrl && onMediaClick(mediaUrl)}
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          background: '#101624',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {mediaUrl ? (
                          <img
                            src={mediaUrl}
                            alt="Shared media"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                            <ImageIcon style={{ width: '20px', height: '20px' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* 2. Documents & Files (1-2 Recent Items) */}
            {activeMediaTab === 'docs' && (
              docItems.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <FileText style={{ width: '28px', height: '28px', margin: '0 auto 6px', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.78rem', margin: 0 }}>No shared documents</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {recentDocs.map((item, idx) => (
                    <a
                      key={item.id || idx}
                      href={item.attachment?.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.025)',
                        border: '1px solid var(--border)',
                        textDecoration: 'none',
                        color: '#ffffff',
                      }}
                    >
                      <FileText style={{ width: '18px', height: '18px', color: '#10b981', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.attachment?.name || 'Document'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {item.attachment?.size ? `${Math.round(item.attachment.size / 1024)} KB` : 'File'}
                        </div>
                      </div>
                      <Download style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                    </a>
                  ))}
                </div>
              )
            )}

            {/* 3. Voice Messages (1-2 Recent Items) */}
            {activeMediaTab === 'voice' && (
              voiceItems.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748b', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <Mic style={{ width: '28px', height: '28px', margin: '0 auto 6px', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.78rem', margin: 0 }}>No voice notes yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {recentVoice.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.025)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Mic style={{ width: '16px', height: '16px', color: '#34d399' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                          Voice message
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Privacy & Danger Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              Chat Options
            </span>

            {/* Mute Notifications */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onToggleMute(contact.username, !isMuted);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                color: '#ffffff',
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isMuted ? (
                  <BellOff style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                ) : (
                  <Bell style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                )}
                <span>{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: isMuted ? '#f59e0b' : '#64748b', fontWeight: 600 }}>
                {isMuted ? 'Muted' : 'Off'}
              </span>
            </button>

            {/* Clear Chat History */}
            {showConfirmClear ? (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.76rem', color: '#f87171' }}>Clear messages?</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowConfirmClear(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      onClearChat(contact.username);
                      setShowConfirmClear(false);
                    }}
                    style={{ background: '#ef4444', border: 'none', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border)',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
                <span>Clear Chat History</span>
              </button>
            )}

            {/* Block / Unblock Contact */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onToggleBlock(contact.username, !isBlocked);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: '12px',
                background: isBlocked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isBlocked ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border)',
                color: isBlocked ? '#f87171' : '#ffffff',
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Ban style={{ width: '16px', height: '16px', color: isBlocked ? '#ef4444' : '#94a3b8' }} />
                <span>{isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
              </div>
              {isBlocked && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444' }}>Blocked</span>}
            </button>

            {/* Unfriend Contact */}
            {showConfirmUnfriend ? (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.76rem', color: '#f87171' }}>Unfriend user?</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowConfirmUnfriend(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('heavy');
                      onUnfriend(contact.username);
                      setShowConfirmUnfriend(false);
                      onClose();
                    }}
                    style={{ background: '#ef4444', border: 'none', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmUnfriend(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                }}
              >
                <UserMinus style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                <span>Unfriend Contact</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shared Media & Files Full Modal Popup Screen */}
      <SharedMediaModal
        isOpen={isSharedMediaModalOpen}
        onClose={() => setIsSharedMediaModalOpen(false)}
        contact={contact}
        messages={messages}
        onMediaClick={onMediaClick}
      />
    </>
  );
};
