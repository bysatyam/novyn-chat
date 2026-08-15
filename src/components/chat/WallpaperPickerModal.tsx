import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Check, X, Sparkles, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';
import { uploadMediaFile } from '../../services/api';

export interface WallpaperPreset {
  id: string;
  name: string;
  background: string;
  preview: string;
}

// Doodle SVG patterns encoded as CSS background SVGs
const WHATSAPP_DOODLE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="20" cy="20" r="8"/><path d="M50 15h16v16H50z"/><path d="M15 55l10-10 10 10-10 10z"/><circle cx="60" cy="60" r="4"/><path d="M55 45l10 10m0-10l-10 10"/><path d="M10 35c5 0 5 10 10 10s5-10 10-10"/></svg>`;
const COSMIC_DOODLE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.2"><circle cx="45" cy="45" r="12"/><ellipse cx="45" cy="45" rx="22" ry="6" transform="rotate(-25 45 45)"/><circle cx="15" cy="20" r="2" fill="rgba(255,255,255,0.15)"/><circle cx="75" cy="70" r="1.5" fill="rgba(255,255,255,0.15)"/><path d="M20 70l4-4m-4 0l4 4"/><polygon points="70,20 72,25 77,25 73,28 75,33 70,30 65,33 67,28 63,25 68,25"/></svg>`;
const TECH_DOODLE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="rgba(16,185,129,0.12)" stroke-width="1.5"><rect x="10" y="10" width="16" height="16" rx="2"/><circle cx="45" cy="20" r="6"/><path d="M26 18h13"/><path d="M18 26v15h20"/><circle cx="40" cy="45" r="4"/><path d="M45 26v10"/></svg>`;
const GEOMETRIC_DOODLE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70" fill="none" stroke="rgba(96,165,250,0.12)" stroke-width="1.4"><polygon points="35,10 60,50 10,50"/><circle cx="35" cy="35" r="8"/><path d="M35 10v40"/></svg>`;
const RETRO_ARCADE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75" fill="none" stroke="rgba(236,72,153,0.12)" stroke-width="1.5"><rect x="15" y="15" width="20" height="14" rx="3"/><circle cx="55" cy="22" r="5"/><path d="M15 50h45"/><path d="M25 40v20m25-20v20"/></svg>`;

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'default',
    name: 'Classic Dark',
    background: 'var(--bg-canvas)',
    preview: '#0b0f19',
  },
  {
    id: 'whatsapp_doodle',
    name: 'Chat Doodles',
    background: `#0b1120 url("${WHATSAPP_DOODLE_SVG}") repeat`,
    preview: `#0b1120 url("${WHATSAPP_DOODLE_SVG}") repeat`,
  },
  {
    id: 'cosmic_doodle',
    name: 'Cosmic Galaxy',
    background: `#0f172a url("${COSMIC_DOODLE_SVG}") repeat`,
    preview: `#0f172a url("${COSMIC_DOODLE_SVG}") repeat`,
  },
  {
    id: 'emerald_tech',
    name: 'Matrix Circuit',
    background: `#021f17 url("${TECH_DOODLE_SVG}") repeat`,
    preview: `#021f17 url("${TECH_DOODLE_SVG}") repeat`,
  },
  {
    id: 'cyber_geometric',
    name: 'Neon Geometry',
    background: `#170b24 url("${GEOMETRIC_DOODLE_SVG}") repeat`,
    preview: `#170b24 url("${GEOMETRIC_DOODLE_SVG}") repeat`,
  },
  {
    id: 'retro_arcade',
    name: 'Retro Arcade',
    background: `#1e081f url("${RETRO_ARCADE_SVG}") repeat`,
    preview: `#1e081f url("${RETRO_ARCADE_SVG}") repeat`,
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
  const [isResolving, setIsResolving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleApplyUrl = async () => {
    const raw = customUrl.trim();
    if (!raw) return;

    setIsResolving(true);
    triggerHaptic('light');

    try {
      // If user pasted a webpage (like Pinterest/Imgur/etc.), resolve actual image from preview API
      let resolvedUrl = raw;
      if (!raw.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i)) {
        try {
          const res = await fetch(`/api/link-preview?url=${encodeURIComponent(raw)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.image) {
              resolvedUrl = data.image;
            }
          }
        } catch (_) {}
      }

      const bg = `url("${resolvedUrl}") center/cover no-repeat`;
      onSelectWallpaper(bg);
      setCustomUrl('');
      triggerHaptic('success');
      onClose();
    } catch (_) {
      const bg = `url("${raw}") center/cover no-repeat`;
      onSelectWallpaper(bg);
      onClose();
    } finally {
      setIsResolving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    triggerHaptic('medium');

    try {
      const res = await uploadMediaFile(file);
      if (res?.url) {
        const bg = `url("${res.url}") center/cover no-repeat`;
        onSelectWallpaper(bg);
        triggerHaptic('success');
        onClose();
      }
    } catch (err) {
      console.error('Wallpaper upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.16 }}
          style={{
            width: '100%',
            maxWidth: '480px',
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
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
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Chat Wallpaper & Theme
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Syncs in real-time across both participants
                </span>
              </div>
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
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>
              DOODLE & ILLUSTRATED PATTERNS
            </label>
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
                      height: '84px',
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
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
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
          </div>

          {/* Custom Upload or URL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8' }}>
              CUSTOM WALLPAPER (DEVICE UPLOAD OR LINK)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.15s ease',
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload style={{ width: '16px', height: '16px', color: '#10b981' }} /> Upload from Device
                  </>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Or paste image/pinterest link..."
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!customUrl.trim() || isResolving}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: '#10b981',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: customUrl.trim() && !isResolving ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isResolving ? (
                  <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>
                    <LinkIcon style={{ width: '14px', height: '14px' }} /> Apply
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
