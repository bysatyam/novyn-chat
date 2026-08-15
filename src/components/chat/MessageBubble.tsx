import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../../types';
import {
  Check,
  CheckCheck,
  FileText,
  CornerDownRight,
  MoreHorizontal,
  Edit2,
  Trash2,
  Reply,
  Heart,
} from 'lucide-react';
import { VoicePlayer } from './VoicePlayer';
import { triggerHaptic } from '../../services/capacitor';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReply: (message: Message) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onMediaClick: (url: string) => void;
  onUnsend?: (messageId: string) => void;
  onEdit?: (messageId: string, newText: string) => void;
}

const COMMON_REACTIONS = ['❤️', '👍', '😂', '🔥', '🎉', '😮'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  onReply,
  onReaction,
  onMediaClick,
  onUnsend,
  onEdit,
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const lastTapRef = useRef<number>(0);

  const formatTime = (ts: string | number) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderStatus = () => {
    if (!isMe) return null;
    if (message.status === 'seen') {
      return <CheckCheck style={{ width: '14px', height: '14px', color: '#67e8f9', display: 'inline' }} />;
    }
    if (message.status === 'delivered') {
      return <CheckCheck style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.7)', display: 'inline' }} />;
    }
    return <Check style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.5)', display: 'inline' }} />;
  };

  const isAudioMessage = Boolean(
    message.isVoice ||
      message.attachment?.kind === 'audio' ||
      message.attachment?.mime?.startsWith('audio/') ||
      message.attachment?.name?.endsWith('.webm') ||
      message.attachment?.name?.endsWith('.mp3') ||
      message.attachment?.name?.endsWith('.ogg') ||
      message.attachment?.name?.endsWith('.wav') ||
      message.attachment?.name?.endsWith('.m4a')
  );

  const audioUrl = message.attachment?.url;

  const handleDoubleClick = () => {
    triggerHaptic('medium');
    setShowReactions((prev) => !prev);
    setShowActionsMenu(false);
  };

  const handleTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      handleDoubleClick();
    }
    lastTapRef.current = now;
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === message.text) {
      setIsEditing(false);
      return;
    }
    onEdit?.(message.id, trimmed);
    setIsEditing(false);
    triggerHaptic('light');
  };

  return (
    <div
      className={`bubble-row ${isMe ? 'me' : 'other'}`}
      onMouseLeave={() => {
        setShowActionsMenu(false);
        setShowReactions(false);
      }}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px' }}
    >
      {/* 3-Dots Action Trigger Button on Left of 'Me' / Right of 'Other' */}
      {isMe && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('light');
            setShowActionsMenu((prev) => !prev);
            setShowReactions(false);
          }}
          className="msg-action-trigger"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Message actions (Reply, Edit, Unsend)"
        >
          <MoreHorizontal style={{ width: '16px', height: '16px' }} />
        </button>
      )}

      {/* Main Bubble Container */}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        onDoubleClick={handleDoubleClick}
        onTouchEnd={handleTouchEnd}
        className={`bubble ${isMe ? 'me' : 'other'}`}
        style={{ position: 'relative', cursor: 'default' }}
        title="Double-tap for emoji reactions"
      >
        {/* 1. Floating Double-Tap Emoji Reaction Bar */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 4 }}
              style={{
                position: 'absolute',
                top: '-42px',
                right: isMe ? '0' : 'auto',
                left: isMe ? 'auto' : '0',
                background: '#161f30',
                border: '1px solid var(--border)',
                borderRadius: '9999px',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                zIndex: 40,
              }}
            >
              {COMMON_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    onReaction(message.id, emoji);
                    setShowReactions(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.15rem',
                    cursor: 'pointer',
                    padding: '2px',
                    lineHeight: 1,
                    transition: 'transform 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.25)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Floating 3-Dots Action Dropdown Menu (Reply, Edit, Unsend) */}
        <AnimatePresence>
          {showActionsMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 4 }}
              style={{
                position: 'absolute',
                top: '-40px',
                right: isMe ? '0' : 'auto',
                left: isMe ? 'auto' : '0',
                background: '#161f30',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                zIndex: 40,
              }}
            >
              {/* Reply */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  onReply(message);
                  setShowActionsMenu(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
                title="Reply"
              >
                <Reply style={{ width: '13px', height: '13px', color: '#10b981' }} /> Reply
              </button>

              {/* Edit (if sent by me and is text) */}
              {isMe && message.text && !isAudioMessage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setShowActionsMenu(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                  title="Edit"
                >
                  <Edit2 style={{ width: '13px', height: '13px', color: '#38bdf8' }} /> Edit
                </button>
              )}

              {/* Unsend (if sent by me) */}
              {isMe && onUnsend && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('medium');
                    onUnsend(message.id);
                    setShowActionsMenu(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f87171',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                  title="Unsend for everyone"
                >
                  <Trash2 style={{ width: '13px', height: '13px' }} /> Unsend
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply Context Header */}
        {message.replyTo && (
          <div
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              borderLeft: isMe ? '3px solid rgba(255,255,255,0.8)' : '3px solid #10b981',
              background: 'rgba(0, 0, 0, 0.25)',
              fontSize: '0.75rem',
              marginBottom: '8px',
            }}
          >
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
              <CornerDownRight style={{ width: '12px', height: '12px' }} />
              {message.replyTo.sender}
            </div>
            <div style={{ opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {message.replyTo.text || 'Attachment'}
            </div>
          </div>
        )}

        {/* 1. Image Attachment */}
        {message.attachment && (message.attachment.kind === 'image' || message.attachment.mime?.startsWith('image/')) && (
          <div
            style={{ marginBottom: '8px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}
            onClick={() => onMediaClick(message.attachment!.url)}
          >
            <img
              src={message.attachment.url}
              alt={message.attachment.name}
              style={{ maxHeight: '240px', width: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
          </div>
        )}

        {/* 2. Built-in Voice Audio Player */}
        {isAudioMessage && audioUrl && (
          <VoicePlayer url={audioUrl} isMe={isMe} duration={message.voiceDuration} />
        )}

        {/* 3. Document / File Attachment (Non-audio) */}
        {!isAudioMessage && message.attachment && (message.attachment.kind === 'file' || !message.attachment.mime?.startsWith('image/')) && (
          <a
            href={message.attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.2)',
              textDecoration: 'none',
              color: '#ffffff',
              fontSize: '0.8rem',
              marginBottom: '6px',
            }}
          >
            <FileText style={{ width: '20px', height: '20px', color: '#34d399' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {message.attachment.name}
            </span>
          </a>
        )}

        {/* 4. Message Text / Inline Edit */}
        {isEditing ? (
          <div style={{ marginTop: '4px' }}>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '8px',
                padding: '6px 8px',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                marginBottom: '6px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ background: 'none', border: 'none', color: '#cbd5e1', fontSize: '0.72rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                style={{ background: '#10b981', border: 'none', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          message.text && (!isAudioMessage || message.text !== '[Voice Message]') && (
            <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{message.text}</div>
          )
        )}

        {/* Footer */}
        <div className="bubble-footer">
          <span>{formatTime(message.timestamp)}</span>
          {renderStatus()}
        </div>

        {/* Reaction Pill Badges */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
            {Object.entries(message.reactions).map(([emoji, users]) =>
              users.length > 0 ? (
                <span
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReaction(message.id, emoji);
                  }}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  {emoji} {users.length > 1 ? users.length : ''}
                </span>
              ) : null
            )}
          </div>
        )}
      </motion.div>

      {/* 3-Dots Action Trigger on Right of 'Other' message */}
      {!isMe && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('light');
            setShowActionsMenu((prev) => !prev);
            setShowReactions(false);
          }}
          className="msg-action-trigger"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Reply"
        >
          <MoreHorizontal style={{ width: '16px', height: '16px' }} />
        </button>
      )}
    </div>
  );
};
