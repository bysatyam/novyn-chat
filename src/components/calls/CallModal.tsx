import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Minimize2,
  Maximize2,
  Volume2,
} from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

export const CallModal: React.FC = () => {
  const {
    callState,
    answerCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  } = useChat();

  const [seconds, setSeconds] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Bind media streams to HTML5 video elements
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream, isMinimized, callState.isVideo]);

  useEffect(() => {
    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream, isMinimized, callState.isVideo]);

  // Duration Timer
  useEffect(() => {
    let timer: any;
    if (callState.status === 'connected') {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState.status]);

  if (!callState.isActive) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. Minimized Floating Call Tile (Picture-in-Picture on bottom right)
  if (isMinimized) {
    return (
      <motion.div
        drag
        dragConstraints={{ left: -300, right: 0, top: -500, bottom: 0 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 200,
          background: '#111827',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '20px',
          padding: '10px 16px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'grab',
        }}
      >
        <Avatar name={callState.remoteDisplayName || callState.remoteUser} size="sm" />

        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
            {callState.remoteDisplayName || callState.remoteUser}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontFamily: 'monospace' }}>
            {callState.status === 'connected' ? formatDuration(seconds) : 'Calling...'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={toggleMute}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: callState.isMuted ? '#ef4444' : 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {callState.isMuted ? <MicOff style={{ width: '14px', height: '14px' }} /> : <Mic style={{ width: '14px', height: '14px' }} />}
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Expand call"
          >
            <Maximize2 style={{ width: '14px', height: '14px' }} />
          </button>

          <button
            type="button"
            onClick={() => endCall()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#ef4444',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="End"
          >
            <PhoneOff style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </motion.div>
    );
  }

  // 2. Full-Screen Video Call Layout
  if (callState.isVideo && callState.status === 'connected') {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 150,
          background: '#030712',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Remote Full-Screen Video Feed */}
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          {callState.remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Avatar name={callState.remoteDisplayName || callState.remoteUser} size="xl" />
              <p style={{ color: '#94a3b8', marginTop: '16px' }}>Camera off / Connecting video...</p>
            </div>
          )}

          {/* Draggable Local Camera Picture-in-Picture (PIP) Tile */}
          <motion.div
            drag
            dragConstraints={{ left: -window.innerWidth + 200, right: 0, top: 0, bottom: window.innerHeight - 200 }}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '160px',
              height: '110px',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#111827',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              cursor: 'grab',
              zIndex: 10,
            }}
          >
            {callState.localStream && !callState.isCameraOff ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                <VideoOff style={{ width: '22px', height: '22px' }} />
              </div>
            )}
          </motion.div>

          {/* Top Bar Header with Minimize and Timer */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
              padding: '8px 16px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
              {callState.remoteDisplayName || callState.remoteUser}
            </span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>
              {formatDuration(seconds)}
            </span>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '6px' }}
              title="Minimize call"
            >
              <Minimize2 style={{ width: '15px', height: '15px' }} />
            </button>
          </div>

          {/* Bottom Floating Glass Controls */}
          <div
            style={{
              position: 'absolute',
              bottom: '32px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: 'rgba(17, 24, 39, 0.85)',
              backdropFilter: 'blur(16px)',
              padding: '12px 20px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            }}
          >
            {/* Mic Toggle */}
            <button
              type="button"
              onClick={toggleMute}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: callState.isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={callState.isMuted ? 'Unmute' : 'Mute'}
            >
              {callState.isMuted ? <MicOff style={{ width: '20px', height: '20px' }} /> : <Mic style={{ width: '20px', height: '20px' }} />}
            </button>

            {/* Camera Toggle */}
            <button
              type="button"
              onClick={toggleCamera}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: callState.isCameraOff ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={callState.isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {callState.isCameraOff ? <VideoOff style={{ width: '20px', height: '20px' }} /> : <Video style={{ width: '20px', height: '20px' }} />}
            </button>

            {/* Screen Share */}
            <button
              type="button"
              onClick={toggleScreenShare}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: callState.isScreenSharing ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Share Screen"
            >
              <Monitor style={{ width: '20px', height: '20px' }} />
            </button>

            {/* End Call */}
            <button
              type="button"
              onClick={() => endCall()}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#ef4444',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.5)',
              }}
              title="End Call"
            >
              <PhoneOff style={{ width: '22px', height: '22px' }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Audio Call & Incoming Call Glass Modal Card
  return (
    <AnimatePresence>
      <div
        className="modal-backdrop"
        style={{
          zIndex: 150,
          background: 'rgba(3, 7, 18, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: '380px',
            width: '90%',
            background: 'linear-gradient(180deg, #111827 0%, #0c121e 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '28px',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(16, 185, 129, 0.15)',
            padding: '36px 28px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Minimize button (when connected) */}
          {callState.status === 'connected' && (
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#94a3b8',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Minimize call"
            >
              <Minimize2 style={{ width: '15px', height: '15px' }} />
            </button>
          )}

          {/* Avatar with Animated Glowing Pulse Ring */}
          <div style={{ position: 'relative', marginBottom: '22px' }}>
            <Avatar name={callState.remoteDisplayName || callState.remoteUser} size="xl" />
            <span
              style={{
                position: 'absolute',
                inset: '-8px',
                borderRadius: '50%',
                border: '2px solid #10b981',
                animation: 'pulse 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
                pointerEvents: 'none',
                opacity: 0.6,
              }}
            />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            {callState.remoteDisplayName || callState.remoteUser}
          </h2>

          <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, marginBottom: '24px' }}>
            {callState.status === 'ringing' && (callState.isIncoming ? 'Incoming call...' : 'Ringing...')}
            {callState.status === 'calling' && 'Calling...'}
            {callState.status === 'connected' && (
              <span style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 700, fontSize: '1.05rem' }}>
                {formatDuration(seconds)}
              </span>
            )}
          </p>

          {/* Animated sound wave equalizer during audio call */}
          {callState.status === 'connected' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '24px', marginBottom: '28px' }}>
              {[12, 22, 16, 28, 14, 8, 24, 18, 10, 20, 15].map((h, i) => (
                <span
                  key={i}
                  style={{
                    width: '3.5px',
                    height: `${h}px`,
                    backgroundColor: '#10b981',
                    borderRadius: '9999px',
                    animation: 'pulse 0.9s infinite alternate',
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Controls */}
          {callState.isIncoming && callState.status === 'ringing' ? (
            /* Incoming Call Actions (Decline Red & Accept Green) */
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  endCall();
                }}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(239, 68, 68, 0.45)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                title="Decline Call"
              >
                <PhoneOff style={{ width: '26px', height: '26px' }} />
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('success');
                  answerCall();
                }}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(16, 185, 129, 0.45)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                title="Accept Call"
              >
                <Phone style={{ width: '26px', height: '26px' }} />
              </button>
            </div>
          ) : (
            /* Connected / Calling Action Controls */
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={toggleMute}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: callState.isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title={callState.isMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {callState.isMuted ? <MicOff style={{ width: '20px', height: '20px' }} /> : <Mic style={{ width: '20px', height: '20px' }} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  endCall();
                }}
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px rgba(239, 68, 68, 0.45)',
                }}
                title="End Call"
              >
                <PhoneOff style={{ width: '24px', height: '24px' }} />
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: callState.isCameraOff ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title={callState.isCameraOff ? 'Turn on Camera' : 'Turn off Camera'}
              >
                {callState.isCameraOff ? <VideoOff style={{ width: '20px', height: '20px' }} /> : <Video style={{ width: '20px', height: '20px' }} />}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
