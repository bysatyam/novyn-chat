import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Message, MessageStatus, Conversation, FriendRequest, CallState, CallLog } from '../types';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { WebRTCManager, playRingtone, playCallRing, stopRingtone, playCallEndSound } from '../services/webrtc';
import { playMessageNotification, playMessageSentSound } from '../services/audioManager';
import { triggerHaptic } from '../services/capacitor';

interface ChatContextType {
  conversations: Conversation[];
  activeChat: string | null;
  setActiveChat: (username: string | null) => void;
  messages: Message[];
  friendRequests: FriendRequest[];
  sentRequests: Set<string>;
  typingUsers: Set<string>;
  mutedUsers: Set<string>;
  blockedUsers: Set<string>;
  callState: CallState;
  callLogs: CallLog[];
  clearCallLogs: () => void;
  sendMessage: (text: string, options?: { attachment?: any; replyTo?: any; isVoice?: boolean }) => void;
  sendTyping: (isTyping: boolean) => void;
  sendFriendRequest: (username: string) => Promise<{ ok: boolean; message?: string }>;
  cancelFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (from: string) => void;
  rejectFriendRequest: (from: string) => void;
  updateProfile: (payload: { displayName?: string; bio?: string; status?: string; avatarId?: string }) => void;
  unsendMessage: (messageId: string) => void;
  editMessage: (messageId: string, newText: string) => void;
  muteUser: (username: string, muted: boolean) => void;
  blockUser: (username: string, blocked: boolean) => void;
  unfriendUser: (username: string) => void;
  clearChat: (username: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  pinMessage: (messageId: string) => void;
  unpinMessage: (messageId: string) => void;
  createPoll: (question: string, options: string[]) => void;
  votePoll: (messageId: string, optionId: string) => void;
  startCall: (remoteUser: string, isVideo?: boolean) => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: (reason?: string) => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);

  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    status: 'idle',
    remoteUser: '',
    isVideo: false,
    isMuted: false,
    isCameraOff: false,
    isIncoming: false,
    localStream: null,
    remoteStream: null,
  });

  const activeChatRef = useRef<string | null>(null);
  activeChatRef.current = activeChat;

  const conversationsRef = useRef<Conversation[]>(conversations);
  conversationsRef.current = conversations;

  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  const callStateRef = useRef<CallState>(callState);
  callStateRef.current = callState;

  const callTimeoutTimerRef = useRef<any>(null);
  const callStartTimeRef = useRef<number | null>(null);

  // Load call logs from localStorage
  useEffect(() => {
    if (!user?.username) return;
    try {
      const saved = localStorage.getItem(`novyn_call_logs_${user.username}`);
      if (saved) {
        setCallLogs(JSON.parse(saved));
      }
    } catch {}
  }, [user?.username]);

  // Save call logs to localStorage
  const saveCallLog = useCallback(
    (log: CallLog) => {
      setCallLogs((prev) => {
        const next = [log, ...prev].slice(0, 50);
        if (user?.username) {
          localStorage.setItem(`novyn_call_logs_${user.username}`, JSON.stringify(next));
        }
        return next;
      });
    },
    [user?.username]
  );

  const clearCallLogs = useCallback(() => {
    setCallLogs([]);
    if (user?.username) {
      localStorage.removeItem(`novyn_call_logs_${user.username}`);
    }
  }, [user?.username]);

  // Initialize WebRTC Manager
  useEffect(() => {
    const handleRemoteStream = (stream: MediaStream) => {
      setCallState((prev) => ({ ...prev, remoteStream: stream, status: 'connected' }));
      stopRingtone();
      if (callTimeoutTimerRef.current) {
        clearTimeout(callTimeoutTimerRef.current);
        callTimeoutTimerRef.current = null;
      }
      callStartTimeRef.current = Date.now();
    };

    const handleLocalStream = (stream: MediaStream) => {
      setCallState((prev) => ({ ...prev, localStream: stream }));
    };

    const handleScreenShareEnded = () => {
      setCallState((prev) => ({ ...prev, isScreenSharing: false }));
    };

    const handleSignal = (signal: any) => {
      const socket = getSocket();
      if (socket && callStateRef.current.remoteUser) {
        socket.emit('webrtc_signal', { to: callStateRef.current.remoteUser, signal });
      }
    };

    webrtcManagerRef.current = new WebRTCManager(
      handleRemoteStream,
      handleSignal,
      handleLocalStream,
      handleScreenShareEnded
    );

    return () => {
      webrtcManagerRef.current?.cleanup();
      stopRingtone();
      if (callTimeoutTimerRef.current) clearTimeout(callTimeoutTimerRef.current);
    };
  }, []);

  // Sync active chat history & mark read
  useEffect(() => {
    if (!activeChat || !user) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('set_active_chat', { to: activeChat, kind: 'friend' });
    socket.emit('get_history', { to: activeChat, kind: 'friend' });

    setConversations((prev) =>
      prev.map((c) => (c.username.toLowerCase() === activeChat.toLowerCase() ? { ...c, unreadCount: 0 } : c))
    );
  }, [activeChat, user]);

  // Auto-Away & Background Tab Visibility Presence Sync
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    // Request notification permission once on user session start
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    let awayTimer: any = null;
    let isAway = false;

    const setAway = () => {
      if (!isAway) {
        isAway = true;
        socket.emit('set_presence_mode', { mode: 'away' });
      }
    };

    const setOnline = () => {
      if (awayTimer) clearTimeout(awayTimer);
      if (isAway) {
        isAway = false;
        socket.emit('set_presence_mode', { mode: 'online' });
      }
      // Trigger away after 3 minutes of inactivity
      awayTimer = setTimeout(setAway, 180000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Tab went to background: mark away after 45s
        if (awayTimer) clearTimeout(awayTimer);
        awayTimer = setTimeout(setAway, 45000);
      } else {
        // Tab returned to active foreground: immediately restore online and sync active chat
        setOnline();
        if (activeChatRef.current) {
          socket.emit('set_active_chat', { to: activeChatRef.current, kind: 'friend' });
          socket.emit('get_history', { to: activeChatRef.current, kind: 'friend' });
        }
      }
    };

    const handleWindowFocus = () => {
      setOnline();
      if (activeChatRef.current) {
        socket.emit('set_active_chat', { to: activeChatRef.current, kind: 'friend' });
        socket.emit('get_history', { to: activeChatRef.current, kind: 'friend' });
      }
    };

    const handleUserActivity = () => {
      if (document.visibilityState === 'visible') {
        setOnline();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    // Initial activity timer
    awayTimer = setTimeout(setAway, 180000);

    return () => {
      if (awayTimer) clearTimeout(awayTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [user]);

  // End Call Helper
  const endCall = useCallback(
    (reason?: string) => {
      const socket = getSocket();
      stopRingtone();
      playCallEndSound();

      if (callTimeoutTimerRef.current) {
        clearTimeout(callTimeoutTimerRef.current);
        callTimeoutTimerRef.current = null;
      }

      const current = callStateRef.current;
      if (socket && current.remoteUser) {
        socket.emit('call_end', { to: current.remoteUser, reason });
      }

      webrtcManagerRef.current?.cleanup();

      // Log Call History Record
      if (current.remoteUser) {
        const duration = callStartTimeRef.current ? Math.round((Date.now() - callStartTimeRef.current) / 1000) : 0;
        const type =
          current.status === 'connected'
            ? current.isIncoming
              ? 'incoming'
              : 'outgoing'
            : current.isIncoming
            ? 'missed'
            : 'outgoing';

        saveCallLog({
          id: `call_${Date.now()}`,
          partner: current.remoteUser,
          partnerDisplayName: current.remoteDisplayName || current.remoteUser,
          type,
          isVideo: current.isVideo,
          timestamp: new Date().toISOString(),
          duration: current.status === 'connected' ? duration : undefined,
        });
      }

      callStartTimeRef.current = null;

      setCallState({
        isActive: false,
        status: 'ended',
        remoteUser: '',
        isVideo: false,
        isMuted: false,
        isCameraOff: false,
        isIncoming: false,
        localStream: null,
        remoteStream: null,
      });
      triggerHaptic('medium');
    },
    [saveCallLog]
  );

  // Main Socket Listener Setup
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('resume_session');

    // Friend list sync
    const handleFriendList = (data: any) => {
      const list = Array.isArray(data) ? data : data?.friends || [];
      const formatted: Conversation[] = list.map((item: any) => ({
        username: item.username || item.key,
        displayName: item.displayName || item.username || item.key,
        avatarId: item.avatarId,
        online: Boolean(item.online && item.presence !== 'offline'),
        presence: item.presence || (item.online ? 'online' : 'offline'),
        lastSeenAt: item.lastSeenAt,
        unreadCount: item.unreadCount || 0,
        lastMessage: item.lastMessage
          ? {
              id: item.lastMessage.id || '1',
              sender: item.lastMessage.from || item.lastFrom || '',
              receiver: user.username,
              text: item.lastMessage.text || item.lastMessage,
              timestamp: item.lastTimestamp || item.lastMessage.timestamp,
              status: 'delivered',
            }
          : undefined,
      }));
      setConversations(formatted);
    };

    const handleRequests = (data: any) => {
      const list = Array.isArray(data) ? data : data?.requests || [];
      const formatted: FriendRequest[] = list.map((req: any) => ({
        from: typeof req === 'string' ? req : req.from || req.username,
        timestamp: req.timestamp || new Date().toISOString(),
        displayName: typeof req === 'object' ? req.displayName : req,
      }));
      setFriendRequests(formatted);
    };

    socket.on('init', (data: any) => {
      if (data?.friends) handleFriendList(data.friends);
      if (data?.requests) handleRequests(data.requests);
    });

    socket.on('friend_list', handleFriendList);
    socket.on('friend_list_updated', handleFriendList);
    socket.on('requests_updated', handleRequests);

    // Profile updates
    socket.on('user_profile_updated', (profile: any) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.username.toLowerCase() === profile.username?.toLowerCase()
            ? { ...c, displayName: profile.displayName || c.displayName, avatarId: profile.avatarId || c.avatarId }
            : c
        )
      );
    });

    socket.on('profile_updated', (profile: any) => {
      if (setUser) {
        setUser((prev: any) => (prev ? { ...prev, ...profile } : prev));
      }
    });

    socket.on('message_unsent', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      triggerHaptic('light');
    });

    socket.on('message_edited', ({ messageId, text }: { messageId: string; text: string }) => {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, text } : m)));
      triggerHaptic('light');
    });

    socket.on('reaction_updated', ({ messageId, reactions }: { messageId: string; reactions: any }) => {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)));
    });

    socket.on('message_pinned', ({ messageId, pinnedAt, pinnedBy }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, pinnedAt, pinnedBy } : m))
      );
      triggerHaptic('light');
    });

    socket.on('message_unpinned', ({ messageId }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, pinnedAt: null, pinnedBy: '' } : m))
      );
      triggerHaptic('light');
    });

    socket.on('poll_updated', ({ messageId, poll }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId || m.poll?.id === poll.id ? { ...m, poll } : m))
      );
      triggerHaptic('light');
    });

    socket.on('friend_request_received', ({ from }: { from: string }) => {
      triggerHaptic('success');
      setFriendRequests((prev) => {
        if (prev.some((r) => r.from.toLowerCase() === from.toLowerCase())) return prev;
        return [{ from, timestamp: new Date().toISOString(), displayName: from }, ...prev];
      });
    });

    socket.on('friend_request_sent', ({ to }: { to: string }) => {
      setSentRequests((prev) => new Set(prev).add(to.toLowerCase()));
    });

    socket.on('friend_request_cancelled', ({ to }: { to: string }) => {
      setSentRequests((prev) => {
        const next = new Set(prev);
        next.delete(to.toLowerCase());
        return next;
      });
    });

    socket.on('friend_request_accepted', ({ by }: { by: string }) => {
      setSentRequests((prev) => {
        const next = new Set(prev);
        next.delete(by.toLowerCase());
        return next;
      });
      socket.emit('resume_session');
    });

    socket.on('profile_updated', (updated: any) => {
      if (setUser && updated) {
        setUser((prev) => (prev ? {
          ...prev,
          username: updated.username || prev.username,
          displayName: updated.displayName || prev.displayName,
          bio: updated.bio !== undefined ? updated.bio : prev.bio,
          avatarId: updated.avatarId !== undefined ? updated.avatarId : prev.avatarId,
          presenceMode: updated.presenceMode || prev.presenceMode,
        } : prev));
      }
      if (activeChatRef.current) {
        socket.emit('get_history', { to: activeChatRef.current, kind: 'friend' });
      }
    });

    socket.on('friend_removed', ({ username }: { username: string }) => {
      setConversations((prev) => prev.filter((c) => c.username.toLowerCase() !== username.toLowerCase()));
      if (activeChatRef.current?.toLowerCase() === username.toLowerCase()) {
        setActiveChat(null);
      }
    });

    socket.on('chat_cleared', ({ with: target }: { with: string }) => {
      if (activeChatRef.current?.toLowerCase() === target.toLowerCase()) {
        setMessages([]);
      }
    });

    socket.on('mute_updated', ({ username, muted }: { username: string; muted: boolean }) => {
      setMutedUsers((prev) => {
        const next = new Set(prev);
        if (muted) next.add(username.toLowerCase());
        else next.delete(username.toLowerCase());
        return next;
      });
    });

    socket.on('block_updated', ({ username, blocked }: { username: string; blocked: boolean }) => {
      setBlockedUsers((prev) => {
        const next = new Set(prev);
        if (blocked) next.add(username.toLowerCase());
        else next.delete(username.toLowerCase());
        return next;
      });
    });

    // Chat History Sync
    const handleHistory = (data: any) => {
      const target = data?.with || data?.withUser || data?.to;
      const historyList = data?.messages || [];
      if (activeChatRef.current && target && activeChatRef.current.toLowerCase() === target.toLowerCase()) {
        setMessages(
          historyList.map((m: any) => ({
            id: m.id || m.messageId || String(m.timestamp),
            sender: m.from || m.sender || m.fromKey,
            receiver: m.to || m.receiver || m.toKey,
            text: m.text || '',
            timestamp: m.timestamp,
            status: (m.seenAt ? 'seen' : m.deliveredAt ? 'delivered' : m.status || 'sent') as MessageStatus,
            attachment: m.attachment,
            replyTo: m.replyTo,
            reactions: m.reactions || {},
            isVoice: Boolean(m.isVoice || m.attachment?.kind === 'audio'),
            pinnedAt: m.pinnedAt || null,
            pinnedBy: m.pinnedBy || '',
            poll: m.poll || null,
          }))
        );
      }
    };

    socket.on('history', handleHistory);

    // Message delivery & seen status updates
    socket.on('message_status', (data: any) => {
      const msgId = data?.id;
      if (!msgId) return;
      const newStatus: MessageStatus = data.seenAt ? 'seen' : data.deliveredAt ? 'delivered' : 'sent';
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: newStatus } : m))
      );
    });

    // Private Message Incoming
    socket.on('private_message', (rawMsg: any) => {
      const sender = rawMsg.from || rawMsg.sender || rawMsg.fromKey;
      const receiver = rawMsg.to || rawMsg.receiver || rawMsg.toKey;
      const clientTempId = rawMsg.clientTempId;
      const msgId = rawMsg.id || rawMsg.messageId || clientTempId || String(Date.now());
      const status: MessageStatus = rawMsg.seenAt ? 'seen' : rawMsg.deliveredAt ? 'delivered' : rawMsg.status || 'sent';

      const msg: Message = {
        id: msgId,
        sender,
        receiver,
        text: rawMsg.text || '',
        timestamp: rawMsg.timestamp || new Date().toISOString(),
        status,
        attachment: rawMsg.attachment,
        replyTo: rawMsg.replyTo,
        reactions: rawMsg.reactions || {},
        isVoice: Boolean(rawMsg.isVoice || rawMsg.attachment?.kind === 'audio'),
        pinnedAt: rawMsg.pinnedAt || null,
        pinnedBy: rawMsg.pinnedBy || '',
        poll: rawMsg.poll || null,
      };

      const current = activeChatRef.current?.toLowerCase();
      const isCurrentConversation =
        current && (current === sender?.toLowerCase() || current === receiver?.toLowerCase());

      if (isCurrentConversation) {
        setMessages((prev) => {
          const existingIndex = prev.findIndex(
            (m) => (clientTempId && m.id === clientTempId) || m.id === msgId
          );
          if (existingIndex !== -1) {
            const next = [...prev];
            next[existingIndex] = msg;
            return next;
          }
          return [...prev, msg];
        });
      }

      setConversations((prev) => {
        const partner = sender?.toLowerCase() === user.username.toLowerCase() ? receiver : sender;
        const exists = prev.some((c) => c.username.toLowerCase() === partner?.toLowerCase());

        if (!exists && partner) {
          return [
            {
              username: partner,
              displayName: partner,
              online: true,
              unreadCount: isCurrentConversation ? 0 : 1,
              lastMessage: msg,
            },
            ...prev,
          ];
        }

        return prev.map((c) => {
          if (c.username.toLowerCase() === partner?.toLowerCase()) {
            return {
              ...c,
              lastMessage: msg,
              unreadCount: isCurrentConversation ? 0 : c.unreadCount + 1,
            };
          }
          return c;
        });
      });

      if (sender?.toLowerCase() !== user.username.toLowerCase()) {
        playMessageNotification();

        // Show visual desktop notification when tab is in background or another chat is active
        if (
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted' &&
          (document.hidden || activeChatRef.current?.toLowerCase() !== sender?.toLowerCase())
        ) {
          try {
            const partnerConv = conversationsRef.current.find(
              (c) => c.username.toLowerCase() === sender.toLowerCase()
            );
            const senderName = partnerConv?.displayName || sender;
            const notifBody = msg.text || (msg.isVoice ? '🎤 Voice message' : '📎 Attachment');
            const notif = new Notification(senderName, {
              body: notifBody,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `novyn-${sender}`,
            });
            notif.onclick = () => {
              window.focus();
              setActiveChat(sender);
              notif.close();
            };
          } catch (e) {
            console.warn('[Notification] Failed to show desktop notification:', e);
          }
        }
      }
      triggerHaptic('light');
    });

    // Typing Indicators
    socket.on('typing', ({ from, isTyping }: { from: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (isTyping) next.add(from);
        else next.delete(from);
        return next;
      });
    });

    // User presence
    socket.on('user_status', ({ username, online, presence, lastSeenAt }: any) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.username.toLowerCase() === username?.toLowerCase()
            ? {
                ...c,
                online: Boolean(online && presence !== 'offline'),
                presence: presence || (online ? 'online' : 'offline'),
                lastSeenAt: lastSeenAt || c.lastSeenAt,
              }
            : c
        )
      );
    });

    // WebRTC Calling Signaling Listeners
    socket.on('call_incoming', ({ from, fromDisplayName, isVideo }: { from: string; fromDisplayName: string; isVideo: boolean }) => {
      setCallState({
        isActive: true,
        status: 'ringing',
        remoteUser: from,
        remoteDisplayName: fromDisplayName || from,
        isVideo,
        isMuted: false,
        isCameraOff: false,
        isIncoming: true,
        localStream: null,
        remoteStream: null,
      });

      playRingtone();
      triggerHaptic('heavy');

      // Auto-cut after 30 seconds if not answered
      if (callTimeoutTimerRef.current) clearTimeout(callTimeoutTimerRef.current);
      callTimeoutTimerRef.current = setTimeout(() => {
        endCall('No answer (Timed out)');
      }, 30000);
    });

    socket.on('call_accepted', async () => {
      stopRingtone();
      if (callTimeoutTimerRef.current) {
        clearTimeout(callTimeoutTimerRef.current);
        callTimeoutTimerRef.current = null;
      }
      callStartTimeRef.current = Date.now();

      setCallState((prev) => ({ ...prev, status: 'connected' }));
      triggerHaptic('success');

      if (webrtcManagerRef.current) {
        try {
          const offer = await webrtcManagerRef.current.createOffer();
          socket.emit('webrtc_signal', {
            to: callStateRef.current.remoteUser,
            signal: { type: 'offer', sdp: offer },
          });
        } catch (err) {
          console.error('Error creating WebRTC offer:', err);
        }
      }
    });

    socket.on('webrtc_signal', async ({ from, signal }: { from: string; signal: any }) => {
      if (!webrtcManagerRef.current || !signal) return;

      const targetUser = callStateRef.current.remoteUser || from;
      try {
        if (signal.type === 'offer') {
          const answer = await webrtcManagerRef.current.handleOffer(signal.sdp);
          socket.emit('webrtc_signal', {
            to: targetUser,
            signal: { type: 'answer', sdp: answer },
          });
        } else if (signal.type === 'answer') {
          await webrtcManagerRef.current.handleAnswer(signal.sdp);
        } else if (signal.type === 'candidate') {
          await webrtcManagerRef.current.handleCandidate(signal.candidate);
        }
      } catch (err) {
        console.error('WebRTC signal error:', err);
      }
    });

    socket.on('call_ended', ({ reason }: { reason?: string }) => {
      endCall(reason || 'Call ended');
    });

    return () => {
      socket.off('init');
      socket.off('friend_list');
      socket.off('friend_list_updated');
      socket.off('requests_updated');
      socket.off('user_profile_updated');
      socket.off('profile_updated');
      socket.off('message_unsent');
      socket.off('message_edited');
      socket.off('reaction_updated');
      socket.off('friend_request_received');
      socket.off('friend_request_sent');
      socket.off('friend_request_cancelled');
      socket.off('friend_request_accepted');
      socket.off('friend_removed');
      socket.off('chat_cleared');
      socket.off('mute_updated');
      socket.off('block_updated');
      socket.off('history', handleHistory);
      socket.off('message_status');
      socket.off('private_message');
      socket.off('typing');
      socket.off('user_status');
      socket.off('call_incoming');
      socket.off('call_accepted');
      socket.off('call_ended');
      socket.off('webrtc_signal');
    };
  }, [user, setUser, endCall]);

  const updateProfile = useCallback(
    (payload: { displayName?: string; bio?: string; status?: string; avatarId?: string }) => {
      const socket = getSocket();
      if (setUser) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                displayName: payload.displayName !== undefined ? payload.displayName : prev.displayName,
                bio: payload.bio !== undefined ? payload.bio : prev.bio,
                avatarId: payload.avatarId !== undefined ? payload.avatarId : prev.avatarId,
                presenceMode: payload.status !== undefined ? (payload.status as any) : prev.presenceMode,
              }
            : prev
        );
      }
      if (!socket) return;
      socket.emit('update_profile', payload);
      triggerHaptic('success');
    },
    [setUser]
  );

  const unsendMessage = useCallback((messageId: string) => {
    if (!activeChat) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit('unsend_message', { messageId, to: activeChat });
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    triggerHaptic('medium');
  }, [activeChat]);

  const editMessage = useCallback((messageId: string, newText: string) => {
    if (!activeChat) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit('edit_message', { messageId, text: newText, to: activeChat });
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, text: newText } : m)));
    triggerHaptic('light');
  }, [activeChat]);

  const sendMessage = useCallback(
    (text: string, options: { attachment?: any; replyTo?: any; isVoice?: boolean } = {}) => {
      if (!activeChat || !user) return;
      const socket = getSocket();
      if (!socket) return;

      const clientTempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const payload = {
        to: activeChat,
        toType: 'friend',
        text: text || (options.attachment?.kind === 'image' ? '[Image]' : options.isVoice ? '[Voice Message]' : '[File]'),
        attachment: options.attachment || null,
        replyTo: options.replyTo || null,
        clientTempId,
      };

      const optimisticMsg: Message = {
        id: clientTempId,
        sender: user.username,
        receiver: activeChat,
        text: text || '',
        timestamp: new Date().toISOString(),
        status: 'sent',
        attachment: options.attachment,
        replyTo: options.replyTo,
        isVoice: options.isVoice,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      playMessageSentSound();
      socket.emit('private_message', payload);
      triggerHaptic('light');
    },
    [activeChat, user]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!activeChat) return;
      const socket = getSocket();
      if (!socket) return;
      socket.emit('typing', { to: activeChat, isTyping, toType: 'friend' });
    },
    [activeChat]
  );

  const sendFriendRequest = useCallback(async (usernameOrEmail: string) => {
    const socket = getSocket();
    if (!socket) return { ok: false, message: 'Socket disconnected' };

    setSentRequests((prev) => new Set(prev).add(usernameOrEmail.toLowerCase()));
    socket.emit('add_friend', usernameOrEmail);
    triggerHaptic('success');
    return { ok: true };
  }, []);

  const cancelFriendRequest = useCallback(async (username: string) => {
    const socket = getSocket();
    if (!socket) return;

    setSentRequests((prev) => {
      const next = new Set(prev);
      next.delete(username.toLowerCase());
      return next;
    });
    socket.emit('cancel_friend_request', username);
    triggerHaptic('light');
  }, []);

  const acceptFriendRequest = useCallback((from: string) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('accept_friend', from);
    setFriendRequests((prev) => prev.filter((r) => r.from.toLowerCase() !== from.toLowerCase()));
    triggerHaptic('success');
  }, []);

  const rejectFriendRequest = useCallback((from: string) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('reject_friend', from);
    setFriendRequests((prev) => prev.filter((r) => r.from.toLowerCase() !== from.toLowerCase()));
    triggerHaptic('medium');
  }, []);

  const muteUser = useCallback((username: string, muted: boolean) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('set_mute', { username, muted });
    triggerHaptic('light');
  }, []);

  const blockUser = useCallback((username: string, blocked: boolean) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('set_block', { username, blocked });
    triggerHaptic('medium');
  }, []);

  const unfriendUser = useCallback((username: string) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('remove_friend', username);
    setConversations((prev) => prev.filter((c) => c.username.toLowerCase() !== username.toLowerCase()));
    setActiveChat(null);
    triggerHaptic('heavy');
  }, []);

  const clearChat = useCallback((username: string) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('clear_chat', { to: username, kind: 'friend' });
    setMessages([]);
    triggerHaptic('medium');
  }, []);

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!activeChat) return;
      const socket = getSocket();
      if (!socket) return;
      socket.emit('add_reaction', { messageId, emoji, to: activeChat });
      triggerHaptic('light');
    },
    [activeChat]
  );

  const pinMessage = useCallback(
    (messageId: string) => {
      if (!activeChat) return;
      const socket = getSocket();
      if (!socket) return;
      socket.emit('pin_message', { messageId, to: activeChat });
      triggerHaptic('light');
    },
    [activeChat]
  );

  const unpinMessage = useCallback(
    (messageId: string) => {
      if (!activeChat) return;
      const socket = getSocket();
      if (!socket) return;
      socket.emit('unpin_message', { messageId, to: activeChat });
      triggerHaptic('light');
    },
    [activeChat]
  );

  const createPoll = useCallback(
    (question: string, options: string[]) => {
      if (!activeChat) return;
      const socket = getSocket();
      if (!socket) return;
      const clientTempId = `tmp_poll_${Date.now()}`;
      socket.emit('create_poll', {
        to: activeChat,
        question,
        options,
        clientTempId,
      });
      triggerHaptic('success');
    },
    [activeChat]
  );

  const votePoll = useCallback(
    (messageId: string, optionId: string) => {
      if (!activeChat) return;
      const socket = getSocket();
      if (!socket) return;
      socket.emit('poll_vote', {
        messageId,
        optionId,
        to: activeChat,
      });
      triggerHaptic('light');
    },
    [activeChat]
  );

  // WebRTC Call Triggers
  const startCall = useCallback(async (remoteUser: string, isVideo = false) => {
    const socket = getSocket();
    if (!socket || !webrtcManagerRef.current) return;

    try {
      const localStream = await webrtcManagerRef.current.initLocalMedia(isVideo);
      setCallState({
        isActive: true,
        status: 'calling',
        remoteUser,
        remoteDisplayName: remoteUser,
        isVideo,
        isMuted: false,
        isCameraOff: false,
        isIncoming: false,
        localStream,
        remoteStream: null,
      });

      playCallRing();
      socket.emit('call_start', { to: remoteUser, isVideo });
      triggerHaptic('medium');

      // Auto-cut caller after 30s if recipient does not pick up
      if (callTimeoutTimerRef.current) clearTimeout(callTimeoutTimerRef.current);
      callTimeoutTimerRef.current = setTimeout(() => {
        endCall('No answer (Timed out)');
      }, 30000);
    } catch (err) {
      console.error('Failed to start call:', err);
      alert('Could not access microphone/camera. Please allow permissions in your browser.');
    }
  }, [endCall]);

  const answerCall = useCallback(async () => {
    const socket = getSocket();
    if (!socket || !webrtcManagerRef.current) return;

    stopRingtone();
    if (callTimeoutTimerRef.current) {
      clearTimeout(callTimeoutTimerRef.current);
      callTimeoutTimerRef.current = null;
    }
    callStartTimeRef.current = Date.now();

    try {
      const localStream = await webrtcManagerRef.current.initLocalMedia(callState.isVideo);
      setCallState((prev) => ({ ...prev, status: 'connected', localStream }));

      socket.emit('call_accept', { to: callState.remoteUser });
      triggerHaptic('success');
    } catch (err) {
      console.error('Failed to answer call:', err);
      endCall('Media error');
    }
  }, [callState.isVideo, callState.remoteUser, endCall]);

  const toggleMute = useCallback(() => {
    const nextMuted = !callState.isMuted;
    webrtcManagerRef.current?.setAudioEnabled(!nextMuted);
    setCallState((prev) => ({ ...prev, isMuted: nextMuted }));
    triggerHaptic('light');
  }, [callState.isMuted]);

  const toggleCamera = useCallback(() => {
    const nextCameraOff = !callState.isCameraOff;
    webrtcManagerRef.current?.setVideoEnabled(!nextCameraOff);
    setCallState((prev) => ({ ...prev, isCameraOff: nextCameraOff }));
    triggerHaptic('light');
  }, [callState.isCameraOff]);

  const toggleScreenShare = useCallback(async () => {
    if (!webrtcManagerRef.current) return;
    const isSharing = !callState.isScreenSharing;
    const success = await webrtcManagerRef.current.toggleScreenShare(isSharing);
    setCallState((prev) => ({ ...prev, isScreenSharing: success }));
    triggerHaptic('medium');
  }, [callState.isScreenSharing]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeChat,
        setActiveChat,
        messages,
        friendRequests,
        sentRequests,
        typingUsers,
        mutedUsers,
        blockedUsers,
        callState,
        callLogs,
        clearCallLogs,
        sendMessage,
        sendTyping,
        sendFriendRequest,
        cancelFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        updateProfile,
        unsendMessage,
        editMessage,
        muteUser,
        blockUser,
        unfriendUser,
        clearChat,
        addReaction,
        pinMessage,
        unpinMessage,
        createPoll,
        votePoll,
        startCall,
        answerCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
