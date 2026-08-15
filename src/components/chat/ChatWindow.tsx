import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MediaViewerModal } from './MediaViewerModal';
import { ContactDetailsSidebar } from './ContactDetailsSidebar';
import { ForwardModal } from './ForwardModal';
import { PinnedMessageBanner } from './PinnedMessageBanner';
import { InChatSearch } from './InChatSearch';
import { DropZoneOverlay } from './DropZoneOverlay';
import { WallpaperPickerModal } from './WallpaperPickerModal';
import { CommandPaletteModal } from '../layout/CommandPaletteModal';
import { Avatar } from '../ui/Avatar';
import { Message } from '../../types';
import { Phone, Video, ChevronLeft, ShieldCheck, PanelLeftOpen, Info, Search, Palette, Command } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';
import { getSocket } from '../../services/socket';
import { uploadMediaFile } from '../../services/api';

interface ChatWindowProps {
  isListCollapsed?: boolean;
  onToggleList?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isListCollapsed,
  onToggleList,
}) => {
  const { user } = useAuth();
  const {
    activeChat,
    setActiveChat,
    conversations,
    messages,
    sendMessage,
    sendTyping,
    addReaction,
    pinMessage,
    unpinMessage,
    createPoll,
    votePoll,
    typingUsers,
    mutedUsers,
    blockedUsers,
    startCall,
    muteUser,
    blockUser,
    unfriendUser,
    clearChat,
    unsendMessage,
    editMessage,
  } = useChat();

  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [wallpaper, setWallpaper] = useState<string>(() => localStorage.getItem('novyn_chat_wallpaper') || 'var(--bg-canvas)');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact = conversations.find((c) => c.username.toLowerCase() === activeChat?.toLowerCase()) || null;
  const isTyping = activeChat ? typingUsers.has(activeChat) : false;
  const isMuted = activeChat ? mutedUsers.has(activeChat.toLowerCase()) : false;
  const isBlocked = activeChat ? blockedUsers.has(activeChat.toLowerCase()) : false;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleWallpaperChange = (newBg: string) => {
    setWallpaper(newBg);
    localStorage.setItem('novyn_chat_wallpaper', newBg);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    triggerHaptic('medium');
    try {
      const uploadRes = await uploadMediaFile(file);
      if (uploadRes?.url) {
        sendMessage('', {
          attachment: {
            url: uploadRes.url,
            name: file.name,
            size: file.size,
            mime: file.type,
            kind: file.type.startsWith('image/')
              ? 'image'
              : file.type.startsWith('video/')
              ? 'video'
              : file.type.startsWith('audio/')
              ? 'audio'
              : 'file',
          },
        });
      }
    } catch (err) {
      console.error('[Chat] Drag-drop upload error:', err);
    }
  };

  const pinnedMessages = messages.filter((m) => Boolean(m.pinnedAt));
  const matchedMessages = searchQuery.trim()
    ? messages.filter((m) => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleJumpToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.transition = 'all 0.3s ease';
      el.style.filter = 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.8))';
      setTimeout(() => {
        el.style.filter = 'none';
      }, 1500);
    }
  };

  const handleNextMatch = () => {
    if (matchedMessages.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matchedMessages.length;
    setCurrentMatchIndex(nextIdx);
    handleJumpToMessage(matchedMessages[nextIdx].id);
  };

  const handlePrevMatch = () => {
    if (matchedMessages.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matchedMessages.length) % matchedMessages.length;
    setCurrentMatchIndex(prevIdx);
    handleJumpToMessage(matchedMessages[prevIdx].id);
  };

  const handleForward = (targetUsername: string, msg: Message) => {
    const socket = getSocket();
    if (!socket || !user) return;
    const clientTempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    socket.emit('private_message', {
      to: targetUsername,
      toType: 'friend',
      text: msg.text || (msg.attachment?.kind === 'image' ? '[Image]' : msg.isVoice ? '[Voice Message]' : '[File]'),
      attachment: msg.attachment || null,
      clientTempId,
    });
  };

  if (!activeChat) {
    return (
      <div className="empty-chat-screen" style={{ position: 'relative', padding: '32px' }}>
        <div className="empty-chat-icon">
          <ShieldCheck style={{ width: '48px', height: '48px', color: '#10b981' }} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
          Select a Conversation
        </h2>
        <p style={{ color: 'var(--text-dark)', maxWidth: '360px', lineHeight: 1.5, fontSize: '0.9rem' }}>
          Choose a contact from the left sidebar to start chatting with end-to-end encryption.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Central Conversation Column */}
      <div className="chat-window" style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="header-action-btn mobile-only-btn"
              onClick={() => {
                triggerHaptic('light');
                setActiveChat(null);
              }}
              title="Back to chats"
              style={{ display: 'none' }}
            >
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
            </button>

            {onToggleList && (
              <button
                type="button"
                className="header-action-btn desktop-only-btn"
                onClick={() => {
                  triggerHaptic('light');
                  onToggleList();
                }}
                title={isListCollapsed ? 'Expand chat list' : 'Collapse chat list'}
              >
                <PanelLeftOpen style={{ width: '18px', height: '18px', transform: isListCollapsed ? 'scaleX(-1)' : 'none' }} />
              </button>
            )}

            <div
              onClick={() => {
                triggerHaptic('light');
                setIsDetailsOpen((prev) => !prev);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              title="Click to toggle contact details sidebar"
            >
              <Avatar
                name={activeContact?.displayName || activeChat}
                avatarUrl={activeContact?.avatarId}
                online={activeContact?.online}
                presence={activeContact?.presence}
                size="md"
              />

              <div>
                <div className="chat-header-name">
                  {activeContact?.displayName || activeChat}
                </div>
                <div className={`chat-header-status ${activeContact?.online ? 'online' : ''}`}>
                  {isTyping ? (
                    <span style={{ color: '#10b981', fontWeight: 700 }}>typing...</span>
                  ) : activeContact?.presence === 'away' ? (
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>Away</span>
                  ) : activeContact?.online ? (
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Online</span>
                  ) : (
                    'Offline'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Header Action Buttons (Search, Audio, Video, and Contact Info) */}
          <div className="chat-header-actions">
            <button
              type="button"
              className="header-action-btn"
              style={isSearchOpen ? { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' } : {}}
              onClick={() => {
                triggerHaptic('light');
                setIsSearchOpen((prev) => !prev);
                if (isSearchOpen) setSearchQuery('');
              }}
              title="Search in conversation"
            >
              <Search style={{ width: '16px', height: '16px' }} />
            </button>

            <button
              type="button"
              className="header-action-btn"
              onClick={() => {
                triggerHaptic('medium');
                startCall(activeChat, false);
              }}
              title="Start Audio Call"
            >
              <Phone style={{ width: '16px', height: '16px' }} />
            </button>

            <button
              type="button"
              className="header-action-btn"
              onClick={() => {
                triggerHaptic('medium');
                startCall(activeChat, true);
              }}
              title="Start Video Call"
            >
              <Video style={{ width: '16px', height: '16px' }} />
            </button>

            <button
              type="button"
              className="header-action-btn"
              onClick={() => {
                triggerHaptic('light');
                setIsWallpaperModalOpen(true);
              }}
              title="Chat Wallpaper & Theme"
            >
              <Palette style={{ width: '16px', height: '16px', color: '#ec4899' }} />
            </button>

            <button
              type="button"
              className="header-action-btn"
              onClick={() => {
                triggerHaptic('light');
                setIsCommandPaletteOpen(true);
              }}
              title="Quick Actions (Ctrl+K)"
            >
              <Command style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
            </button>

            <button
              type="button"
              className="header-action-btn"
              style={isDetailsOpen ? { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' } : {}}
              onClick={() => {
                triggerHaptic('light');
                setIsDetailsOpen((prev) => !prev);
              }}
              title="View Contact Details & Media"
            >
              <Info style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* In-Chat Message Search Bar */}
        <InChatSearch
          isOpen={isSearchOpen}
          query={searchQuery}
          onQueryChange={(q) => {
            setSearchQuery(q);
            setCurrentMatchIndex(0);
          }}
          matchesCount={matchedMessages.length}
          currentMatchIndex={currentMatchIndex}
          onPrevMatch={handlePrevMatch}
          onNextMatch={handleNextMatch}
          onClose={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        />

        {/* Top Pinned Message Banner */}
        <PinnedMessageBanner
          pinnedMessages={pinnedMessages}
          onJumpToMessage={handleJumpToMessage}
          onUnpin={(msgId) => unpinMessage(msgId)}
        />

        {/* Drag & Drop File Upload Overlay */}
        <DropZoneOverlay isDragging={isDragging} onFileSelect={() => {}} />

        {/* Message Stream with Custom Background Wallpaper */}
        <div
          className="messages-container"
          style={{ background: wallpaper, position: 'relative' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              No messages yet. Send a message to start! 👋
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMe={msg.sender?.toLowerCase() === user?.username.toLowerCase()}
                onReply={(m) => setReplyMessage(m)}
                onReaction={(id, emoji) => addReaction(id, emoji)}
                onMediaClick={(url) => setSelectedMedia(url)}
                onForward={(m) => setForwardMessage(m)}
                onPin={(id) => pinMessage(id)}
                onUnpin={(id) => unpinMessage(id)}
                onUnsend={(id) => unsendMessage(id)}
                onEdit={(id, text) => editMessage(id, text)}
                onVotePoll={votePoll}
                currentUsername={user?.username}
                searchQuery={searchQuery}
              />
            ))
          )}

          {/* Animated typing indicator wave */}
          {isTyping && (
            <div className="bubble-row other">
              <div className="bubble other" style={{ padding: '10px 16px', display: 'flex', gap: '5px', alignItems: 'center', minHeight: '34px' }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="chat-input-bar">
          <MessageInput
            onSendMessage={sendMessage}
            onTyping={sendTyping}
            replyMessage={replyMessage}
            onCancelReply={() => setReplyMessage(null)}
            onCreatePoll={createPoll}
          />
        </div>
      </div>

      {/* Right Side Contact & Media Details Sidebar */}
      <ContactDetailsSidebar
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        contact={activeContact || { username: activeChat, displayName: activeChat, unreadCount: 0, online: false }}
        messages={messages}
        onAudioCall={(u) => startCall(u, false)}
        onVideoCall={(u) => startCall(u, true)}
        onToggleMute={(u, m) => muteUser(u, m)}
        onToggleBlock={(u, b) => blockUser(u, b)}
        onUnfriend={(u) => unfriendUser(u)}
        onClearChat={(u) => clearChat(u)}
        onMediaClick={(url) => setSelectedMedia(url)}
        isMuted={isMuted}
        isBlocked={isBlocked}
      />

      {/* Media Lightbox */}
      <MediaViewerModal
        mediaUrl={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />

      {/* Forward Message Modal */}
      <ForwardModal
        message={forwardMessage}
        conversations={conversations}
        onClose={() => setForwardMessage(null)}
        onForward={handleForward}
      />

      {/* Wallpaper Picker Modal */}
      <WallpaperPickerModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        currentWallpaper={wallpaper}
        onSelectWallpaper={handleWallpaperChange}
      />

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        conversations={conversations}
        activeChat={activeChat}
        onSelectChat={(u) => setActiveChat(u)}
        onAudioCall={(u) => startCall(u, false)}
        onVideoCall={(u) => startCall(u, true)}
        onOpenPollModal={() => {
          const el = document.querySelector('.input-actions') as HTMLElement;
          if (el) el.scrollIntoView();
        }}
        onOpenWallpaperModal={() => setIsWallpaperModalOpen(true)}
        onOpenQRModal={() => setIsDetailsOpen(true)}
        onOpenExportModal={() => setIsDetailsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    </div>
  );
};
