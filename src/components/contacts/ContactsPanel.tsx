import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import { Users, UserPlus, UserCheck, Search, MessageSquare, Phone, Video, Check, X, Plus } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';
import { CreateGroupModal } from '../chat/CreateGroupModal';

interface ContactsPanelProps {
  isCompact?: boolean;
}

export const ContactsPanel: React.FC<ContactsPanelProps> = ({ isCompact = false }) => {
  const {
    conversations,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    setActiveChat,
    startCall,
  } = useChat();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'requests' | 'add'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const filteredFriends = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.displayName && c.displayName.toLowerCase().includes(q)) ||
      c.username.toLowerCase().includes(q)
    );
  });

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = targetUsername.trim();
    if (!target) return;

    setLoading(true);
    setStatusMessage(null);

    const res = await sendFriendRequest(target);
    setLoading(false);

    if (res.ok) {
      triggerHaptic('success');
      setStatusMessage({ text: 'Friend request sent successfully!' });
      setTargetUsername('');
    } else {
      triggerHaptic('error');
      setStatusMessage({ text: res.message || 'Could not send friend request', error: true });
    }
  };

  if (isCompact) {
    return (
      <div className="chat-list-panel" style={{ width: '100%', alignItems: 'center', padding: '14px 0' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
          <Users style={{ width: '18px', height: '18px' }} />
        </div>

        <div className="conversations-scroll" style={{ width: '100%', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
          {conversations.map((friend) => (
            <div
              key={friend.username}
              onClick={() => {
                triggerHaptic('light');
                setActiveChat(friend.username);
              }}
              style={{ position: 'relative', cursor: 'pointer', padding: '4px' }}
              title={`Chat with ${friend.displayName || friend.username}`}
            >
              <Avatar
                name={friend.displayName || friend.username}
                avatarUrl={friend.avatarId}
                online={friend.online}
                size="md"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-list-panel" style={{ width: '100%' }}>
      {/* Header */}
      <div className="chat-list-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <Users style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h2 className="chat-list-title" style={{ fontSize: '1.2rem' }}>Contacts</h2>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {conversations.length} {conversations.length === 1 ? 'Friend' : 'Friends'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsGroupModalOpen(true);
            }}
            className="header-action-btn"
            title="Create New Group"
          >
            <Plus style={{ width: '18px', height: '18px', color: '#10b981' }} />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveSubTab(activeSubTab === 'add' ? 'all' : 'add');
              setStatusMessage(null);
            }}
            className="header-action-btn"
            style={activeSubTab === 'add' ? { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' } : {}}
            title={activeSubTab === 'add' ? 'View Friends' : 'Add Friend'}
          >
            <UserPlus style={{ width: '18px', height: '18px' }} />
          </button>
        </div>
      </div>

      {/* Sub-Tabs: All Friends | Requests (badge) | Add New */}
      <div style={{ padding: '0 20px 14px' }}>
        <div className="tab-switcher" style={{ marginBottom: '0' }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveSubTab('all');
            }}
            className={`tab-btn ${activeSubTab === 'all' ? 'active' : ''}`}
            style={{ fontSize: '0.8rem', padding: '8px' }}
          >
            Friends ({conversations.length})
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveSubTab('requests');
            }}
            className={`tab-btn ${activeSubTab === 'requests' ? 'active' : ''}`}
            style={{ fontSize: '0.8rem', padding: '8px', position: 'relative' }}
          >
            Requests
            {friendRequests.length > 0 && (
              <span
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  marginLeft: '6px',
                }}
              >
                {friendRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setActiveSubTab('add');
              setStatusMessage(null);
            }}
            className={`tab-btn ${activeSubTab === 'add' ? 'active' : ''}`}
            style={{ fontSize: '0.8rem', padding: '8px' }}
          >
            + Add
          </button>
        </div>
      </div>

      {/* 1. All Friends View */}
      {activeSubTab === 'all' && (
        <>
          <div className="chat-search-box">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="search-input-field"
              />
            </div>
          </div>

          <div className="conversations-scroll" style={{ padding: '0 16px 16px' }}>
            {filteredFriends.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                <Users style={{ width: '36px', height: '36px', margin: '0 auto 12px', opacity: 0.3, color: '#10b981' }} />
                <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>No contacts found</p>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('add')}
                  style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  + Add a new friend
                </button>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div
                  key={friend.username}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid var(--border)',
                    marginBottom: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveChat(friend.username);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                  >
                    <Avatar
                      name={friend.displayName || friend.username}
                      avatarUrl={friend.avatarId}
                      online={friend.online}
                      size="md"
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {friend.displayName || friend.username}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: friend.online ? '#10b981' : '#64748b', fontWeight: friend.online ? 600 : 400 }}>
                        {friend.online ? '● Online' : 'Offline'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveChat(friend.username);
                      }}
                      className="header-action-btn"
                      style={{ width: '32px', height: '32px' }}
                      title="Send Message"
                    >
                      <MessageSquare style={{ width: '15px', height: '15px' }} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        startCall(friend.username, false);
                      }}
                      className="header-action-btn"
                      style={{ width: '32px', height: '32px' }}
                      title="Audio Call"
                    >
                      <Phone style={{ width: '15px', height: '15px' }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* 2. Friend Requests View */}
      {activeSubTab === 'requests' && (
        <div className="conversations-scroll" style={{ padding: '0 16px 16px' }}>
          {friendRequests.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
              <UserCheck style={{ width: '36px', height: '36px', margin: '0 auto 12px', opacity: 0.3, color: '#10b981' }} />
              <p style={{ fontSize: '0.85rem' }}>No pending friend requests</p>
            </div>
          ) : (
            friendRequests.map((req) => (
              <div
                key={req.from}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.035)',
                  border: '1px solid var(--border)',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={req.displayName || req.from} size="sm" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                      {req.displayName || req.from}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>wants to connect</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('success');
                      acceptFriendRequest(req.from);
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#10b981',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Accept"
                  >
                    <Check style={{ width: '16px', height: '16px' }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      rejectFriendRequest(req.from);
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Decline"
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. Add Friend Form View */}
      {activeSubTab === 'add' && (
        <div style={{ padding: '0 20px 20px', flex: 1, overflowY: 'auto' }}>
          <form onSubmit={handleSendRequest}>
            <div className="input-wrapper" style={{ marginBottom: '14px' }}>
              <label className="input-label">Enter Username or Email</label>
              <input
                type="text"
                required
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                placeholder="e.g. satyampandey or user@gmail.com"
                className="input-field"
                style={{ paddingLeft: '16px' }}
              />
            </div>

            {statusMessage && (
              <div
                className={statusMessage.error ? 'alert-error' : ''}
                style={
                  !statusMessage.error
                    ? {
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        marginBottom: '16px',
                      }
                    : { marginBottom: '16px' }
                }
              >
                {statusMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '12px' }}
            >
              {loading ? (
                <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>
                  <UserPlus style={{ width: '16px', height: '16px' }} /> Send Friend Request
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
              💡 Quick Connect
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
              You can search for people by their exact Novyn username or Google email address. Once accepted, you can immediately start encrypted text chats, voice notes, and video calls.
            </p>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
    </div>
  );
};
