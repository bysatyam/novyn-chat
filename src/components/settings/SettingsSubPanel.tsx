import React from 'react';
import {
  User,
  Shield,
  Bell,
  Palette,
  HardDrive,
  Lock,
  Ban,
  CheckCircle2,
  Smartphone,
  Sparkles,
  Volume2,
  Eye,
  Sliders,
  AtSign,
  Mail,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { SettingsMainCategory, SettingsSubSection } from './SettingsPanel';
import { triggerHaptic } from '../../services/capacitor';

interface SettingsSubPanelProps {
  activeCategory: SettingsMainCategory;
  activeSubSection: SettingsSubSection;
  onSelectSubSection: (sub: SettingsSubSection) => void;
  blockedCount: number;
}

export const SettingsSubPanel: React.FC<SettingsSubPanelProps> = ({
  activeCategory,
  activeSubSection,
  onSelectSubSection,
  blockedCount,
}) => {
  const metaByCategory: Record<SettingsMainCategory, { title: string; subtitle: string; icon: any; color: string }> = {
    profile: {
      title: 'Profile Settings',
      subtitle: 'Identity & Presence',
      icon: User,
      color: '#10b981',
    },
    privacy: {
      title: 'Security Options',
      subtitle: 'Safety & Credentials',
      icon: Shield,
      color: '#a855f7',
    },
    notifications: {
      title: 'Notification Alerts',
      subtitle: 'Sounds & Popups',
      icon: Bell,
      color: '#38bdf8',
    },
    appearance: {
      title: 'Appearance & UI',
      subtitle: 'Themes & Wallpapers',
      icon: Palette,
      color: '#f59e0b',
    },
    storage: {
      title: 'Data & Security',
      subtitle: 'Storage & Encryption',
      icon: HardDrive,
      color: '#ec4899',
    },
  };

  const sectionsByCategory: Record<
    SettingsMainCategory,
    { id: SettingsSubSection; label: string; icon: any; desc: string; badge?: string | number }[]
  > = {
    profile: [
      {
        id: 'profile-details',
        label: 'Profile Details & Bio',
        desc: 'Edit name, avatar & status',
        icon: User,
      },
      {
        id: 'profile-username',
        label: 'Change Username',
        desc: 'Update unique @handle',
        icon: AtSign,
      },
      {
        id: 'profile-email',
        label: 'Linked Email',
        desc: 'Account email & verification',
        icon: Mail,
      },
      {
        id: 'profile-presence',
        label: 'Presence & Status',
        desc: 'Active, Away, or DND mode',
        icon: Sparkles,
      },
    ],
    privacy: [
      {
        id: 'privacy-blocked',
        label: 'Blocked Contacts',
        desc: 'Manage blocked user list',
        icon: Ban,
        badge: blockedCount > 0 ? blockedCount : undefined,
      },
      {
        id: 'privacy-password',
        label: 'Change Password',
        desc: 'Update your account password',
        icon: Lock,
      },
      {
        id: 'privacy-receipts',
        label: 'Read Receipts & Activity',
        desc: 'Seen indicators and typing status',
        icon: CheckCircle2,
      },
      {
        id: 'privacy-sessions',
        label: 'Active Sessions',
        desc: 'Connected devices & status',
        icon: Smartphone,
      },
      {
        id: 'privacy-linked-devices',
        label: 'Linked Devices',
        desc: 'QR code multi-device sync',
        icon: Smartphone,
        badge: 'Coming Soon',
      },
      {
        id: 'privacy-danger',
        label: 'Account Actions',
        desc: 'Log out all sessions & safety',
        icon: AlertTriangle,
      },
    ],
    notifications: [
      {
        id: 'notif-sounds',
        label: 'Message Chimes',
        desc: 'Sound for incoming texts',
        icon: Volume2,
      },
      {
        id: 'notif-calls',
        label: 'Call Ringtones',
        desc: 'Melody during audio/video calls',
        icon: Smartphone,
      },
      {
        id: 'notif-previews',
        label: 'Message Previews',
        desc: 'Show text snippets in toasts',
        icon: Eye,
      },
    ],
    appearance: [
      {
        id: 'appear-theme',
        label: 'Theme Accent Colors',
        desc: 'Emerald, Cyan, Purple, Rose, Amber',
        icon: Palette,
      },
      {
        id: 'appear-wallpaper',
        label: 'Chat Wallpapers',
        desc: 'Background patterns & mesh tints',
        icon: Sparkles,
      },
      {
        id: 'appear-font',
        label: 'Typography & Size',
        desc: 'Adjust chat bubble text sizing',
        icon: Sliders,
      },
    ],
    storage: [
      {
        id: 'storage-cache',
        label: 'Cache & Media Storage',
        desc: 'Voice notes & temporary files',
        icon: HardDrive,
      },
      {
        id: 'storage-export',
        label: 'Backup & Restore',
        desc: 'Export & import JSON archives',
        icon: Download,
      },
      {
        id: 'storage-security',
        label: 'Encryption Status',
        desc: 'WebRTC P2P & TLS security',
        icon: Shield,
      },
    ],
  };

  const currentMeta = metaByCategory[activeCategory];
  const HeaderIcon = currentMeta.icon;
  const list = sectionsByCategory[activeCategory] || [];

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 100%)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        className="chat-list-header"
        style={{
          padding: '0 22px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: `${currentMeta.color}1a`,
              color: currentMeta.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${currentMeta.color}33`,
            }}
          >
            <HeaderIcon style={{ width: '17px', height: '17px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {currentMeta.title}
            </h3>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{currentMeta.subtitle}</span>
          </div>
        </div>
      </div>

      {/* Sub-item Cards List */}
      <div className="conversations-scroll" style={{ padding: '16px 18px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {list.map((item) => {
            const Icon = item.icon;
            const isSelected = activeSubSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onSelectSubSection(item.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  border: isSelected ? '1px solid var(--border-focus)' : '1px solid rgba(255, 255, 255, 0.05)',
                  background: isSelected
                    ? 'linear-gradient(135deg, var(--primary-glow) 0%, rgba(255, 255, 255, 0.02) 100%)'
                    : 'rgba(255, 255, 255, 0.02)',
                  boxShadow: isSelected ? '0 4px 16px var(--primary-glow)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isSelected ? 'var(--primary-glow)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? 'var(--primary)' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: isSelected ? '1px solid var(--border-focus)' : '1px solid transparent',
                  }}
                >
                  <Icon style={{ width: '17px', height: '17px' }} />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                      {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span
                        style={{
                          fontSize: typeof item.badge === 'string' ? '0.65rem' : '0.7rem',
                          fontWeight: 700,
                          padding: typeof item.badge === 'string' ? '2px 7px' : '2px 8px',
                          borderRadius: '10px',
                          background: typeof item.badge === 'string' ? 'rgba(6, 182, 212, 0.15)' : '#ef4444',
                          color: typeof item.badge === 'string' ? '#22d3ee' : '#ffffff',
                          border: typeof item.badge === 'string' ? '1px solid rgba(6, 182, 212, 0.35)' : 'none',
                          boxShadow: typeof item.badge === 'string' ? '0 0 10px rgba(6, 182, 212, 0.2)' : '0 0 10px rgba(239, 68, 68, 0.4)',
                          letterSpacing: typeof item.badge === 'string' ? '0.02em' : 'normal',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.35 }}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
