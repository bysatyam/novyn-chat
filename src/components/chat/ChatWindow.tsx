import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MediaViewerModal } from './MediaViewerModal';
import { ContactDetailsSidebar } from './ContactDetailsSidebar';
import { Avatar } from '../ui/Avatar';
import { Message } from '../../types';
import { Phone, Video, ChevronLeft, ShieldCheck, PanelLeftOpen, Info } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

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

  if (!activeChat) {
    return (
      <div className="empty-chat-screen" style={{ position: 'relative', padding: '32px' }}>
        <div className="empty-chat-icon">
          <ShieldCheck style={{ width: '32px', height: '32px' }} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
          Your Messages
        </h3>
        <p style={{ fontSize: '0.88rem', maxWidth: '360px', lineHeight: 1.6, color: '#94a3b8', marginBottom: isListCollapsed ? '24px' : '0' }}>
          Select a contact or add a friend to start chatting in real time with end-to-end encryption.
        </p>

        {isListCollapsed && (
          <button
            type="button"
            onClick={onToggleList}
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '14px' }}
          >
            <PanelLeftOpen style={{ width: '16px', height: '16px' }} /> Show Chats Panel
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Central Conversation Column */}
      <div className="chat-window" style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-user">
            {isListCollapsed && (
              <button
                type="button"
                onClick={onToggleList}
                className="header-action-btn"
                style={{ marginRight: '4px' }}
                title="Show chats panel"
              >
                <PanelLeftOpen style={{ width: '18px', height: '18px' }} />
              </button>
            )}

            {/* Mobile Back button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveChat(null);
              }}
              className="header-action-btn"
              style={{ display: 'none' }} // Visible on mobile via CSS media
            >
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
            </button>

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
                size="md"
              />

              <div>
                <div className="chat-header-name">
                  {activeContact?.displayName || activeChat}
                </div>
                <div className={`chat-header-status ${activeContact?.online ? 'online' : ''}`}>
                  {isTyping ? (
                    <span style={{ color: '#10b981', fontWeight: 700 }}>typing...</span>
                  ) : activeContact?.online ? (
                    'Online'
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
              onClick={() => startCall(activeChat, false)}
              className="header-action-btn"
              title="Audio Call"
            >
              <Phone style={{ width: '16px', height: '16px' }} />
            </button>

            <button
              type="button"
              onClick={() => startCall(activeChat, true)}
              className="header-action-btn"
              title="Video Call"
            >
              <Video style={{ width: '16px', height: '16px' }} />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsDetailsOpen((prev) => !prev);
              }}
              className="header-action-btn"
              style={isDetailsOpen ? { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' } : {}}
              title="Contact Info & Media"
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
    </div>
  );
};
