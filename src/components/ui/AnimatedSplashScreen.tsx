import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { SplashScreen } from '@capacitor/splash-screen';

interface AnimatedSplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({
  onFinish,
  minDurationMs = 950,
}) => {
  const [isVisible, setIsVisible] = useState(() => {
    // Only show once per browser/app session
    try {
      if (sessionStorage.getItem('novyn_splash_shown')) {
        return false;
      }
      sessionStorage.setItem('novyn_splash_shown', '1');
      return true;
    } catch {
      return false;
    }
  });
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      if (onFinish) onFinish();
      return;
    }

    try {
      SplashScreen.hide().catch(() => {});
    } catch {}

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, minDurationMs);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, minDurationMs + 350);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [isVisible, minDurationMs, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#090d16',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1), transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Dynamic Background Glow Rings */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'splashPulse 2.4s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}
      />

      {/* Main Animated Icon Container */}
      <div
        style={{
          position: 'relative',
          width: '110px',
          height: '110px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'splashBounce 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {/* Outer Glass Card */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '28px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.7), 0 0 25px rgba(16, 185, 129, 0.25)',
            backdropFilter: 'blur(12px)',
          }}
        />

        {/* Custom App Icon (Mascot) */}
        <img
          src="/logo.png"
          alt="Novyn Logo"
          style={{
            width: '74px',
            height: '74px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 2,
            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
            animation: 'splashWiggle 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* App Name & Branding */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <h1
          style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            margin: '0 0 6px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a7f3d0 60%, #10b981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          NOVYN
        </h1>

        {/* Security Badge Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#10b981',
            fontSize: '0.74rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          <Lock style={{ width: '12px', height: '12px' }} />
          <span>End-to-End Encrypted</span>
        </div>
      </div>

      {/* Inline Keyframes for Splash Animations */}
      <style>{`
        @keyframes splashBounce {
          0% {
            opacity: 0;
            transform: scale(0.6) translateY(20px);
          }
          60% {
            opacity: 1;
            transform: scale(1.08) translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes splashWiggle {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-4deg) scale(1.03);
          }
          75% {
            transform: rotate(4deg) scale(1.03);
          }
        }
        @keyframes splashPulse {
          0% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
