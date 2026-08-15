import React from 'react';
import { MessageSquare, Phone, Compass, Users, Settings } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { triggerHaptic } from '../../services/capacitor';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { friendRequests, activeChat } = useChat();

  if (activeChat) return null;

  return (
    <nav className="mobile-bottom-nav">
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          onSelectTab('chats');
        }}
        className={`nav-tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
      >
        <MessageSquare style={{ width: '20px', height: '20px' }} />
        <span>Chats</span>
      </button>

      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          onSelectTab('calls');
        }}
        className={`nav-tab-btn ${activeTab === 'calls' ? 'active' : ''}`}
      >
        <Phone style={{ width: '20px', height: '20px' }} />
        <span>Calls</span>
      </button>

      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          onSelectTab('discover');
        }}
        className={`nav-tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
      >
        <Compass style={{ width: '20px', height: '20px' }} />
        <span>Discover</span>
      </button>

      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          onSelectTab('contacts');
        }}
        className={`nav-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
        style={{ position: 'relative' }}
      >
        <Users style={{ width: '20px', height: '20px' }} />
        <span>Contacts</span>
        {friendRequests.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '18px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#ef4444',
            }}
          />
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          onSelectTab('settings');
        }}
        className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
      >
        <Settings style={{ width: '20px', height: '20px' }} />
        <span>Settings</span>
      </button>
    </nav>
  );
};
