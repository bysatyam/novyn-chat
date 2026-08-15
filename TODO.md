# Novyn Chat — Modern React + TypeScript (.tsx) & Capacitor Android

## [✅] 1. Modern Frontend Architecture (.tsx)
- React 19 + TypeScript + Vite build pipeline (`src/`)
- Strict type definitions (`src/types/index.ts`)
- REST API service with CSRF handling (`src/services/api.ts`)
- Socket.IO singleton manager (`src/services/socket.ts`)
- Firebase Web SDK Google Authentication (`src/services/firebase.ts`)
- Auth Context & Chat Context state management
- Tailwind v4 + OLED dark glassmorphism design system (`src/styles/index.css`)

## [✅] 2. Mobile & Responsive UI/UX Components
- Adaptive responsive layout (`AppLayout.tsx`)
- Native mobile bottom navigation (`BottomNav.tsx`)
- Desktop navigation sidebar (`Sidebar.tsx`)
- Framer Motion swipe-to-reply message bubbles with status checks & reactions (`MessageBubble.tsx`)
- Live audio waveform recorder (`VoiceRecorder.tsx`)
- Auto-resizing message input with attachments, camera & emojis (`MessageInput.tsx`)
- Searchable conversation list with unread counters (`ChatList.tsx`)
- Friends & pending requests manager (`ContactsModal.tsx`)
- WebRTC Audio & Video call overlay with controls (`CallModal.tsx`)
- Full-screen media viewer lightbox (`MediaViewerModal.tsx`)

## [✅] 3. Capacitor Native Mobile Bridge
- `@capacitor/haptics` integration on swipes, taps & notifications
- `@capacitor/camera` native photo capture
- `@capacitor/keyboard` mobile viewport adjustment
- `@capacitor/status-bar` dark theme sync
- Capacitor configuration set to bundle `dist/` (`capacitor.config.ts`)

## [✅] 4. Build & Verification
- `npm run build` bundles TypeScript/React app cleanly to `dist/`
- Node.js backend configured to serve `dist/` in production with SPA fallback
