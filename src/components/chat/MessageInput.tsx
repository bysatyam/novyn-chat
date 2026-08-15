import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, X, Smile, Sparkles, BarChart3, Image as ImageIcon, FileText } from 'lucide-react';
import { Message } from '../../types';
import { VoiceRecorder } from './VoiceRecorder';
import { GifPickerModal } from './GifPickerModal';
import { CreatePollModal } from './CreatePollModal';
import { uploadMediaFile } from '../../services/api';
import { triggerHaptic } from '../../services/capacitor';

interface MessageInputProps {
  onSendMessage: (text: string, options?: { attachment?: any; replyTo?: any; isVoice?: boolean }) => void;
  onTyping: (isTyping: boolean) => void;
  replyMessage: Message | null;
  onCancelReply: () => void;
  onCreatePoll?: (question: string, options: string[]) => void;
}

const EMOJI_LIST = ['😀', '😂', '😍', '🔥', '👍', '🎉', '❤️', '🙌', '✨', '🚀'];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  replyMessage,
  onCancelReply,
  onCreatePoll,
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showGifModal, setShowGifModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const typingTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const attachBtnRef = useRef<HTMLButtonElement>(null);

  // Close emoji picker and attach menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(target) &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(target)
      ) {
        setShowEmojiPicker(false);
      }

      if (
        showAttachMenu &&
        attachMenuRef.current &&
        !attachMenuRef.current.contains(target) &&
        attachBtnRef.current &&
        !attachBtnRef.current.contains(target)
      ) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showEmojiPicker, showAttachMenu]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSendMessage(trimmed, {
      replyTo: replyMessage
        ? {
            id: replyMessage.id,
            sender: replyMessage.sender,
            text: replyMessage.text,
            attachment: replyMessage.attachment,
          }
        : undefined,
    });

    setText('');
    onTyping(false);
    onCancelReply();
    setShowEmojiPicker(false);
    triggerHaptic('light');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    triggerHaptic('medium');

    const res = await uploadMediaFile(file);
    setIsUploading(false);

    if (res.ok && res.url) {
      const isImage = file.type.startsWith('image/');
      onSendMessage('', {
        attachment: {
          url: res.url,
          name: file.name,
          mime: file.type,
          size: file.size,
          kind: isImage ? 'image' : 'file',
        },
        replyTo: replyMessage ? { id: replyMessage.id, sender: replyMessage.sender, text: replyMessage.text } : undefined,
      });
      onCancelReply();
    } else {
      alert(res.error || 'Failed to upload attachment');
    }
  };

  const handleSendVoice = (voiceUrl: string) => {
    onSendMessage('', {
      attachment: {
        url: voiceUrl,
        name: 'voice.webm',
        mime: 'audio/webm',
        size: 1024 * 50,
        kind: 'audio',
      },
      isVoice: true,
    });
    setIsRecording(false);
  };

  if (isRecording) {
    return <VoiceRecorder onSendVoice={handleSendVoice} onCancel={() => setIsRecording(false)} />;
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Reply Banner */}
      {replyMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#161f30',
            border: '1px solid var(--border)',
            borderBottom: 'none',
            borderRadius: '16px 16px 0 0',
            padding: '8px 16px',
            fontSize: '0.78rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <span style={{ fontWeight: 700, color: '#10b981' }}>Replying to {replyMessage.sender}:</span>
            <span style={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {replyMessage.text || 'Attachment'}
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
          >
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup with smooth fade & outside click dismiss */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            ref={emojiPickerRef}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              marginBottom: '10px',
              left: '0',
              background: '#161f30',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '10px',
              display: 'flex',
              gap: '8px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
              zIndex: 30,
            }}
          >
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setText((prev) => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '2px' }}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attach Popup Menu */}
      <AnimatePresence>
        {showAttachMenu && (
          <motion.div
            ref={attachMenuRef}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              marginBottom: '10px',
              left: '8px',
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.65)',
              zIndex: 40,
              minWidth: '200px',
            }}
          >
            {/* Photos & Videos */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowAttachMenu(false);
                imageInputRef.current?.click();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '10px',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <ImageIcon style={{ width: '15px', height: '15px' }} />
              </div>
              <span>Photos & Videos</span>
            </button>

            {/* Document / File */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowAttachMenu(false);
                fileInputRef.current?.click();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '10px',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(96, 165, 250, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                <FileText style={{ width: '15px', height: '15px' }} />
              </div>
              <span>Document / File</span>
            </button>

            {/* Create Poll */}
            {onCreatePoll && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowAttachMenu(false);
                  setShowPollModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <BarChart3 style={{ width: '15px', height: '15px' }} />
                </div>
                <span>Create Poll</span>
              </button>
            )}

            {/* GIFs & Stickers */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowAttachMenu(false);
                setShowGifModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '10px',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                <Sparkles style={{ width: '15px', height: '15px' }} />
              </div>
              <span>GIFs & Stickers</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div
        className="input-bar-container"
        style={{ borderRadius: replyMessage ? '0 0 18px 18px' : '18px' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <div className="input-actions">
          <button
            ref={attachBtnRef}
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowAttachMenu((prev) => !prev);
            }}
            disabled={isUploading}
            className="input-action-btn"
            style={showAttachMenu ? { color: '#10b981', background: 'rgba(16, 185, 129, 0.15)' } : {}}
            title="Attach..."
          >
            <Paperclip style={{ width: '18px', height: '18px' }} />
          </button>

          <button
            ref={emojiBtnRef}
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="input-action-btn"
            style={showEmojiPicker ? { color: '#10b981', background: 'rgba(16, 185, 129, 0.15)' } : {}}
            title="Emoji"
          >
            <Smile style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          rows={1}
          className="message-textarea"
        />

        <div>
          {text.trim() ? (
            <button
              type="button"
              onClick={handleSend}
              className="send-btn"
            >
              <Send style={{ width: '16px', height: '16px' }} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRecording(true)}
              disabled={isUploading}
              className="input-action-btn"
              style={{ color: '#10b981' }}
              title="Voice Message"
            >
              <Mic style={{ width: '20px', height: '20px' }} />
            </button>
          )}
        </div>
      </div>

      <GifPickerModal
        isOpen={showGifModal}
        onClose={() => setShowGifModal(false)}
        onSelectGif={(url) => {
          onSendMessage('', {
            attachment: {
              url,
              name: 'GIF',
              kind: 'image',
              mime: 'image/gif',
            },
            replyTo: replyMessage
              ? {
                  id: replyMessage.id,
                  sender: replyMessage.sender,
                  text: replyMessage.text,
                  attachment: replyMessage.attachment,
                }
              : undefined,
          });
          onCancelReply();
        }}
      />

      {onCreatePoll && (
        <CreatePollModal
          isOpen={showPollModal}
          onClose={() => setShowPollModal(false)}
          onCreatePoll={(question, options) => {
            onCreatePoll(question, options);
          }}
        />
      )}
    </div>
  );
};
