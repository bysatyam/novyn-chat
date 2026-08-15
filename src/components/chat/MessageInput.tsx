import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Camera, X, Smile } from 'lucide-react';
import { Message } from '../../types';
import { VoiceRecorder } from './VoiceRecorder';
import { uploadMediaFile } from '../../services/api';
import { takeNativePhoto, triggerHaptic } from '../../services/capacitor';

interface MessageInputProps {
  onSendMessage: (text: string, options?: { attachment?: any; replyTo?: any; isVoice?: boolean }) => void;
  onTyping: (isTyping: boolean) => void;
  replyMessage: Message | null;
  onCancelReply: () => void;
}

const EMOJI_LIST = ['😀', '😂', '😍', '🔥', '👍', '🎉', '❤️', '🙌', '✨', '🚀'];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  replyMessage,
  onCancelReply,
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleNativeCamera = async () => {
    const photoUrl = await takeNativePhoto();
    if (photoUrl) {
      onSendMessage('', {
        attachment: {
          url: photoUrl,
          name: 'photo.jpg',
          mime: 'image/jpeg',
          size: 1024 * 500,
          kind: 'image',
        },
      });
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

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div
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
        </div>
      )}

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

        <div className="input-actions">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="input-action-btn"
            title="Attach File"
          >
            <Paperclip style={{ width: '18px', height: '18px' }} />
          </button>

          <button
            type="button"
            onClick={handleNativeCamera}
            className="input-action-btn"
            title="Camera"
          >
            <Camera style={{ width: '18px', height: '18px' }} />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="input-action-btn"
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
    </div>
  );
};
