export interface User {
  username: string;
  color: string;
  isGuest: boolean;
  isAdmin: boolean;
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

// Socket.io event payloads
export interface ServerToClientEvents {
  message: (message: Message) => void;
  messages: (messages: Message[]) => void;
  users: (users: User[]) => void;
  authResult: (result: AuthResult) => void;
  adminResult: (result: AdminResult) => void;
  messageDeleted: (messageId: string) => void;
}

export interface ClientToServerEvents {
  register: (data: { username: string; password: string; color: string }) => void;
  login: (data: { username: string; password: string }) => void;
  guestJoin: (data: { username: string; color: string }) => void;
  chat: (message: string) => void;
  resetPassword: (data: { targetUsername: string; newPassword: string }) => void;
  deleteMessage: (messageId: string) => void;
}
