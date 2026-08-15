import React from 'react';
import { motion } from 'framer-motion';
import { Poll } from '../../types';
import { BarChart3, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

interface PollMessageBubbleProps {
  poll: Poll;
  messageId: string;
  isMe: boolean;
  currentUsername?: string;
  onVote: (messageId: string, optionId: string) => void;
}

export const PollMessageBubble: React.FC<PollMessageBubbleProps> = ({
  poll,
  messageId,
  isMe,
  currentUsername = '',
  onVote,
}) => {
  const userKey = currentUsername.toLowerCase();
  const total = poll.totalVotes || 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '280px',
        maxWidth: '340px',
        padding: '6px 2px',
        userSelect: 'none',
      }}
    >
      {/* Poll Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '8px',
            background: isMe ? 'rgba(255, 255, 255, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isMe ? '#ffffff' : '#10b981',
          }}
        >
          <BarChart3 style={{ width: '15px', height: '15px' }} />
        </div>
        <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3 }}>
          {poll.question}
        </div>
      </div>

      {/* Options List with Live Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {poll.options.map((opt) => {
          const voteCount = opt.votes.length;
          const percentage = total > 0 ? Math.round((voteCount / total) * 100) : 0;
          const hasVoted = opt.votes.some((u) => u.toLowerCase() === userKey);

          return (
            <motion.div
              key={opt.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                triggerHaptic('light');
                onVote(messageId, opt.id);
              }}
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                background: hasVoted
                  ? 'rgba(16, 185, 129, 0.18)'
                  : isMe
                  ? 'rgba(0, 0, 0, 0.22)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: hasVoted
                  ? '1.5px solid #10b981'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 14px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
            >
              {/* Background Animated Fill Percentage Bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: `${percentage}%`,
                  background: hasVoted
                    ? 'rgba(16, 185, 129, 0.28)'
                    : isMe
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'rgba(255, 255, 255, 0.08)',
                  transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 0,
                }}
              />

              {/* Foreground Label & Stats */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  zIndex: 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {hasVoted && (
                    <CheckCircle2 style={{ width: '15px', height: '15px', color: '#10b981', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>
                    {opt.text}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: hasVoted ? '#10b981' : 'rgba(255, 255, 255, 0.7)',
                    fontFamily: 'monospace',
                  }}
                >
                  {total > 0 ? `${percentage}% (${voteCount})` : '0 votes'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)' }}>
        <span>{total} {total === 1 ? 'vote' : 'votes'} total</span>
        <span>Tap option to vote / change</span>
      </div>
    </div>
  );
};
