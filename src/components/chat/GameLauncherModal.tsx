import React from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Swords, Disc } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { GameType } from '../../types';
import { triggerHaptic } from '../../services/capacitor';

interface GameLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchGame: (gameType: GameType) => void;
  opponentName?: string;
  isGroup?: boolean;
}

interface GameOption {
  type: GameType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  gradient: string;
  borderHover: string;
}

export const GameLauncherModal: React.FC<GameLauncherModalProps> = ({
  isOpen,
  onClose,
  onLaunchGame,
  opponentName,
  isGroup,
}) => {
  const games: GameOption[] = [
    {
      type: 'tictactoe',
      title: 'Tic-Tac-Toe',
      subtitle: 'Classic 3x3 grid duel with glowing X & O neon markers.',
      icon: <Grid3X3 style={{ width: '28px', height: '28px', color: '#10b981' }} />,
      badge: '2 Players',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 78, 59, 0.2))',
      borderHover: 'rgba(16, 185, 129, 0.4)',
    },
    {
      type: 'rps',
      title: 'Rock • Paper • Scissors',
      subtitle: 'Simultaneous secret pick battle. Reveal showdown when both play!',
      icon: <Swords style={{ width: '28px', height: '28px', color: '#f59e0b' }} />,
      badge: 'Fast Duel',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(120, 53, 15, 0.2))',
      borderHover: 'rgba(245, 158, 11, 0.4)',
    },
    {
      type: 'connect4',
      title: 'Connect 4',
      subtitle: '7x6 vertical drop board. Line up 4 glowing chips to win!',
      icon: <Disc style={{ width: '28px', height: '28px', color: '#38bdf8' }} />,
      badge: 'Strategy',
      gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(12, 74, 110, 0.2))',
      borderHover: 'rgba(56, 189, 248, 0.4)',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="In-Chat Mini Games">
      <div style={{ padding: '6px 0 10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-dark)' }}>
          {isGroup
            ? 'Challenge anyone in this group to a quick game directly in the chat feed.'
            : `Challenge @${opponentName || 'friend'} to an instant multiplayer game!`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {games.map((g) => (
            <motion.div
              key={g.type}
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => {
                triggerHaptic('medium');
                onLaunchGame(g.type);
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '16px',
                background: g.gradient,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = g.borderHover;
                e.currentTarget.style.boxShadow = `0 8px 24px ${g.borderHover.replace('0.4', '0.15')}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {g.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>{g.title}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    {g.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.35 }}>
                  {g.subtitle}
                </div>
              </div>

              <button
                type="button"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Play
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
