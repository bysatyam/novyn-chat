import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Trash2, Send } from 'lucide-react';
import { uploadVoiceBlob } from '../../services/api';
import { triggerHaptic } from '../../services/capacitor';

interface VoiceRecorderProps {
  onSendVoice: (voiceUrl: string, duration: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoice, onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let timer: any;
    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
        triggerHaptic('medium');

        timer = setInterval(() => {
          setSeconds((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error('Microphone access denied:', err);
        onCancel();
      }
    }

    startRecording();

    return () => {
      if (timer) clearInterval(timer);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onCancel]);

  const handleStopAndSend = async () => {
    if (!mediaRecorderRef.current) return;
    setIsUploading(true);
    triggerHaptic('light');

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());

      const res = await uploadVoiceBlob(audioBlob);
      if (res.ok && res.url) {
        onSendVoice(res.url, seconds);
      } else {
        alert(res.error || 'Failed to upload voice recording');
        onCancel();
      }
    };

    mediaRecorderRef.current.stop();
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    triggerHaptic('light');
    onCancel();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        background: '#101624',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '9999px',
        padding: '6px 12px 6px 16px',
        boxSizing: 'border-box',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Live recording status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
          }}
        >
          <Mic style={{ width: '16px', height: '16px' }} />
          <span
            style={{
              position: 'absolute',
              inset: '-3px',
              borderRadius: '50%',
              border: '2px solid #ef4444',
              animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
              pointerEvents: 'none',
              opacity: 0.7,
            }}
          />
        </div>

        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          {formatTime(seconds)}
        </span>

        {/* Dynamic soundwave animated bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3.5px', height: '22px' }}>
          {[14, 20, 10, 24, 16, 8, 22, 12, 18, 14, 22, 10].map((height, i) => (
            <span
              key={i}
              style={{
                width: '3px',
                height: `${height}px`,
                backgroundColor: '#10b981',
                borderRadius: '9999px',
                animation: 'pulse 0.9s infinite alternate',
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Action buttons (Trash Cancel & Send) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isUploading}
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)')}
          title="Cancel recording"
        >
          <Trash2 style={{ width: '17px', height: '17px' }} />
        </button>

        <button
          type="button"
          onClick={handleStopAndSend}
          disabled={isUploading}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.45)',
            transition: 'all 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="Send voice note"
        >
          {isUploading ? (
            <span style={{ width: '18px', height: '18px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <Send style={{ width: '17px', height: '17px', marginLeft: '2px' }} />
          )}
        </button>
      </div>
    </motion.div>
  );
};
