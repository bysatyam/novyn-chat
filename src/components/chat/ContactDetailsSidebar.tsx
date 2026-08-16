import React, { useState, useEffect } from 'react';
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
  UserPlus,
  Users,
  Crown,
  Shield,
  LogOut,
  Image as ImageIcon,
  FileText,
  Mic,
  Download,
  ExternalLink,
  QrCode,
  Palette,
  Check,
} from 'lucide-react';
import { SharedMediaModal } from './SharedMediaModal';
import { ExportChatModal } from './ExportChatModal';
import { QRCodeModal } from '../profile/QRCodeModal';
import { WallpaperPickerModal } from './WallpaperPickerModal';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { triggerHaptic } from '../../services/capacitor';
import { getSocket } from '../../services/socket';

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
  const { user } = useAuth();
  const {
    conversations,
    chatWallpaper,
    setChatWallpaper,
    addGroupMembers,
    removeGroupMember,
    leaveGroup,
  } = useChat();

  const [activeMediaTab, setActiveMediaTab] = useState<'media' | 'docs' | 'voice'>('media');
  const [isSharedMediaModalOpen, setIsSharedMediaModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [showConfirmUnfriend, setShowConfirmUnfriend] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  // Group Details & Members State
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const isGroup = Boolean(contact.isGroup);

  useEffect(() => {
    if (!isGroup) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('get_group_info', { groupId: contact.username });

    const handleGroupInfo = (data: any) => {
      if (data?.group && (data.group.id === contact.username || data.group.id?.toLowerCase() === contact.username.toLowerCase())) {
        setGroupInfo(data.group);
      }
    };

    socket.on('group_info', handleGroupInfo);
    socket.on('group_members_added', () => socket.emit('get_group_info', { groupId: contact.username }));
    socket.on('group_member_removed', () => socket.emit('get_group_info', { groupId: contact.username }));

    return () => {
      socket.off('group_info', handleGroupInfo);
    };
  }, [isGroup, contact.username]);

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

  // Friends who are not yet in this group
  const existingMemberKeys = new Set(
    (groupInfo?.members || []).map((m: any) => m.username?.toLowerCase())
  );
  const eligibleFriendsToAdd = conversations.filter(
    (c) => !c.isGroup && !existingMemberKeys.has(c.username.toLowerCase())
  );

  const isCurrentMemberAdmin = Boolean(
    groupInfo?.me?.isAdmin ||
    groupInfo?.me?.isOwner ||
    groupInfo?.owner?.toLowerCase() === user?.username.toLowerCase()
  );

  const handleAddSelectedMembers = () => {
    if (selectedToAdd.length === 0) return;
    addGroupMembers(contact.username, selectedToAdd);
    setSelectedToAdd([]);
    setIsAddMembersOpen(false);
    triggerHaptic('success');
  };

  const handleRemoveMember = (targetUser: string) => {
    removeGroupMember(contact.username, targetUser);
    setMemberToRemove(null);
    triggerHaptic('medium');
  };

  const handleLeaveGroup = () => {
    leaveGroup(contact.username);
    setShowConfirmLeave(false);
    onClose();
  };

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
            {isGroup ? 'Group Info' : 'Contact Info'}
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
          {/* Group Profile or User Card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ marginBottom: '12px' }}>
              <Avatar
                name={contact.displayName || contact.username}
                avatarUrl={contact.avatarId}
                online={contact.online}
                presence={contact.presence}
                isGroup={isGroup}
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
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.12)',
                padding: '2px 10px',
                borderRadius: '9999px',
                marginBottom: isGroup ? '12px' : '16px',
              }}
            >
              {isGroup
                ? `👥 ${groupInfo?.members?.length || contact.memberCount || 2} members`
                : contact.online
                ? '● Online'
                : 'Offline'}
            </span>

            {/* Quick 1-on-1 Call Actions (only for direct contacts) */}
            {!isGroup && (
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
            )}
          </div>

          {/* Group Members Section */}
          {isGroup && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  MEMBERS ({groupInfo?.members?.length || contact.memberCount || 2})
                </span>

                {isCurrentMemberAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsAddMembersOpen((prev) => !prev)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#10b981',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <UserPlus style={{ width: '13px', height: '13px' }} /> Add Member
                  </button>
                )}
              </div>

              {/* Add Members Drawer / Inline Selector */}
              {isAddMembersOpen && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#34d399' }}>
                    Select friends to add:
                  </span>
                  {eligibleFriendsToAdd.length === 0 ? (
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      All your friends are already in this group.
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
                      {eligibleFriendsToAdd.map((f) => {
                        const isSelected = selectedToAdd.includes(f.username);
                        return (
                          <div
                            key={f.username}
                            onClick={() => {
                              setSelectedToAdd((prev) =>
                                isSelected ? prev.filter((u) => u !== f.username) : [...prev, f.username]
                              );
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 8px',
                              borderRadius: '8px',
                              background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                              cursor: 'pointer',
                            }}
                          >
                            <span style={{ fontSize: '0.78rem', color: '#ffffff' }}>
                              {f.displayName || f.username}
                            </span>
                            {isSelected && <Check style={{ width: '12px', height: '12px', color: '#10b981' }} />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {eligibleFriendsToAdd.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setIsAddMembersOpen(false)}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.05)',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '0.74rem',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSelectedMembers}
                        disabled={selectedToAdd.length === 0}
                        style={{
                          flex: 1,
                          padding: '6px',
                          borderRadius: '8px',
                          background: '#10b981',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          opacity: selectedToAdd.length === 0 ? 0.5 : 1,
                        }}
                      >
                        Add ({selectedToAdd.length})
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Members List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(groupInfo?.members || []).map((m: any) => {
                  const isMe = m.username?.toLowerCase() === user?.username.toLowerCase();
                  const isOwner = m.isOwner || m.role === 'owner' || groupInfo?.owner?.toLowerCase() === m.username?.toLowerCase();
                  const isAdmin = m.isAdmin || m.role === 'admin';

                  return (
                    <div
                      key={m.username}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar
                          name={m.displayName || m.username}
                          avatarUrl={m.avatarId}
                          online={m.online}
                          size="sm"
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                              {m.displayName || m.username} {isMe && '(You)'}
                            </span>
                            {isOwner ? (
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  color: '#f59e0b',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <Crown style={{ width: '9px', height: '9px' }} /> Owner
                              </span>
                            ) : isAdmin ? (
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  background: 'rgba(56, 189, 248, 0.15)',
                                  color: '#38bdf8',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <Shield style={{ width: '9px', height: '9px' }} /> Admin
                              </span>
                            ) : null}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            @{m.username}
                          </span>
                        </div>
                      </div>

                      {/* Remove Member Action (if I am Admin/Owner and target is not owner) */}
                      {isCurrentMemberAdmin && !isMe && !isOwner && (
                        <div>
                          {memberToRemove === m.username ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => setMemberToRemove(null)}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m.username)}
                                style={{ background: '#ef4444', border: 'none', color: '#ffffff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setMemberToRemove(m.username)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.7, cursor: 'pointer', padding: '4px' }}
                              title="Remove member"
                            >
                              <X style={{ width: '14px', height: '14px' }} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shared Media & Files Section */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Shared Files & Media
              </span>

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

            {/* Media Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '3px',
                borderRadius: '10px',
                marginBottom: '10px',
                border: '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveMediaTab('media')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeMediaTab === 'media' ? '#10b981' : 'transparent',
                  color: activeMediaTab === 'media' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <ImageIcon style={{ width: '12px', height: '12px' }} /> Media ({mediaItems.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab('docs')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeMediaTab === 'docs' ? '#10b981' : 'transparent',
                  color: activeMediaTab === 'docs' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText style={{ width: '12px', height: '12px' }} /> Docs ({docItems.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab('voice')}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeMediaTab === 'voice' ? '#10b981' : 'transparent',
                  color: activeMediaTab === 'voice' ? '#ffffff' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Mic style={{ width: '12px', height: '12px' }} /> Voice ({voiceItems.length})
              </button>
            </div>

            {/* Media Tab Contents */}
            {activeMediaTab === 'media' && (
              <div>
                {recentMedia.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                    <ImageIcon style={{ width: '22px', height: '22px', margin: '0 auto 6px', opacity: 0.3 }} />
                    No photos or videos yet
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {recentMedia.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => item.attachment && onMediaClick(item.attachment.url)}
                        style={{
                          height: '90px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: '#090d16',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                        }}
                      >
                        <img
                          src={item.attachment?.url}
                          alt={item.attachment?.name || 'media'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeMediaTab === 'docs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {recentDocs.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                    <FileText style={{ width: '22px', height: '22px', margin: '0 auto 6px', opacity: 0.3 }} />
                    No documents shared yet
                  </div>
                ) : (
                  recentDocs.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.attachment?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border)',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: '0.78rem',
                      }}
                    >
                      <FileText style={{ width: '16px', height: '16px', color: '#10b981', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {item.attachment?.name || 'Document'}
                      </span>
                      <Download style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                    </a>
                  ))
                )}
              </div>
            )}

            {activeMediaTab === 'voice' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {recentVoice.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                    <Mic style={{ width: '22px', height: '22px', margin: '0 auto 6px', opacity: 0.3 }} />
                    No voice notes recorded yet
                  </div>
                ) : (
                  recentVoice.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Mic style={{ width: '14px', height: '14px', color: '#38bdf8' }} />
                      <span style={{ fontSize: '0.78rem', color: '#ffffff', flex: 1 }}>
                        Voice message ({new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Chat Options & Actions - Redesigned Grouped Card */}
          <div style={{ marginBottom: '22px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              CHAT OPTIONS
            </span>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.035)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              {/* 1. Mute Toggle */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  onToggleMute(contact.username, !isMuted);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isMuted ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isMuted ? '#f59e0b' : '#94a3b8',
                    }}
                  >
                    {isMuted ? <BellOff style={{ width: '16px', height: '16px' }} /> : <Bell style={{ width: '16px', height: '16px' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff' }}>Mute Notifications</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{isMuted ? 'Alerts are silenced' : 'Play sound on new messages'}</div>
                  </div>
                </div>

                {/* Modern iOS-style Switch Indicator */}
                <div
                  style={{
                    width: '38px',
                    height: '22px',
                    borderRadius: '9999px',
                    background: isMuted ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: '2px',
                      left: isMuted ? '18px' : '2px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }}
                  />
                </div>
              </div>

              {/* 2. Export Chat */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  setIsExportModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderBottom: !isGroup ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                    }}
                  >
                    <Download style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff' }}>Export Chat History</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Download messages and media file</div>
                  </div>
                </div>
                <ExternalLink style={{ width: '15px', height: '15px', color: '#64748b' }} />
              </div>

              {/* 3. QR Code (1-on-1 only) */}
              {!isGroup && (
                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setIsQRModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8',
                      }}
                    >
                      <QrCode style={{ width: '16px', height: '16px' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff' }}>Contact QR Code</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Quick scan to share with others</div>
                    </div>
                  </div>
                  <ExternalLink style={{ width: '15px', height: '15px', color: '#64748b' }} />
                </div>
              )}

              {/* 4. Wallpaper & Theme */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  setIsWallpaperModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(236, 72, 153, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ec4899',
                    }}
                  >
                    <Palette style={{ width: '16px', height: '16px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff' }}>Chat Wallpaper & Theme</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Custom backdrop and colors</div>
                  </div>
                </div>
                <ExternalLink style={{ width: '15px', height: '15px', color: '#64748b' }} />
              </div>
            </div>
          </div>

          {/* Danger Zone: Grouped Card */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              DANGER ZONE
            </span>

            <div
              style={{
                background: 'rgba(239, 68, 68, 0.035)',
                border: '1px solid rgba(239, 68, 68, 0.18)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              {isGroup ? (
                /* Leave Group Action */
                showConfirmLeave ? (
                  <div
                    style={{
                      padding: '14px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>Leave this group?</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setShowConfirmLeave(false)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleLeaveGroup}
                        style={{ background: '#ef4444', border: 'none', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowConfirmLeave(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444',
                        }}
                      >
                        <LogOut style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f87171' }}>Leave Group</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Exit and remove conversation</div>
                      </div>
                    </div>
                    <ExternalLink style={{ width: '15px', height: '15px', color: '#ef4444' }} />
                  </div>
                )
              ) : (
                <>
                  {/* 1. Clear Chat History */}
                  {showConfirmClear ? (
                    <div
                      style={{
                        padding: '14px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        borderBottom: '1px solid rgba(239, 68, 68, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>Clear all messages?</span>
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
                            triggerHaptic('heavy');
                            onClearChat(contact.username);
                            setShowConfirmClear(false);
                          }}
                          style={{ background: '#ef4444', border: 'none', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowConfirmClear(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(239, 68, 68, 0.12)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                          }}
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f87171' }}>Clear Chat History</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Delete message stream locally</div>
                        </div>
                      </div>
                      <ExternalLink style={{ width: '15px', height: '15px', color: '#ef4444' }} />
                    </div>
                  )}

                  {/* 2. Block Contact */}
                  <div
                    onClick={() => {
                      triggerHaptic('medium');
                      onToggleBlock(contact.username, !isBlocked);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(239, 68, 68, 0.12)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444',
                        }}
                      >
                        <Ban style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f87171' }}>
                          {isBlocked ? 'Unblock Contact' : 'Block Contact'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {isBlocked ? 'Allow messaging & calls' : 'Stop incoming messages & calls'}
                        </div>
                      </div>
                    </div>
                    {isBlocked ? (
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                        Blocked
                      </span>
                    ) : (
                      <ExternalLink style={{ width: '15px', height: '15px', color: '#ef4444' }} />
                    )}
                  </div>

                  {/* 3. Unfriend */}
                  {showConfirmUnfriend ? (
                    <div
                      style={{
                        padding: '14px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>Unfriend @{contact.username}?</span>
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
                          style={{ background: '#ef4444', border: 'none', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Unfriend
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowConfirmUnfriend(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                          }}
                        >
                          <UserMinus style={{ width: '16px', height: '16px' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f87171' }}>Unfriend Contact</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Remove from friends list</div>
                        </div>
                      </div>
                      <ExternalLink style={{ width: '15px', height: '15px', color: '#ef4444' }} />
                    </div>
                  )}
                </>
              )}
            </div>
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

      {/* Export Chat Modal */}
      <ExportChatModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        messages={messages}
        contactName={contact.displayName || contact.username}
      />

      {/* QR Code Modal (1-on-1 only) */}
      {!isGroup && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          username={contact.username}
          displayName={contact.displayName}
          avatarUrl={contact.avatarId}
        />
      )}

      {/* Chat Wallpaper & Theme Modal */}
      <WallpaperPickerModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        currentWallpaper={chatWallpaper}
        onSelectWallpaper={(bg) => setChatWallpaper(contact.username, bg)}
      />
    </>
  );
};
