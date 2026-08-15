import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, Flame, Heart, ThumbsUp, Laugh, PartyPopper } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

interface GifPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

const CATEGORIES = [
  { label: 'Trending', icon: Flame, query: 'trending' },
  { label: 'Reactions', icon: Sparkles, query: 'reaction' },
  { label: 'Laugh', icon: Laugh, query: 'funny laugh' },
  { label: 'Love', icon: Heart, query: 'love heart' },
  { label: 'Thumbs Up', icon: ThumbsUp, query: 'agree thumbs up' },
  { label: 'Party', icon: PartyPopper, query: 'celebrate dance' },
];

const CURATED_GIFS: Record<string, string[]> = {
  trending: [
    'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
    'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  ],
  reaction: [
    'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
    'https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif',
    'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif',
    'https://media.giphy.com/media/3o6Zt6KHxJTbXCnSvu/giphy.gif',
    'https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif',
  ],
  'funny laugh': [
    'https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif',
    'https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif',
    'https://media.giphy.com/media/26n6Gx9moCgs1qxxt/giphy.gif',
    'https://media.giphy.com/media/lOKbTE7h9Bq40/giphy.gif',
  ],
  'love heart': [
    'https://media.giphy.com/media/26FLdm964upIslUZ2/giphy.gif',
    'https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif',
    'https://media.giphy.com/media/l4pTdcifPZLpDjL1e/giphy.gif',
    'https://media.giphy.com/media/M90mJvfWfd5mbUuULX/giphy.gif',
  ],
  'agree thumbs up': [
    'https://media.giphy.com/media/111ebonMs90YLu/giphy.gif',
    'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    'https://media.giphy.com/media/mgqefOvJJVTNW/giphy.gif',
  ],
  'celebrate dance': [
    'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif',
    'https://media.giphy.com/media/l2JIdnF6aJcA83J9S/giphy.gif',
    'https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif',
  ],
};

export const GifPickerModal: React.FC<GifPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectGif,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [gifs, setGifs] = useState<string[]>(CURATED_GIFS.trending);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setGifs(CURATED_GIFS[activeCategory] || CURATED_GIFS.trending);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const apiKey = 'LIVDSRZULEUB'; // Public Tenor test key
        const res = await fetch(
          `https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=${apiKey}&limit=16`
        );
        if (res.ok) {
          const data = await res.json();
          const urls = data.results?.map((r: any) => r.media?.[0]?.gif?.url).filter(Boolean) || [];
          if (urls.length > 0) {
            setGifs(urls);
          } else {
            // Fallback to query match in curated
            const matches = Object.values(CURATED_GIFS).flat();
            setGifs(matches.slice(0, 8));
          }
        } else {
          // Fallback to query match in curated
          const matches = Object.values(CURATED_GIFS).flat();
          setGifs(matches.slice(0, 8));
        }
      } catch (err) {
        console.warn('GIF search error, using curated:', err);
        const matches = Object.values(CURATED_GIFS).flat();
        setGifs(matches.slice(0, 8));
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeCategory, isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
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
            maxWidth: '520px',
            maxHeight: '80vh',
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header & Search */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <Sparkles style={{ width: '15px', height: '15px' }} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Search GIFs & Memes
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '8px 14px',
              }}
            >
              <Search style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Tenor & Giphy..."
                autoFocus
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  width: '100%',
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              )}
            </div>

            {/* Category Pills */}
            {!query && (
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  marginTop: '12px',
                  paddingBottom: '4px',
                }}
              >
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.query;
                  return (
                    <button
                      key={cat.query}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setActiveCategory(cat.query);
                      }}
                      style={{
                        background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: isActive ? '#10b981' : '#94a3b8',
                        borderRadius: '9999px',
                        padding: '5px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon style={{ width: '12px', height: '12px' }} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* GIF Grid Stream */}
          <div
            style={{
              padding: '16px',
              overflowY: 'auto',
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '10px',
              maxHeight: '400px',
            }}
          >
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    border: '2px solid #10b981',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 8px',
                  }}
                />
                <span style={{ fontSize: '0.8rem' }}>Loading GIFs...</span>
              </div>
            ) : gifs.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: '#64748b' }}>
                No GIFs found for "{query}". Try a different keyword!
              </div>
            ) : (
              gifs.map((url, idx) => (
                <motion.div
                  key={`${url}-${idx}`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    triggerHaptic('medium');
                    onSelectGif(url);
                    onClose();
                  }}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.04)',
                    height: '110px',
                  }}
                >
                  <img
                    src={url}
                    alt="GIF"
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
