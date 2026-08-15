import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Conversation } from '../../types';
import { Avatar } from '../ui/Avatar';
import {
  X,
  Image as ImageIcon,
  FileText,
  Mic,
  Download,
  Search,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { VoicePlayer } from './VoicePlayer';
import { triggerHaptic } from '../../services/capacitor';

interface SharedMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Conversation;
  messages: Message[];
  onMediaClick: (url: string) => void;
}

export const SharedMediaModal: React.FC<SharedMediaModalProps> = ({
  isOpen,
  onClose,
  contact,
  messages,
  onMediaClick,
}) => {
  const [activeTab, setActiveTab] = useState<'media' | 'docs' | 'voice'>('media');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // 1. Media Items
  const mediaItems = messages.filter(
    (m) =>
      m.attachment &&
      (m.attachment.kind === 'image' || m.attachment.mime?.startsWith('image/'))
  );

  // 2. Doc Items
  const docItems = messages.filter(
    (m) =>
      m.attachment &&
      m.attachment.kind === 'file' &&
      !m.attachment.mime?.startsWith('image/') &&
      !m.attachment.mime?.startsWith('audio/')
  );

  // 3. Voice Items
  const voiceItems = messages.filter(
    (m) =>
      m.isVoice ||
      m.attachment?.kind === 'audio' ||
      m.attachment?.mime?.startsWith('audio/')
  );

  const filteredDocs = docItems.filter((d) =>
    (d.attachment?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'File';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExtension = (name?: string) => {
    if (!name) return 'FILE';
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop()?.toUpperCase() : 'FILE';
  };

  return (
    <AnimatePresence>
      <div
        className="modal-backdrop"
        onClick={onClose}
        style={{
          zIndex: 120,
          background: 'rgba(3, 7, 18, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '760px',
            width: '100%',
            height: '76vh',
            maxHeight: '680px',
            background: 'linear-gradient(180deg, #111827 0%, #0c121e 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(16, 185, 129, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Top Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Avatar
                name={contact.displayName || contact.username}
                avatarUrl={contact.avatarId}
                online={contact.online}
                size="md"
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                    Shared Media & Files
                  </h2>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '3px 0 0' }}>
                  Conversation with <span style={{ color: '#ffffff', fontWeight: 600 }}>{contact.displayName || contact.username}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              }}
              title="Close"
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>

          {/* Tab Filter Control Bar */}
          <div
            style={{
              padding: '14px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            {/* Pill Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '4px',
                borderRadius: '14px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('media');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'media' ? '#10b981' : 'transparent',
                  color: activeTab === 'media' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTab === 'media' ? '0 2px 10px rgba(16, 185, 129, 0.4)' : 'none',
                }}
              >
                <ImageIcon style={{ width: '15px', height: '15px' }} />
                <span>Photos & Videos</span>
                <span
                  style={{
                    background: activeTab === 'media' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                  }}
                >
                  {mediaItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('docs');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'docs' ? '#10b981' : 'transparent',
                  color: activeTab === 'docs' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTab === 'docs' ? '0 2px 10px rgba(16, 185, 129, 0.4)' : 'none',
                }}
              >
                <FileText style={{ width: '15px', height: '15px' }} />
                <span>Documents</span>
                <span
                  style={{
                    background: activeTab === 'docs' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                  }}
                >
                  {docItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('voice');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === 'voice' ? '#10b981' : 'transparent',
                  color: activeTab === 'voice' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTab === 'voice' ? '0 2px 10px rgba(16, 185, 129, 0.4)' : 'none',
                }}
              >
                <Mic style={{ width: '15px', height: '15px' }} />
                <span>Voice Notes</span>
                <span
                  style={{
                    background: activeTab === 'voice' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                  }}
                >
                  {voiceItems.length}
                </span>
              </button>
            </div>

            {/* Document Search Filter */}
            {activeTab === 'docs' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  width: '180px',
                }}
              >
                <Search style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>
            )}
          </div>

          {/* Scrollable Gallery & Lists */}
          <div className="conversations-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {/* 1. Photos & Videos Grid */}
            {activeTab === 'media' && (
              mediaItems.length === 0 ? (
                <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: '#10b981',
                    }}
                  >
                    <ImageIcon style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                    No photos or videos shared
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, maxWidth: '280px', marginInline: 'auto' }}>
                    Photos and videos sent or received with this contact will appear here.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {mediaItems.map((item, idx) => {
                    const mediaUrl = item.attachment?.url;
                    return (
                      <motion.div
                        key={item.id || idx}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => mediaUrl && onMediaClick(mediaUrl)}
                        style={{
                          position: 'relative',
                          aspectRatio: '1',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          background: '#161f30',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
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
                            <ImageIcon style={{ width: '28px', height: '28px' }} />
                          </div>
                        )}

                        {/* Date overlay */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '0',
                            insetInline: '0',
                            padding: '16px 8px 6px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                            color: '#ffffff',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            textAlign: 'right',
                          }}
                        >
                          {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )
            )}

            {/* 2. Documents List */}
            {activeTab === 'docs' && (
              filteredDocs.length === 0 ? (
                <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: '#10b981',
                    }}
                  >
                    <FileText style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                    No documents found
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                    Files and documents shared in this conversation will be listed here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredDocs.map((item, idx) => (
                    <motion.a
                      key={item.id || idx}
                      href={item.attachment?.url}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ x: 3 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 18px',
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        textDecoration: 'none',
                        color: '#ffffff',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {/* File badge */}
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <FileText style={{ width: '18px', height: '18px', color: '#34d399' }} />
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#10b981', marginTop: '1px' }}>
                          {getFileExtension(item.attachment?.name)}
                        </span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.attachment?.name || 'Document'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px' }}>
                          {formatFileSize(item.attachment?.size)} • {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#34d399',
                        }}
                      >
                        <Download style={{ width: '16px', height: '16px' }} />
                      </div>
                    </motion.a>
                  ))}
                </div>
              )
            )}

            {/* 3. Voice Messages List */}
            {activeTab === 'voice' && (
              voiceItems.length === 0 ? (
                <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: '#10b981',
                    }}
                  >
                    <Mic style={{ width: '32px', height: '32px', opacity: 0.8 }} />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                    No voice notes recorded
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                    Voice messages sent or received in this chat will be playable here.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {voiceItems.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px',
                        padding: '12px 18px',
                        borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {item.attachment?.url && (
                          <VoicePlayer url={item.attachment.url} isMe={false} duration={item.voiceDuration} />
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.74rem', color: '#ffffff', fontWeight: 600 }}>
                          {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
