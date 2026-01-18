export interface User {
  username: string;
  color: string;
  isGuest: boolean;
  isAdmin: boolean;
  isOnline: boolean;
}

export interface SystemMessage {
  type: 'system';
  text: string;
  timestamp: number;
  id?: string;
}

export interface UserMessage {
  type: 'user';
  username: string;
  color: string;
  text: string;
  timestamp: number;
  id: string;
}

export type Message = SystemMessage | UserMessage;

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export interface AuthResult {
  success: boolean;
  error?: string;
  isAdmin?: boolean;
}

export interface AdminResult {
  success: boolean;
  error?: string;
  action: string;
}

// Room types
export interface Room {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: number;
  members: string[]; // usernames of members
  isPublic: boolean;
}

export interface RoomResult {
  success: boolean;
  error?: string;
  room?: Room;
  rooms?: Room[];
}

// Socket.io event payloads
export interface ServerToClientEvents {
  message: (message: Message) => void;
  messages: (messages: Message[]) => void;
  users: (users: User[]) => void;
  authResult: (result: AuthResult) => void;
  adminResult: (result: AdminResult) => void;
  messageDeleted: (messageId: string) => void;
  // Room events
  roomResult: (result: RoomResult) => void;
  rooms: (rooms: Room[]) => void;
  roomUsers: (users: User[]) => void;
}

export interface ClientToServerEvents {
  register: (data: { username: string; password: string; color: string }) => void;
  login: (data: { username: string; password: string }) => void;
  guestJoin: (data: { username: string; color: string }) => void;
  chat: (message: string) => void;
  resetPassword: (data: { targetUsername: string; newPassword: string }) => void;
  deleteMessage: (messageId: string) => void;
  kickUser: (data: { targetUsername: string }) => void;
  // Room events
  createRoom: (data: { name: string; description: string; isPublic: boolean }) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  getRooms: () => void;
  getMyRooms: () => void;
}
