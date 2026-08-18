import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ShieldCheck,
  Zap,
  Mic,
  Video,
  Smartphone,
  ArrowRight,
  Sparkles,
  Radio,
  Globe,
  Laptop,
  CheckCircle2,
  X,
  BellRing,
  Download,
} from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

// Path to the APK served from the public/downloads/ folder.
// Replace with your deployed CDN/storage URL if you host it externally.
const APK_DOWNLOAD_URL = '/downloads/novyn.apk';
const APK_FILENAME = 'novyn.apk';

function triggerApkDownload() {
  triggerHaptic('medium');
  const a = document.createElement('a');
  a.href = APK_DOWNLOAD_URL;
  a.download = APK_FILENAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

interface LandingPageProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const [comingSoonPlatform, setComingSoonPlatform] = useState<{ name: string; type: string; icon: any } | null>(null);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);

  const handleOpenComingSoon = (platform: { name: string; type: string; icon: any }) => {
    triggerHaptic('medium');
    setComingSoonPlatform(platform);
    setNotifySuccess(false);
    setNotifyEmail('');
  };

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    triggerHaptic('success');
    setNotifySuccess(true);
    setTimeout(() => {
      setComingSoonPlatform(null);
      setNotifySuccess(false);
    }, 2500);
  };

  return (
    <div
      className="landing-page-root"
      style={{
        height: '100vh',
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'var(--bg-main)',
        position: 'relative',
        scrollBehavior: 'smooth',
      }}
    >
      {/* Top Navbar */}
      <nav
        className="landing-navbar"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--primary-glow)',
                flexShrink: 0,
              }}
            >
              <MessageSquare style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Novyn
            </span>
          </div>

          {/* Platform Navigation Menu (Hidden on Mobile) */}
          <div className="landing-platform-menu">
            {/* 1. Web */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border)',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
              }}
              onClick={() => {
                triggerHaptic('light');
                onOpenAuth('signin');
              }}
            >
              <Globe style={{ width: '15px', height: '15px', color: 'var(--primary)' }} />
              <span>Web</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--primary)',
                  background: 'var(--primary-glow)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  marginLeft: '2px',
                }}
              >
                LIVE
              </span>
            </div>

            {/* 2. App (Mobile) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#38bdf8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={triggerApkDownload}
            >
              <Smartphone style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
              <span>App</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  color: '#34d399',
                  background: 'rgba(52, 211, 153, 0.12)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  marginLeft: '2px',
                }}
              >
                APK
              </span>
            </div>

            {/* 3. Desktop */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() =>
                handleOpenComingSoon({
                  name: 'Novyn Desktop App',
                  type: 'Windows & macOS',
                  icon: Laptop,
                })
              }
            >
              <Laptop style={{ width: '15px', height: '15px', color: '#a855f7' }} />
              <span>Desktop</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  color: '#c084fc',
                  background: 'rgba(168, 85, 247, 0.12)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  marginLeft: '2px',
                }}
              >
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenAuth('signin');
            }}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.84rem', borderRadius: '10px' }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenAuth('signup');
            }}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.84rem', borderRadius: '10px' }}
          >
            Get Started <ArrowRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="hero-badge"
        >
          <Sparkles style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          <span>Universal Real-Time Communication</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hero-title font-display"
        >
          Seamless Chat across <br />
          <span className="text-gradient">Web & Mobile</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hero-subtitle"
        >
          Experience instant messaging with multi-session sync, voice waveforms, encrypted calling, and hardware haptics.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hero-cta-group"
        >
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenAuth('signup');
            }}
            className="btn btn-primary"
            style={{ borderRadius: '14px' }}
          >
            Start Chatting Now <ArrowRight style={{ width: '18px', height: '18px' }} />
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenAuth('signin');
            }}
            className="btn btn-secondary"
            style={{ borderRadius: '14px' }}
          >
            Sign In with Existing Account
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hero-pills"
        >
          <div className="hero-pill-item">
            <ShieldCheck style={{ width: '16px', height: '16px', color: 'var(--primary)', flexShrink: 0 }} />
            <span>End-to-End Encryption</span>
          </div>
          <div className="hero-pill-item">
            <Radio style={{ width: '16px', height: '16px', color: 'var(--primary)', flexShrink: 0 }} />
            <span>Ultra-low Latency WebSockets</span>
          </div>
          <div className="hero-pill-item">
            <Smartphone style={{ width: '16px', height: '16px', color: 'var(--primary)', flexShrink: 0 }} />
            <span>Native Android + Web</span>
          </div>
        </motion.div>

        {/* Live Chat Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mockup-container"
          style={{ marginBottom: '50px' }}
        >
          <div className="mockup-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="mockup-dots">
                <span className="mockup-dot" style={{ background: '#ef4444' }} />
                <span className="mockup-dot" style={{ background: '#f59e0b' }} />
                <span className="mockup-dot" style={{ background: '#10b981' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '8px', fontWeight: 600 }}>
                novyn.chat / preview
              </span>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontWeight: 700,
              }}
            >
              ● Connected
            </span>
          </div>

          <div className="mockup-messages">
            <div className="mockup-msg mockup-msg-in">
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>
                Alex
              </span>
              Hey! The new Novyn React + Capacitor build is super fast! 🚀 Have you tried the voice waveform notes yet?
              <span style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', textAlign: 'right', marginTop: '6px' }}>
                10:42 AM
              </span>
            </div>

            <div className="mockup-msg mockup-msg-out">
              Yes! It syncs in real-time across both my phone and browser with zero delay. Voice notes and video calling feel amazing! 🎙️
              <span style={{ display: 'block', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: '6px' }}>
                10:43 AM ✓✓
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="features-section" style={{ padding: '40px 24px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="features-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '10px' }}>
            Engineered for Speed, Privacy & Polish
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Everything you need for seamless communication across all your web and mobile devices.
          </p>
        </div>

        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Card 1 */}
          <div className="feature-card" style={{ padding: '28px', borderRadius: '22px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)' }}>
            <div className="feature-icon-box" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Zap style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Real-Time Sync
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Powered by WebSockets and persistent cloud state. Read receipts, unread badges, and live typing indicators update instantaneously.
            </p>
          </div>

          {/* Card 2 */}
          <div className="feature-card" style={{ padding: '28px', borderRadius: '22px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)' }}>
            <div className="feature-icon-box" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Mic style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Voice Notes & Waveforms
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Record voice messages with live visual audio waveforms, instant playback scrubbing, and secure audio storage.
            </p>
          </div>

          {/* Card 3 */}
          <div className="feature-card" style={{ padding: '28px', borderRadius: '22px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)' }}>
            <div className="feature-icon-box" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <Video style={{ width: '24px', height: '24px' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              P2P Audio & Video Calls
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
              Direct WebRTC peer-to-peer audio and video calling with camera switching, screen sharing, and real ringtone audio.
            </p>
          </div>
        </div>
      </section>

      {/* Platforms Grid Section */}
      <section style={{ padding: '20px 24px 70px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#94a3b8',
              marginBottom: '12px',
              letterSpacing: '0.04em',
            }}
          >
            AVAILABLE EVERYWHERE
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Choose Your Platform
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
          {/* 1. Web Client */}
          <div
            style={{
              padding: '28px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1.5px solid var(--border-focus)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 30px var(--primary-glow)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary-glow)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe style={{ width: '24px', height: '24px' }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-glow)', border: '1px solid var(--border-focus)', padding: '4px 10px', borderRadius: '9999px' }}>
                  ● LIVE NOW
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Novyn for Web
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.55, margin: '0 0 20px' }}>
                Instant zero-installation browser workspace. Connect from Chrome, Firefox, Safari, or Edge with seamless live sync.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenAuth('signup');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 700 }}
            >
              Launch Web App <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          {/* 2. Mobile App */}
          <div
            style={{
              padding: '28px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone style={{ width: '24px', height: '24px' }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '4px 10px', borderRadius: '9999px' }}>
                  ↓ DOWNLOAD
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Novyn for Mobile
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.55, margin: '0 0 20px' }}>
                Native Android APK with hardware haptics, push notifications, and background call ringing. Direct install — no Play Store needed.
              </p>
            </div>

            <button
              type="button"
              onClick={triggerApkDownload}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Download APK (Android)
            </button>
          </div>

          {/* 3. Desktop Client */}
          <div
            style={{
              padding: '28px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Laptop style={{ width: '24px', height: '24px' }} />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c084fc', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '4px 10px', borderRadius: '9999px' }}>
                  COMING SOON
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                Novyn for Desktop
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.55, margin: '0 0 20px' }}>
                Standalone Windows & macOS client with OS tray minimization, system shortcut binds, and auto-updates.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                handleOpenComingSoon({
                  name: 'Novyn Desktop App',
                  type: 'Windows & macOS',
                  icon: Laptop,
                })
              }
              className="btn btn-secondary"
              style={{ width: '100%', padding: '12px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 700, color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}
            >
              Get Notified (Desktop) <BellRing style={{ width: '15px', height: '15px' }} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--primary)', color: '#ffffff', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              N
            </div>
            <span style={{ fontWeight: 700, color: '#e2e8f0' }}>Novyn Chat</span>
          </div>
          <p>© 2026 Novyn. Built with React, TypeScript & Capacitor.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => onOpenAuth('signin')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              Sign In
            </button>
            <button onClick={() => onOpenAuth('signup')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              Sign Up
            </button>
          </div>
        </div>
      </footer>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {comingSoonPlatform && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setComingSoonPlatform(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                width: '100%',
                maxWidth: '460px',
                background: '#0d131f',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '24px',
                padding: '30px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setComingSoonPlatform(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)',
                  color: '#94a3b8',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <comingSoonPlatform.icon style={{ width: '32px', height: '32px' }} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
                  {comingSoonPlatform.name}
                </h3>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '10px' }}>
                  {comingSoonPlatform.type} • Private Beta
                </div>
                <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  We are putting the final touches on our dedicated standalone experience. Leave your email to be the first to test early access builds!
                </p>
              </div>

              {notifySuccess ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                  <span>You are on the early access VIP list! We will notify you once ready.</span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="email"
                    required
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="input-field"
                    style={{ height: '46px', fontSize: '0.9rem', borderRadius: '12px', paddingLeft: '14px' }}
                  />

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ height: '46px', borderRadius: '12px', fontSize: '0.92rem', fontWeight: 700 }}
                  >
                    Notify Me on Release 🚀
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
