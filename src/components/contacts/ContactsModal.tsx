import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { UserPlus, Check, X, Users, UserCheck } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({ isOpen, onClose }) => {
  const {
    conversations,
    friendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    setActiveChat,
  } = useChat();

  const [activeTab, setActiveTab] = useState<'add' | 'requests' | 'friends'>('add');
  const [targetUsername, setTargetUsername] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = targetUsername.trim();
    if (!target) return;

    setLoading(true);
    setStatusMessage(null);

    const res = await sendFriendRequest(target);
    setLoading(false);

    if (res.ok) {
      setStatusMessage({ text: 'Friend request sent successfully!' });
      setTargetUsername('');
    } else {
      setStatusMessage({ text: res.message || 'Could not send friend request', error: true });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contacts & Friends">
      {/* Tabs */}
      <div className="tab-switcher" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('add');
            setStatusMessage(null);
          }}
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <UserPlus style={{ width: '15px', height: '15px' }} /> Add
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('requests');
            setStatusMessage(null);
          }}
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', position: 'relative' }}
        >
          <UserCheck style={{ width: '15px', height: '15px' }} /> Requests
          {friendRequests.length > 0 && (
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#ef4444',
                position: 'absolute',
                top: '6px',
                right: '8px',
              }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('friends');
            setStatusMessage(null);
          }}
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Users style={{ width: '15px', height: '15px' }} /> Friends ({conversations.length})
        </button>
      </div>

      {/* 1. Add Friend Tab */}
      {activeTab === 'add' && (
        <form onSubmit={handleSendRequest}>
          <div className="input-wrapper">
            <label className="input-label">Enter Username or Email</label>
            <input
              type="text"
              required
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              placeholder="e.g. bob or bob@example.com"
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
                  : {}
              }
            >
              {statusMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
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
      )}

      {/* 2. Pending Requests Tab */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
          {friendRequests.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
              No pending friend requests.
            </p>
          ) : (
            friendRequests.map((req) => (
              <div
                key={req.from}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={req.displayName || req.from} size="sm" />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                      {req.displayName || req.from}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dark)' }}>wants to connect</div>
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

      {/* 3. All Friends Tab */}
      {activeTab === 'friends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
              No friends added yet.
            </p>
          ) : (
            conversations.map((friend) => (
              <div
                key={friend.username}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveChat(friend.username);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar
                    name={friend.displayName || friend.username}
                    avatarUrl={friend.avatarId}
                    online={friend.online}
                    size="sm"
                  />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                      {friend.displayName || friend.username}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: friend.online ? '#10b981' : '#64748b' }}>
                      {friend.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>Chat →</span>
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
};
