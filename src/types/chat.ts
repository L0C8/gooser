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
  characters?: RoomCharacter[]; // AI characters in the room
}

export interface RoomResult {
  success: boolean;
  error?: string;
  room?: Room;
  rooms?: Room[];
}

// Character card types (SillyTavern compatible)
export interface CharacterCard {
  id: string;
  name: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  mes_example: string;
  system_prompt: string;
  creator_notes: string;
  tags: string[];
  avatar?: string; // filename
  createdAt: number;
  createdBy: string;
}

// API configuration types
export type APIProvider =
  | 'openai'
  | 'anthropic'
  | 'openrouter'
  | 'kobold'
  | 'ollama'
  | 'custom';

export interface APIConfig {
  id: string;
  name: string;
  provider: APIProvider;
  apiKey?: string;
  apiUrl?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  isActive: boolean;
  createdAt: number;
}

// Room character assignment
export interface RoomCharacter {
  characterId: string;
  apiConfigId: string;
  triggerOnMention: boolean;
  triggerOnMessage: boolean;
  triggerProbability: number; // 0-100 for random triggers
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
  // Character/AI events
  characters: (characters: CharacterCard[]) => void;
  apiConfigs: (configs: APIConfig[]) => void;
  characterResult: (result: { success: boolean; error?: string; character?: CharacterCard }) => void;
  apiConfigResult: (result: { success: boolean; error?: string; config?: APIConfig }) => void;
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
  // Character events (admin only)
  getCharacters: () => void;
  createCharacter: (data: Omit<CharacterCard, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateCharacter: (data: CharacterCard) => void;
  deleteCharacter: (characterId: string) => void;
  // API config events (admin only)
  getAPIConfigs: () => void;
  createAPIConfig: (data: Omit<APIConfig, 'id' | 'createdAt'>) => void;
  updateAPIConfig: (data: APIConfig) => void;
  deleteAPIConfig: (configId: string) => void;
  // Room character management (admin only)
  addCharacterToRoom: (data: { roomId: string; character: RoomCharacter }) => void;
  removeCharacterFromRoom: (data: { roomId: string; characterId: string }) => void;
}
