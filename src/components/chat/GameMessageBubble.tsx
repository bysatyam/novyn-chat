import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameData, GameType } from '../../types';
import { Swords, RotateCcw, Trophy, Sparkles, User, Users } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

interface GameMessageBubbleProps {
  game: GameData;
  messageId: string;
  isMe: boolean;
  currentUsername?: string;
  onMove: (messageId: string, moveData: any) => void;
  onRematch?: (messageId: string) => void;
}

export const GameMessageBubble: React.FC<GameMessageBubbleProps> = ({
  game,
  messageId,
  isMe,
  currentUsername = '',
  onMove,
  onRematch,
}) => {
  const { gameType, state, turn, winner, data, createdBy, opponent } = game;

  // Helpers
  const isMyTurn = state === 'in_progress' && turn === currentUsername;
  const isParticipant =
    currentUsername === createdBy ||
    (opponent && currentUsername === opponent) ||
    currentUsername === data.playerX ||
    currentUsername === data.playerO ||
    currentUsername === data.player1 ||
    currentUsername === data.player2;

  // ----------------------------------------------------
  // 1. TIC-TAC-TOE LOGIC & RENDER
  // ----------------------------------------------------
  const handleTicTacToeCellClick = (index: number) => {
    if (state === 'finished') return;
    const board = [...(data.board || Array(9).fill(null))];
    if (board[index]) return; // already occupied

    // Determine players
    let pX = data.playerX || createdBy;
    let pO = data.playerO || (currentUsername !== pX ? currentUsername : opponent || '');

    // Joining as player O if open
    if (!data.playerO && currentUsername !== pX) {
      pO = currentUsername;
    }

    const currentSymbol = currentUsername === pX ? 'X' : currentUsername === pO ? 'O' : null;
    if (!currentSymbol) return; // not allowed to move

    // Check turn
    if (turn && turn !== currentUsername) {
      triggerHaptic('light');
      return;
    }

    board[index] = currentSymbol;
    const movesCount = (data.movesCount || 0) + 1;

    // Check winning line
    const winLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6],           // diags
    ];

    let winningLine: number[] | undefined;
    let gameWinner: string | 'draw' | undefined;
    let newState: 'in_progress' | 'finished' = 'in_progress';

    for (const line of winLines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        winningLine = line;
        gameWinner = board[a] === 'X' ? pX : pO;
        newState = 'finished';
        break;
      }
    }

    if (!gameWinner && board.every((c) => c !== null)) {
      gameWinner = 'draw';
      newState = 'finished';
    }

    const nextTurn = currentSymbol === 'X' ? pO : pX;

    triggerHaptic('medium');
    onMove(messageId, {
      board,
      playerX: pX,
      playerO: pO,
      turn: nextTurn,
      state: newState,
      winner: gameWinner,
      winningLine,
      movesCount,
    });
  };

  const renderTicTacToe = () => {
    const board = data.board || Array(9).fill(null);
    const winningLine = data.winningLine || [];
    const pX = data.playerX || createdBy;
    const pO = data.playerO || opponent || 'Waiting...';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        {/* Player Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>✕</span>
            <span>@{pX === currentUsername ? 'You' : pX}</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>vs</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#38bdf8' }}>
            <span>@{pO === currentUsername ? 'You' : pO}</span>
            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>◯</span>
          </div>
        </div>

        {/* 3x3 Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '8px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '200px',
            height: '200px',
          }}
        >
          {board.map((cell, idx) => {
            const isWinningCell = winningLine.includes(idx);
            const isClickable = !cell && state !== 'finished' && (turn === currentUsername || !data.playerO);

            return (
              <motion.button
                key={idx}
                type="button"
                whileTap={isClickable ? { scale: 0.9 } : undefined}
                whileHover={isClickable ? { scale: 1.05 } : undefined}
                onClick={() => handleTicTacToeCellClick(idx)}
                style={{
                  background: isWinningCell
                    ? cell === 'X'
                      ? 'rgba(16, 185, 129, 0.35)'
                      : 'rgba(56, 189, 248, 0.35)'
                    : cell
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isWinningCell
                    ? cell === 'X'
                      ? '1.5px solid #10b981'
                      : '1.5px solid #38bdf8'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: cell === 'X' ? '#10b981' : cell === 'O' ? '#38bdf8' : 'transparent',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'background 0.15s ease',
                  padding: 0,
                }}
              >
                {cell === 'X' ? '✕' : cell === 'O' ? '◯' : ''}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // 2. ROCK • PAPER • SCISSORS LOGIC & RENDER
  // ----------------------------------------------------
  const handleRPSPick = (move: 'rock' | 'paper' | 'scissors') => {
    if (state === 'finished') return;

    let p1 = data.player1 || createdBy;
    let p2 = data.player2 || (currentUsername !== p1 ? currentUsername : opponent || '');

    // Assign second player if open
    if (!data.player2 && currentUsername !== p1) {
      p2 = currentUsername;
    }

    let p1Move = data.p1Move;
    let p2Move = data.p2Move;

    if (currentUsername === p1) {
      p1Move = move;
    } else if (currentUsername === p2) {
      p2Move = move;
    } else {
      // Third party user joining as player 2
      p2 = currentUsername;
      p2Move = move;
    }

    let gameWinner: string | 'draw' | undefined;
    let newState: 'in_progress' | 'finished' = 'in_progress';

    // If both players have picked, calculate outcome
    if (p1Move && p2Move) {
      newState = 'finished';
      if (p1Move === p2Move) {
        gameWinner = 'draw';
      } else if (
        (p1Move === 'rock' && p2Move === 'scissors') ||
        (p1Move === 'paper' && p2Move === 'rock') ||
        (p1Move === 'scissors' && p2Move === 'paper')
      ) {
        gameWinner = p1;
      } else {
        gameWinner = p2;
      }
    }

    triggerHaptic('medium');
    onMove(messageId, {
      player1: p1,
      player2: p2,
      p1Move,
      p2Move,
      state: newState,
      winner: gameWinner,
    });
  };

  const renderRPS = () => {
    const p1 = data.player1 || createdBy;
    const p2 = data.player2 || opponent || 'Opponent';
    const isP1 = currentUsername === p1;
    const isP2 = currentUsername === p2;
    const myMove = isP1 ? data.p1Move : isP2 ? data.p2Move : undefined;
    const bothPicked = Boolean(data.p1Move && data.p2Move);

    const emojiMap: Record<string, string> = {
      rock: '🪨',
      paper: '📄',
      scissors: '✂️',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {/* Reveal Card or Choice Pickers */}
        {bothPicked ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              width: '210px',
              padding: '16px 12px',
              borderRadius: '16px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Player 1 Choice */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '2.4rem' }}>{emojiMap[data.p1Move!]}</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                @{p1 === currentUsername ? 'You' : p1}
              </span>
            </div>

            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#f59e0b' }}>VS</span>

            {/* Player 2 Choice */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '2.4rem' }}>{emojiMap[data.p2Move!]}</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                @{p2 === currentUsername ? 'You' : p2}
              </span>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#cbd5e1', fontWeight: 600 }}>
              {myMove ? 'Choice locked! Waiting for opponent...' : 'Secretly tap your choice:'}
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              {(['rock', 'paper', 'scissors'] as const).map((choice) => {
                const isSelected = myMove === choice;
                return (
                  <motion.button
                    key={choice}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRPSPick(choice)}
                    disabled={Boolean(myMove)}
                    style={{
                      background: isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(0, 0, 0, 0.35)',
                      border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '14px',
                      padding: '10px 14px',
                      fontSize: '1.8rem',
                      cursor: myMove ? 'default' : 'pointer',
                      opacity: myMove && !isSelected ? 0.4 : 1,
                      transition: 'border-color 0.15s ease, background 0.15s ease',
                    }}
                  >
                    {emojiMap[choice]}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // 3. CONNECT 4 LOGIC & RENDER
  // ----------------------------------------------------
  const handleConnect4ColClick = (col: number) => {
    if (state === 'finished') return;
    const board = [...(data.board || Array(42).fill(null))]; // 6 rows x 7 cols
    let pR = data.player1 || createdBy;
    let pY = data.player2 || (currentUsername !== pR ? currentUsername : opponent || '');

    if (!data.player2 && currentUsername !== pR) {
      pY = currentUsername;
    }

    const currentChip = currentUsername === pR ? 'R' : currentUsername === pY ? 'Y' : null;
    if (!currentChip) return;
    if (turn && turn !== currentUsername) {
      triggerHaptic('light');
      return;
    }

    // Find lowest empty slot in column
    let targetRow = -1;
    for (let row = 5; row >= 0; row--) {
      const idx = row * 7 + col;
      if (!board[idx]) {
        targetRow = row;
        break;
      }
    }

    if (targetRow === -1) return; // Column full!

    const placedIdx = targetRow * 7 + col;
    board[placedIdx] = currentChip;

    // Check 4-in-a-row
    const checkLine = (r: number, c: number, dr: number, dc: number) => {
      const line: number[] = [];
      for (let i = 0; i < 4; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;
        if (nr < 0 || nr >= 6 || nc < 0 || nc >= 7) return null;
        const nIdx = nr * 7 + nc;
        if (board[nIdx] !== currentChip) return null;
        line.push(nIdx);
      }
      return line;
    };

    let winningLine: number[] | undefined;
    let gameWinner: string | 'draw' | undefined;
    let newState: 'in_progress' | 'finished' = 'in_progress';

    // Scan all cells
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const h = checkLine(r, c, 0, 1);
        const v = checkLine(r, c, 1, 0);
        const d1 = checkLine(r, c, 1, 1);
        const d2 = checkLine(r, c, 1, -1);
        const win = h || v || d1 || d2;
        if (win) {
          winningLine = win;
          gameWinner = currentChip === 'R' ? pR : pY;
          newState = 'finished';
          break;
        }
      }
      if (winningLine) break;
    }

    if (!gameWinner && board.every((c) => c !== null)) {
      gameWinner = 'draw';
      newState = 'finished';
    }

    const nextTurn = currentChip === 'R' ? pY : pR;

    triggerHaptic('medium');
    onMove(messageId, {
      board,
      player1: pR,
      player2: pY,
      turn: nextTurn,
      state: newState,
      winner: gameWinner,
      winningLine,
    });
  };

  const renderConnect4 = () => {
    const board = data.board || Array(42).fill(null);
    const winningLine = data.winningLine || [];
    const pR = data.player1 || createdBy;
    const pY = data.player2 || opponent || 'Waiting...';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <span>@{pR === currentUsername ? 'You' : pR}</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '0.7rem' }}>vs</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#facc15' }}>
            <span>@{pY === currentUsername ? 'You' : pY}</span>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#facc15' }} />
          </div>
        </div>

        {/* 7x6 Drop Board */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            background: '#0f172a',
            padding: '6px',
            borderRadius: '12px',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          }}
        >
          {board.map((chip, idx) => {
            const isWinning = winningLine.includes(idx);
            const col = idx % 7;

            return (
              <motion.button
                key={idx}
                type="button"
                whileTap={state !== 'finished' ? { scale: 0.9 } : undefined}
                onClick={() => handleConnect4ColClick(col)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background:
                    chip === 'R'
                      ? '#ef4444'
                      : chip === 'Y'
                      ? '#facc15'
                      : 'rgba(255, 255, 255, 0.08)',
                  border: isWinning
                    ? '2px solid #ffffff'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isWinning
                    ? '0 0 10px #ffffff'
                    : chip
                    ? 'inset 0 -2px 4px rgba(0,0,0,0.4)'
                    : 'none',
                  cursor: state !== 'finished' ? 'pointer' : 'default',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // STATUS BANNER & REMATCH BUTTON
  // ----------------------------------------------------
  const renderBanner = () => {
    if (state === 'finished') {
      if (winner === 'draw') {
        return (
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🤝 Game Draw!
          </div>
        );
      }
      const isWinnerMe = winner === currentUsername;
      return (
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isWinnerMe ? '#10b981' : '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Trophy style={{ width: '14px', height: '14px' }} />
          <span>{isWinnerMe ? 'You Won! 🎉' : `@${winner} Won!`}</span>
        </div>
      );
    }

    if (isMyTurn) {
      return (
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles style={{ width: '13px', height: '13px' }} />
          <span>Your turn!</span>
        </div>
      );
    }

    return (
      <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
        Waiting for @{turn === currentUsername ? 'you' : turn || 'opponent'}...
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 6px 4px',
        minWidth: '220px',
      }}
    >
      {/* Game Title Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, color: '#ffffff' }}>
          <Swords style={{ width: '15px', height: '15px', color: '#10b981' }} />
          <span>{game.title}</span>
        </div>
        {renderBanner()}
      </div>

      {/* Main Game Board */}
      {gameType === 'tictactoe' && renderTicTacToe()}
      {gameType === 'rps' && renderRPS()}
      {gameType === 'connect4' && renderConnect4()}

      {/* Rematch button if finished */}
      {state === 'finished' && onRematch && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            triggerHaptic('medium');
            onRematch(messageId);
          }}
          style={{
            marginTop: '4px',
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1px solid #10b981',
            color: '#10b981',
            borderRadius: '9999px',
            padding: '5px 14px',
            fontSize: '0.76rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <RotateCcw style={{ width: '12px', height: '12px' }} />
          <span>Play Again</span>
        </motion.button>
      )}
    </div>
  );
};
