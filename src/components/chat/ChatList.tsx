import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { Search, UserPlus, MessageSquare } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

interface ChatListProps {
  onOpenContacts: () => void;
  isCompact?: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({
  onOpenContacts,
  isCompact = false,
}) => {
  const { conversations, activeChat, setActiveChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      (c.displayName && c.displayName.toLowerCase().includes(query)) ||
      c.username.toLowerCase().includes(query)
    );
  });

  const formatLastSeen = (ts?: string | number) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      return isToday
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  if (isCompact) {
    return (
      <div
        className="chat-list-panel"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          gap: '10px',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenContacts();
          }}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            marginBottom: '8px',
          }}
          title="Add Friend"
        >
          <UserPlus style={{ width: '18px', height: '18px' }} />
        </button>

        <div
          className="conversations-scroll"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '0',
          }}
        >
          {filteredConversations.map((conv) => {
            const isSelected = activeChat?.toLowerCase() === conv.username.toLowerCase();
            return (
              <div
                key={conv.username}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveChat(conv.username);
                }}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '52px',
                  borderRadius: '14px',
                  background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                title={`${conv.displayName || conv.username} ${conv.unreadCount > 0 ? `(${conv.unreadCount} unread)` : ''}`}
              >
                {/* Left Active Pill Indicator */}
                {isSelected && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '0',
                      width: '4px',
                      height: '24px',
                      borderRadius: '0 4px 4px 0',
                      background: '#10b981',
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)',
                    }}
                  />
                )}

                <Avatar
                  name={conv.displayName || conv.username}
                  avatarUrl={conv.avatarId}
                  online={conv.online}
                  size="md"
                />

                {conv.unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '4px',
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: '9999px',
                      border: '2px solid #101624',
                    }}
                  >
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list-panel" style={{ width: '100%' }}>
      {/* Top Header */}
      <div className="chat-list-header">
        <h2 className="chat-list-title">Chats</h2>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenContacts();
          }}
          className="header-action-btn"
          title="Add Friend"
        >
          <UserPlus style={{ width: '18px', height: '18px' }} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="chat-search-box">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="search-input-field"
          />
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="conversations-scroll">
        {filteredConversations.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dark)' }}>
            <MessageSquare style={{ width: '36px', height: '36px', margin: '0 auto 12px', opacity: 0.3, color: '#10b981' }} />
            <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>No conversations yet</p>
            <button
              type="button"
              onClick={onOpenContacts}
              style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              + Add a friend to start
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = activeChat?.toLowerCase() === conv.username.toLowerCase();
            return (
              <div
                key={conv.username}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveChat(conv.username);
                }}
                className={`chat-list-item ${isSelected ? 'selected' : ''}`}
              >
                <Avatar
                  name={conv.displayName || conv.username}
                  avatarUrl={conv.avatarId}
                  online={conv.online}
                  size="md"
                />

                <div className="chat-item-info">
                  <div className="chat-item-top">
                    <span className="chat-item-name">{conv.displayName || conv.username}</span>
                    <span className="chat-item-time">
                      {formatLastSeen(conv.lastMessage?.timestamp || conv.lastSeenAt)}
                    </span>
                  </div>

                  <div className="chat-item-bottom">
                    <span className="chat-item-preview">
                      {conv.lastMessage ? (
                        conv.lastMessage.isVoice ? (
                          '🎤 Voice message'
                        ) : conv.lastMessage.attachment ? (
                          '📎 Attachment'
                        ) : (
                          conv.lastMessage.text
                        )
                      ) : (
                        'Tap to chat'
                      )}
                    </span>

                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
