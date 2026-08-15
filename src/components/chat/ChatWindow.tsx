import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MediaViewerModal } from './MediaViewerModal';
import { ContactDetailsSidebar } from './ContactDetailsSidebar';
import { ForwardModal } from './ForwardModal';
import { Avatar } from '../ui/Avatar';
import { Message } from '../../types';
import { Phone, Video, ChevronLeft, ShieldCheck, PanelLeftOpen, Info } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';
import { getSocket } from '../../services/socket';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeContact = conversations.find((c) => c.username.toLowerCase() === activeChat?.toLowerCase()) || null;
  const isTyping = activeChat ? typingUsers.has(activeChat) : false;
  const isMuted = activeChat ? mutedUsers.has(activeChat.toLowerCase()) : false;
  const isBlocked = activeChat ? blockedUsers.has(activeChat.toLowerCase()) : false;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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
    <div className="chat-window-container">
      {/* Main Chat Stream */}
      <div className="chat-main-area">
        {/* Header */}
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="chat-header-action-btn mobile-only-btn"
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
                className="chat-header-action-btn desktop-only-btn"
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

          {/* Header Action Buttons (Audio, Video, and Contact Info Sidebar Toggle) */}
          <div className="chat-header-actions">
            <button
              type="button"
              className="chat-header-action-btn"
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
              className="chat-header-action-btn"
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
              className={`chat-header-action-btn ${isDetailsOpen ? 'active' : ''}`}
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

        {/* Message Stream */}
        <div className="messages-container">
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
                onUnsend={(id) => unsendMessage(id)}
                onEdit={(id, text) => editMessage(id, text)}
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
    </div>
  );
};
