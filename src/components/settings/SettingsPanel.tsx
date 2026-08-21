import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import {
  User,
  Shield,
  Bell,
  Palette,
  HardDrive,
  LogOut,
  ChevronRight,
  Settings,
  MessageSquarePlus,
} from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

export type SettingsMainCategory = 'profile' | 'privacy' | 'notifications' | 'appearance' | 'storage' | 'feedback';
export type SettingsSubSection =
  // Profile
  | 'profile-details'
  | 'profile-username'
  | 'profile-email'
  | 'profile-presence'
  // Privacy
  | 'privacy-blocked'
  | 'privacy-password'
  | 'privacy-receipts'
  | 'privacy-sessions'
  | 'privacy-linked-devices'
  | 'privacy-danger'
  // Notifications
  | 'notif-sounds'
  | 'notif-calls'
  | 'notif-previews'
  // Appearance
  | 'appear-theme'
  | 'appear-wallpaper'
  | 'appear-font'
  // Storage
  | 'storage-cache'
  | 'storage-export'
  | 'storage-security'
  // Feedback
  | 'feedback-send'
  | 'feedback-bug'
  | 'feedback-feature';

interface SettingsPanelProps {
  activeCategory: SettingsMainCategory;
  onSelectCategory: (category: SettingsMainCategory, defaultSub: SettingsSubSection) => void;
  isCompact?: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  activeCategory,
  onSelectCategory,
  isCompact = false,
}) => {
  const { user, logout } = useAuth();

  const categories = [
    {
      id: 'profile' as const,
      defaultSub: 'profile-details' as const,
      label: 'Profile & Account',
      description: 'Display name, username & bio',
      icon: User,
      color: '#10b981',
    },
    {
      id: 'privacy' as const,
      defaultSub: 'privacy-blocked' as const,
      label: 'Privacy & Security',
      description: 'Blocked list, password & danger zone',
      icon: Shield,
      color: '#a855f7',
    },
    {
      id: 'notifications' as const,
      defaultSub: 'notif-sounds' as const,
      label: 'Notifications',
      description: 'Sounds, ringtones & previews',
      icon: Bell,
      color: '#38bdf8',
    },
    {
      id: 'appearance' as const,
      defaultSub: 'appear-theme' as const,
      label: 'Appearance',
      description: 'Themes, wallpapers & font sizes',
      icon: Palette,
      color: '#f59e0b',
    },
    {
      id: 'storage' as const,
      defaultSub: 'storage-cache' as const,
      label: 'Storage & Data',
      description: 'Cache, export & encryption info',
      icon: HardDrive,
      color: '#ec4899',
    },
    {
      id: 'feedback' as const,
      defaultSub: 'feedback-send' as const,
      label: 'Feedback',
      description: 'Suggestions, bugs & feature requests',
      icon: MessageSquarePlus,
      color: '#06b6d4',
    },
  ];

  if (isCompact) {
    return (
      <div className="chat-list-panel" style={{ width: '100%', alignItems: 'center', padding: '14px 0', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '16px' }}>
            <Settings style={{ width: '18px', height: '18px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectCategory(cat.id, cat.defaultSub);
                  }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: isSelected ? '1.5px solid #10b981' : '1px solid transparent',
                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#10b981' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title={cat.label}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('heavy');
            logout();
          }}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginTop: '16px',
          }}
          title="Sign Out"
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    );
  }

  return (
    <div className="chat-list-panel" style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, overflow: 'hidden' }}>
        {/* Header */}
        <div className="chat-list-header" style={{ padding: '0 16px', height: '64px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Settings style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <h2 className="chat-list-title" style={{ fontSize: '1.15rem' }}>Settings</h2>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Preferences & Account</span>
            </div>
          </div>
        </div>

        {/* User Profile Mini Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '12px 14px',
            padding: '12px 14px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.015) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Avatar
            name={user?.displayName || user?.username || 'You'}
            avatarUrl={user?.avatarId || (user?.username ? localStorage.getItem(`novyn_avatar_${user.username}`) || undefined : undefined)}
            size="md"
            online={true}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.displayName || user?.username}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>@{user?.username}</div>
          </div>
        </div>

        {/* Categories List */}
        <div className="conversations-scroll" style={{ padding: '4px 10px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onSelectCategory(cat.id, cat.defaultSub);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: isSelected ? '1px solid var(--border-focus)' : '1px solid transparent',
                    background: isSelected
                      ? 'linear-gradient(135deg, var(--primary-glow) 0%, rgba(255, 255, 255, 0.02) 100%)'
                      : 'transparent',
                    boxShadow: isSelected ? '0 4px 16px var(--primary-glow)' : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    width: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '11px',
                        background: isSelected ? 'var(--primary-glow)' : `${cat.color}1a`,
                        color: isSelected ? 'var(--primary)' : cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: isSelected ? '1px solid var(--border-focus)' : `1px solid ${cat.color}33`,
                      }}
                    >
                      <Icon style={{ width: '18px', height: '18px' }} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#ffffff' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight style={{ width: '16px', height: '16px', color: isSelected ? 'var(--primary)' : '#64748b', flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sign Out Action */}
      <div style={{ padding: '14px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('heavy');
            logout();
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.04) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} /> Sign Out
        </button>
      </div>
    </div>
  );
};
