import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Check, X, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

export interface WallpaperPreset {
  id: string;
  name: string;
  background: string;
  preview: string;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'default',
    name: 'Classic Dark',
    background: 'var(--bg-canvas)',
    preview: 'linear-gradient(135deg, #0b0f19 0%, #111827 100%)',
  },
  {
    id: 'galaxy',
    name: 'Midnight Galaxy',
    background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #090a16 100%)',
    preview: 'radial-gradient(ellipse at top, #312e81 0%, #090a16 100%)',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    background: 'linear-gradient(135deg, #180d2b 0%, #090d16 50%, #170d1e 100%)',
    preview: 'linear-gradient(135deg, #701a75 0%, #0f172a 100%)',
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    background: 'linear-gradient(135deg, #062828 0%, #0b1120 60%, #170d2b 100%)',
    preview: 'linear-gradient(135deg, #065f46 0%, #1e1b4b 100%)',
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    background: 'radial-gradient(circle at center, #062319 0%, #040e0b 100%)',
    preview: 'radial-gradient(circle at center, #047857 0%, #022c22 100%)',
  },
  {
    id: 'obsidian',
    name: 'Sunset Obsidian',
    background: 'linear-gradient(135deg, #2b130e 0%, #0f172a 100%)',
    preview: 'linear-gradient(135deg, #9a3412 0%, #0f172a 100%)',
  },
];

interface WallpaperPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWallpaper: string;
  onSelectWallpaper: (bg: string) => void;
}

export const WallpaperPickerModal: React.FC<WallpaperPickerModalProps> = ({
  isOpen,
  onClose,
  currentWallpaper,
  onSelectWallpaper,
}) => {
  const [customUrl, setCustomUrl] = useState('');

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    if (!customUrl.trim()) return;
    triggerHaptic('success');
    const bg = `url("${customUrl.trim()}") center/cover no-repeat`;
    onSelectWallpaper(bg);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '16px',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          style={{
            width: '100%',
            maxWidth: '460px',
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(236, 72, 153, 0.15)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ec4899',
                }}
              >
                <Sparkles style={{ width: '18px', height: '18px' }} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Chat Wallpaper & Theme
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>

          {/* Presets Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {WALLPAPER_PRESETS.map((preset) => {
              const isSelected = currentWallpaper === preset.background;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectWallpaper(preset.background);
                  }}
                  style={{
                    height: '80px',
                    borderRadius: '14px',
                    background: preset.preview,
                    border: `2px solid ${isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                    boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.4)' : 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '8px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {preset.name}
                  </span>
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                      }}
                    >
                      <Check style={{ width: '12px', height: '12px' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom Image URL Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
              OR PASTE CUSTOM IMAGE URL
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleApplyCustom}
                disabled={!customUrl.trim()}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: '#10b981',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: customUrl.trim() ? 1 : 0.5,
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
