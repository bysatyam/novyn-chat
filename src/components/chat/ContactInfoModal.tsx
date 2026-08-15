import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { Conversation } from '../../types';
import { Phone, Video, Bell, BellOff, Ban, UserMinus, Trash2, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

interface ContactInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Conversation | null;
  onAudioCall: (username: string) => void;
  onVideoCall: (username: string) => void;
  onToggleMute: (username: string, isMuted: boolean) => void;
  onToggleBlock: (username: string, isBlocked: boolean) => void;
  onUnfriend: (username: string) => void;
  onClearChat: (username: string) => void;
  isMuted?: boolean;
  isBlocked?: boolean;
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  isOpen,
  onClose,
  contact,
  onAudioCall,
  onVideoCall,
  onToggleMute,
  onToggleBlock,
  onUnfriend,
  onClearChat,
  isMuted = false,
  isBlocked = false,
}) => {
  const [showConfirmUnfriend, setShowConfirmUnfriend] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!contact) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contact Info" maxWidth="420px">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Big Avatar */}
        <div style={{ marginBottom: '14px' }}>
          <Avatar
            name={contact.displayName || contact.username}
            avatarUrl={contact.avatarId}
            online={contact.online}
            size="xl"
          />
        </div>

        {/* Name & Handle */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '2px' }}>
          {contact.displayName || contact.username}
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
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
            marginBottom: '20px',
          }}
        >
          {contact.online ? '● Online' : 'Offline'}
        </span>

        {/* Quick Call Actions */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onClose();
              onAudioCall(contact.username);
            }}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '10px', borderRadius: '12px', fontSize: '0.82rem' }}
          >
            <Phone style={{ width: '15px', height: '15px', color: '#34d399' }} /> Audio Call
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onClose();
              onVideoCall(contact.username);
            }}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '10px', borderRadius: '12px', fontSize: '0.82rem' }}
          >
            <Video style={{ width: '15px', height: '15px', color: '#38bdf8' }} /> Video Call
          </button>
        </div>

        {/* Settings & Danger List */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border)',
              color: '#ffffff',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isMuted ? (
                <BellOff style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
              ) : (
                <Bell style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
              )}
              <span>{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: isMuted ? '#f59e0b' : '#64748b', fontWeight: 600 }}>
              {isMuted ? 'Muted' : 'Off'}
            </span>
          </button>

          {/* Clear Chat */}
          {showConfirmClear ? (
            <div
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#f87171' }}>Clear all messages?</span>
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
                    onClose();
                  }}
                  style={{ background: '#ef4444', border: 'none', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Confirm Clear
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
                padding: '12px 16px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                color: '#ffffff',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Trash2 style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
              <span>Clear Chat History</span>
            </button>
          )}

          {/* Block / Unblock */}
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
              padding: '12px 16px',
              borderRadius: '14px',
              background: isBlocked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
              border: isBlocked ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border)',
              color: isBlocked ? '#f87171' : '#ffffff',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Ban style={{ width: '18px', height: '18px', color: isBlocked ? '#ef4444' : '#94a3b8' }} />
              <span>{isBlocked ? 'Unblock User' : 'Block User'}</span>
            </div>
            {isBlocked && <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444' }}>Blocked</span>}
          </button>

          {/* Unfriend */}
          {showConfirmUnfriend ? (
            <div
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: '#f87171' }}>Remove @{contact.username} from friends?</span>
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
                  Unfriend
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
                padding: '12px 16px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <UserMinus style={{ width: '18px', height: '18px', color: '#ef4444' }} />
              <span>Unfriend Contact</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
