import React from 'react';
import { useChat } from '../../context/ChatContext';
import { MessageSquare, Phone, Compass, Users, Settings } from 'lucide-react';
import { triggerHaptic } from '../../services/capacitor';

export type NavTab = 'chats' | 'calls' | 'discover' | 'contacts' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onToggleList: () => void;
  isListCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onToggleList,
  isListCollapsed,
}) => {
  const { friendRequests } = useChat();

  const handleTabClick = (tab: NavTab) => {
    triggerHaptic('light');
    if (activeTab === tab) {
      onToggleList();
    } else {
      onSelectTab(tab);
    }
  };

  return (
    <aside className="desktop-sidebar">
      {/* Top Left Brand Logo - Toggles List */}
      <div className="sidebar-nav">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onToggleList();
          }}
          className="sidebar-logo"
          style={{
            border: 'none',
            cursor: 'pointer',
            opacity: isListCollapsed ? 0.75 : 1,
            transform: isListCollapsed ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
          title={isListCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          <MessageSquare style={{ width: '22px', height: '22px' }} />
        </button>

        {/* Chats Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('chats')}
          className={`sidebar-icon-btn ${activeTab === 'chats' && !isListCollapsed ? 'active' : ''}`}
          title="Chats"
        >
          <MessageSquare style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Calls Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('calls')}
          className={`sidebar-icon-btn ${activeTab === 'calls' && !isListCollapsed ? 'active' : ''}`}
          title="Calls"
        >
          <Phone style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Discover Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('discover')}
          className={`sidebar-icon-btn ${activeTab === 'discover' && !isListCollapsed ? 'active' : ''}`}
          title="Discover Online"
        >
          <Compass style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Contacts Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('contacts')}
          className={`sidebar-icon-btn ${activeTab === 'contacts' && !isListCollapsed ? 'active' : ''}`}
          title="Contacts & Friends"
        >
          <Users style={{ width: '20px', height: '20px' }} />
          {friendRequests.length > 0 && <span className="sidebar-badge" />}
        </button>
      </div>

      {/* Bottom Area - Only the Gear (Settings) Icon */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => handleTabClick('settings')}
          className={`sidebar-icon-btn ${activeTab === 'settings' && !isListCollapsed ? 'active' : ''}`}
          title="Settings & Profile"
        >
          <Settings style={{ width: '20px', height: '20px' }} />
        </button>
      </div>
    </aside>
  );
};
