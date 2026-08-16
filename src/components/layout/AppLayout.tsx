import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { LandingPage } from '../landing/LandingPage';
import { AuthModal } from '../auth/AuthModal';
import { Sidebar, NavTab } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ChatList } from '../chat/ChatList';
import { ChatWindow } from '../chat/ChatWindow';
import { CallsPanel } from '../calls/CallsPanel';
import { DiscoverPanel } from '../discover/DiscoverPanel';
import { ContactsPanel } from '../contacts/ContactsPanel';
import { SettingsPanel, SettingsMainCategory, SettingsSubSection } from '../settings/SettingsPanel';
import { SettingsSubPanel } from '../settings/SettingsSubPanel';
import { SettingsDetailView } from '../settings/SettingsDetailView';
import { CallModal } from '../calls/CallModal';
import { setupMobileEnvironment } from '../../services/capacitor';

const DEFAULT_PANEL_WIDTH = 360;
const MIN_PANEL_WIDTH = 76;
const MAX_PANEL_WIDTH = 600;
const COMPACT_BREAKPOINT = 220;

export const AppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeChat, blockedUsers } = useChat();
  const [activeTab, setActiveTab] = useState<NavTab>('chats');
  const [settingsCategory, setSettingsCategory] = useState<SettingsMainCategory>('privacy');
  const [settingsSubSection, setSettingsSubSection] = useState<SettingsSubSection>('privacy-blocked');
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resizable left panel width state (stored in localStorage)
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    const saved = localStorage.getItem('novyn_panel_width');
    const parsed = Number(saved);
    return Number.isFinite(parsed) && parsed >= MIN_PANEL_WIDTH && parsed <= MAX_PANEL_WIDTH
      ? parsed
      : DEFAULT_PANEL_WIDTH;
  });

  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(panelWidth);
  const isCompact = panelWidth < COMPACT_BREAKPOINT;

  useEffect(() => {
    setupMobileEnvironment();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current;
      const maxAllowed = Math.min(MAX_PANEL_WIDTH, window.innerWidth - 240);
      let newWidth = startWidthRef.current + deltaX;

      if (newWidth < 120) {
        newWidth = MIN_PANEL_WIDTH;
      } else {
        newWidth = Math.max(160, Math.min(maxAllowed, newWidth));
      }

      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setPanelWidth((curr) => {
        localStorage.setItem('novyn_panel_width', String(curr));
        return curr;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClickResizer = () => {
    setPanelWidth(DEFAULT_PANEL_WIDTH);
    localStorage.setItem('novyn_panel_width', String(DEFAULT_PANEL_WIDTH));
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#ffffff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>Loading Novyn...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated landing & auth modal flow
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage
          onOpenAuth={(mode = 'signin') => {
            setAuthMode(mode);
            setIsAuthOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
        />
      </>
    );
  }

  const showSubPanel = windowWidth >= 960 && !isCompact;

  return (
    <div className="app-container">
      {/* 1. Desktop Sidebar Navigation (Column 1) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsListCollapsed(false);
        }}
        onToggleList={() => setIsListCollapsed((prev) => !prev)}
        isListCollapsed={isListCollapsed}
      />

      {/* 2. Middle Navigation Pane (Column 2: Chats / Calls / Discover / Contacts / Settings Categories) */}
      {!isListCollapsed && (
        <div
          style={{
            display: activeChat && activeTab !== 'settings' ? 'none' : 'flex',
            height: '100%',
            width: windowWidth <= 768 ? '100%' : `${panelWidth}px`,
            minWidth: windowWidth <= 768 ? '100%' : `${panelWidth}px`,
            maxWidth: windowWidth <= 768 ? '100%' : `${panelWidth}px`,
            transition: isDragging ? 'none' : 'width 0.15s ease',
            overflow: 'hidden',
          }}
          className="sm-flex-always"
        >
          {activeTab === 'chats' && (
            <ChatList
              onOpenContacts={() => setActiveTab('contacts')}
              isCompact={isCompact}
            />
          )}
          {activeTab === 'calls' && <CallsPanel isCompact={isCompact} />}
          {activeTab === 'discover' && <DiscoverPanel isCompact={isCompact} />}
          {activeTab === 'contacts' && <ContactsPanel isCompact={isCompact} />}
          {activeTab === 'settings' && (
            <SettingsPanel
              activeCategory={settingsCategory}
              onSelectCategory={(cat, defaultSub) => {
                setSettingsCategory(cat);
                setSettingsSubSection(defaultSub);
              }}
              isCompact={isCompact}
            />
          )}
        </div>
      )}

      {/* Draggable Resizer Bar (Desktop only) */}
      {!isListCollapsed && windowWidth > 768 && (
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClickResizer}
          className={`panel-resizer ${isDragging ? 'dragging' : ''}`}
          title="Drag to resize panel (Double-click to reset)"
        />
      )}

      {/* 3 & 4. Right Active Main Area (Settings Dual Screen 50/50 or Chat Window) */}
      <div
        style={{
          flex: 1,
          height: '100%',
          display: activeChat || isListCollapsed || activeTab === 'settings' ? 'flex' : 'none',
          minWidth: 0,
        }}
        className="sm-flex-always"
      >
        {activeTab === 'settings' ? (
          <div style={{ flex: 1, height: '100%', display: 'flex', minWidth: 0 }}>
            {showSubPanel && (
              <SettingsSubPanel
                activeCategory={settingsCategory}
                activeSubSection={settingsSubSection}
                onSelectSubSection={setSettingsSubSection}
                blockedCount={blockedUsers.size}
              />
            )}
            <SettingsDetailView activeSubSection={settingsSubSection} />
          </div>
        ) : (
          <ChatWindow
            isListCollapsed={isListCollapsed}
            onToggleList={() => setIsListCollapsed((prev) => !prev)}
          />
        )}
      </div>

      {/* 5. Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsListCollapsed(false);
        }}
      />

      {/* WebRTC Audio/Video Call Overlay */}
      <CallModal />
    </div>
  );
};
