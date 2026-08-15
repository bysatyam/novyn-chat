// Settings Preferences and Dynamic Theme & Typography Engine

export interface ThemeConfig {
  accent: string;
  accentHover: string;
  accentGlow: string;
  name: string;
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  emerald: {
    name: 'Emerald',
    accent: '#10b981',
    accentHover: '#059669',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
  },
  cyan: {
    name: 'Cyan',
    accent: '#06b6d4',
    accentHover: '#0891b2',
    accentGlow: 'rgba(6, 182, 212, 0.25)',
  },
  purple: {
    name: 'Purple',
    accent: '#8b5cf6',
    accentHover: '#7c3aed',
    accentGlow: 'rgba(139, 92, 246, 0.25)',
  },
  rose: {
    name: 'Rose',
    accent: '#f43f5e',
    accentHover: '#e11d48',
    accentGlow: 'rgba(244, 63, 94, 0.25)',
  },
  amber: {
    name: 'Amber',
    accent: '#f59e0b',
    accentHover: '#d97706',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
  },
  sapphire: {
    name: 'Sapphire',
    accent: '#3b82f6',
    accentHover: '#2563eb',
    accentGlow: 'rgba(59, 130, 246, 0.25)',
  },
};

export const WALLPAPER_PRESETS: Record<string, { name: string; background: string; description: string }> = {
  midnight: {
    name: 'Midnight OLED',
    background: '#070a11',
    description: 'Ultra-deep pure black background',
  },
  aurora: {
    name: 'Emerald Aurora',
    background: 'radial-gradient(ellipse at top right, rgba(16, 185, 129, 0.12) 0%, #070c14 70%)',
    description: 'Subtle emerald neon gradient',
  },
  cosmic: {
    name: 'Cosmic Nebula',
    background: 'radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.14) 0%, #070913 70%)',
    description: 'Deep violet space glow',
  },
  slate: {
    name: 'Slate Grid',
    background: '#0c1220',
    description: 'Polished studio dark slate',
  },
  cyber: {
    name: 'Cyberpunk Cyan',
    background: 'radial-gradient(ellipse at top right, rgba(6, 182, 212, 0.12) 0%, #050d18 70%)',
    description: 'High-tech cyan ambiance',
  },
  sunset: {
    name: 'Warm Sunset',
    background: 'radial-gradient(ellipse at top right, rgba(244, 63, 94, 0.12) 0%, #0c0812 70%)',
    description: 'Mellow rose twilight gradient',
  },
};

export interface FontOption {
  id: string;
  name: string;
  family: string;
  description: string;
}

export const FONT_PRESETS: FontOption[] = [
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', system-ui, sans-serif",
    description: 'Modern, crisp & balanced UI font',
  },
  {
    id: 'inter',
    name: 'Inter Display',
    family: "'Inter', -apple-system, system-ui, sans-serif",
    description: 'Neutral, clean & high-legibility tech font',
  },
  {
    id: 'outfit',
    name: 'Outfit Geometric',
    family: "'Outfit', system-ui, sans-serif",
    description: 'Contemporary, sleek & bold geometry',
  },
  {
    id: 'poppins',
    name: 'Poppins Friendly',
    family: "'Poppins', system-ui, sans-serif",
    description: 'Soft rounded geometric curves',
  },
  {
    id: 'fira-code',
    name: 'Fira Code Mono',
    family: "'Fira Code', monospace",
    description: 'Developer monospace aesthetic',
  },
];

export const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Nova',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Echo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Astra',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Zenith',
];

export function applyThemeAccent(key: string): void {
  const theme = THEME_PRESETS[key] || THEME_PRESETS.emerald;
  const root = document.documentElement;
  root.style.setProperty('--primary', theme.accent);
  root.style.setProperty('--primary-hover', theme.accentHover);
  root.style.setProperty('--primary-glow', theme.accentGlow);
  root.style.setProperty('--border-focus', theme.accent);
  localStorage.setItem('novyn_theme_accent', key);
}

export function applyWallpaper(key: string): void {
  const wp = WALLPAPER_PRESETS[key] || WALLPAPER_PRESETS.midnight;
  const root = document.documentElement;
  root.style.setProperty('--chat-wallpaper', wp.background);
  localStorage.setItem('novyn_wallpaper', key);
}

export function applyFontFamily(fontId: string): void {
  const font = FONT_PRESETS.find((f) => f.id === fontId) || FONT_PRESETS[0];
  const root = document.documentElement;
  root.style.setProperty('--app-font-family', font.family);
  localStorage.setItem('novyn_font_family', fontId);
}

export function applyFontSize(size: 'sm' | 'md' | 'lg'): void {
  const root = document.documentElement;
  const px = size === 'sm' ? '13.5px' : size === 'lg' ? '16.5px' : '15px';
  root.style.setProperty('--message-font-size', px);
  localStorage.setItem('novyn_font_size', size);
}

export function initializeUserPreferences(): void {
  try {
    const savedAccent = localStorage.getItem('novyn_theme_accent') || 'emerald';
    applyThemeAccent(savedAccent);

    const savedWallpaper = localStorage.getItem('novyn_wallpaper') || 'midnight';
    applyWallpaper(savedWallpaper);

    const savedFontFamily = localStorage.getItem('novyn_font_family') || 'plus-jakarta';
    applyFontFamily(savedFontFamily);

    const savedFontSize = (localStorage.getItem('novyn_font_size') as any) || 'md';
    applyFontSize(savedFontSize);
  } catch (err) {
    console.error('Failed to initialize preferences:', err);
  }
}

export {
  playMessageNotification as playMessageChime,
  playMessageSentSound,
} from './audioManager';
