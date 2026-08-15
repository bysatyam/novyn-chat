export type MessageStatus = 'sent' | 'delivered' | 'seen';

export interface Attachment {
  url: string;
  name: string;
  mime: string;
  size: number;
  kind: 'image' | 'file' | 'audio';
}

export interface Reaction {
  emoji: string;
  username: string;
}

export interface Message {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  timestamp: string | number;
  status: MessageStatus;
  attachment?: Attachment | null;
  replyTo?: {
    id: string;
    sender: string;
    text: string;
    attachment?: Attachment | null;
  } | null;
  reactions?: Record<string, string[]>; // emoji -> [usernames]
  isVoice?: boolean;
  voiceDuration?: number;
}

export interface UserProfile {
  username: string;
  displayName?: string;
  email?: string;
  avatarId?: string;
  bio?: string;
  age?: string;
  gender?: string;
  online?: boolean;
  lastSeenAt?: string;
  presenceMode?: 'online' | 'away' | 'dnd' | 'offline';
}

export interface Conversation {
  username: string;
  displayName: string;
  avatarId?: string;
  lastMessage?: Message;
  unreadCount: number;
  online: boolean;
  lastSeenAt?: string;
  typing?: boolean;
  bio?: string;
}

export interface FriendRequest {
  from: string;
  timestamp: string;
  displayName?: string;
}

export type ActiveTab = 'chats' | 'calls' | 'contacts' | 'settings';

export interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  remoteUser: string;
  remoteDisplayName?: string;
  isVideo: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing?: boolean;
  status: 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
}

export interface CallLog {
  id: string;
  partner: string;
  partnerDisplayName?: string;
  partnerAvatarId?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo: boolean;
  timestamp: string | number;
  duration?: number;
}
