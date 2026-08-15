import React from 'react';
import { useChat } from '../../context/ChatContext';
import { Avatar } from '../ui/Avatar';
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Trash2,
} from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

interface CallsPanelProps {
  isCompact?: boolean;
}

export const CallsPanel: React.FC<CallsPanelProps> = ({ isCompact = false }) => {
  const { startCall, callLogs, clearCallLogs } = useChat();

  const formatTimestamp = (ts: string | number) => {
    try {
      const d = new Date(ts);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return isToday ? time : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
    } catch {
      return '';
    }
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isCompact) {
    return (
      <div className="chat-list-panel" style={{ width: '100%', alignItems: 'center', padding: '14px 0' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
          <Phone style={{ width: '18px', height: '18px' }} />
        </div>

        <div className="conversations-scroll" style={{ width: '100%', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
          {callLogs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              onClick={() => {
                triggerHaptic('medium');
                startCall(log.partner, log.isVideo);
              }}
              style={{ position: 'relative', cursor: 'pointer', padding: '4px' }}
              title={`Call ${log.partnerDisplayName || log.partner}`}
            >
              <Avatar
                name={log.partnerDisplayName || log.partner}
                avatarUrl={log.partnerAvatarId}
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
      {/* Top Header */}
      <div className="chat-list-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Phone style={{ width: '18px', height: '18px' }} />
          </div>
          <div>
            <h2 className="chat-list-title" style={{ fontSize: '1.15rem' }}>Calls</h2>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>WebRTC HD Calling</span>
          </div>
        </div>

        {callLogs.length > 0 && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              clearCallLogs();
            }}
            className="header-action-btn"
            title="Clear Call History"
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* Main Scroll Stream - Recent Calls Only */}
      <div className="conversations-scroll" style={{ padding: '10px 14px' }}>
        {callLogs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                color: '#10b981',
              }}
            >
              <Phone style={{ width: '26px', height: '26px', opacity: 0.8 }} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              No Recent Calls
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
              Audio and video calls made or received will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {callLogs.map((log) => {
              const isMissed = log.type === 'missed';
              const isIncoming = log.type === 'incoming';

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <Avatar
                      name={log.partnerDisplayName || log.partner}
                      avatarUrl={log.partnerAvatarId}
                      size="md"
                    />

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: isMissed ? '#f87171' : '#ffffff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {log.partnerDisplayName || log.partner}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.72rem',
                          color: '#94a3b8',
                          marginTop: '3px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isMissed ? (
                          <PhoneMissed style={{ width: '13px', height: '13px', color: '#ef4444', flexShrink: 0 }} />
                        ) : isIncoming ? (
                          <PhoneIncoming style={{ width: '13px', height: '13px', color: '#34d399', flexShrink: 0 }} />
                        ) : (
                          <PhoneOutgoing style={{ width: '13px', height: '13px', color: '#38bdf8', flexShrink: 0 }} />
                        )}

                        <span style={{ color: isMissed ? '#ef4444' : '#cbd5e1' }}>
                          {isMissed ? 'Missed' : `${log.isVideo ? 'Video' : 'Audio'}${log.duration ? ` • ${formatDuration(log.duration)}` : ''}`}
                        </span>
                        <span>•</span>
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Redial Action */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      startCall(log.partner, log.isVideo);
                    }}
                    className="header-action-btn"
                    style={{ flexShrink: 0 }}
                    title={log.isVideo ? 'Redial Video Call' : 'Redial Audio Call'}
                  >
                    {log.isVideo ? (
                      <Video style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
                    ) : (
                      <Phone style={{ width: '16px', height: '16px', color: '#10b981' }} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
