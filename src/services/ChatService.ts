import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import type { Message, User, ConnectionStatus, AuthResult, AdminResult, Room, RoomResult, CharacterCard, APIConfig, RoomCharacter, ServerToClientEvents, ClientToServerEvents } from '../types/chat';

const SERVER_PORT = 3001;

class ChatService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private usersSubject = new BehaviorSubject<User[]>([]);
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>('connecting');
  private authResultSubject = new Subject<AuthResult>();
  private adminResultSubject = new Subject<AdminResult>();
  private roomsSubject = new BehaviorSubject<Room[]>([]);
  private roomResultSubject = new Subject<RoomResult>();
  private roomUsersSubject = new BehaviorSubject<User[]>([]);
  private currentRoomSubject = new BehaviorSubject<Room | null>(null);
  private charactersSubject = new BehaviorSubject<CharacterCard[]>([]);
  private apiConfigsSubject = new BehaviorSubject<APIConfig[]>([]);
  private characterResultSubject = new Subject<{ success: boolean; error?: string; character?: CharacterCard }>();
  private apiConfigResultSubject = new Subject<{ success: boolean; error?: string; config?: APIConfig }>();

  public messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  public users$: Observable<User[]> = this.usersSubject.asObservable();
  public connectionStatus$: Observable<ConnectionStatus> = this.connectionStatusSubject.asObservable();
  public authResult$: Observable<AuthResult> = this.authResultSubject.asObservable();
  public adminResult$: Observable<AdminResult> = this.adminResultSubject.asObservable();
  public rooms$: Observable<Room[]> = this.roomsSubject.asObservable();
  public roomResult$: Observable<RoomResult> = this.roomResultSubject.asObservable();
  public roomUsers$: Observable<User[]> = this.roomUsersSubject.asObservable();
  public currentRoom$: Observable<Room | null> = this.currentRoomSubject.asObservable();
  public characters$: Observable<CharacterCard[]> = this.charactersSubject.asObservable();
  public apiConfigs$: Observable<APIConfig[]> = this.apiConfigsSubject.asObservable();
  public characterResult$: Observable<{ success: boolean; error?: string; character?: CharacterCard }> = this.characterResultSubject.asObservable();
  public apiConfigResult$: Observable<{ success: boolean; error?: string; config?: APIConfig }> = this.apiConfigResultSubject.asObservable();

  constructor() {
    const serverUrl = `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`;
    this.socket = io(serverUrl);

    this.setupConnectionEvents();
    this.setupMessageStream();
    this.setupUsersStream();
    this.setupAuthStream();
    this.setupAdminStream();
    this.setupRoomStream();
    this.setupCharacterStream();
  }

  private setupConnectionEvents(): void {
    this.socket.on('connect', () => {
      this.connectionStatusSubject.next('connected');
    });

    this.socket.on('disconnect', () => {
      this.connectionStatusSubject.next('disconnected');
    });
  }

  private setupMessageStream(): void {
    // Handle initial message history
    this.socket.on('messages', (messages: Message[]) => {
      this.messagesSubject.next(messages);
    });

    // Handle new messages
    this.socket.on('message', (message: Message) => {
      const current = this.messagesSubject.getValue();
      this.messagesSubject.next([...current, message]);
    });
  }

  private setupUsersStream(): void {
    this.socket.on('users', (users: User[]) => {
      this.usersSubject.next(users);
    });
  }

  private setupAuthStream(): void {
    this.socket.on('authResult', (result: AuthResult) => {
      this.authResultSubject.next(result);
    });
  }

  private setupAdminStream(): void {
    this.socket.on('adminResult', (result: AdminResult) => {
      this.adminResultSubject.next(result);
    });

    this.socket.on('messageDeleted', (messageId: string) => {
      const current = this.messagesSubject.getValue();
      const filtered = current.filter(m => {
        if (m.type === 'user') return m.id !== messageId;
        if (m.type === 'system') return m.id !== messageId;
        return true;
      });
      this.messagesSubject.next(filtered);
    });
  }

  private setupRoomStream(): void {
    this.socket.on('rooms', (rooms: Room[]) => {
      this.roomsSubject.next(rooms);
    });

    this.socket.on('roomResult', (result: RoomResult) => {
      this.roomResultSubject.next(result);
      if (result.success && result.room) {
        this.currentRoomSubject.next(result.room);
      }
      // If leaving room, clear current room
      if (result.success && !result.room && !result.rooms) {
        this.currentRoomSubject.next(null);
      }
    });

    this.socket.on('roomUsers', (users: User[]) => {
      this.roomUsersSubject.next(users);
    });
  }

  private setupCharacterStream(): void {
    this.socket.on('characters', (characters: CharacterCard[]) => {
      this.charactersSubject.next(characters);
    });

    this.socket.on('apiConfigs', (configs: APIConfig[]) => {
      this.apiConfigsSubject.next(configs);
    });

    this.socket.on('characterResult', (result) => {
      this.characterResultSubject.next(result);
    });

    this.socket.on('apiConfigResult', (result) => {
      this.apiConfigResultSubject.next(result);
    });
  }

  public register(username: string, password: string, color: string): void {
    this.socket.emit('register', { username, password, color });
  }

  public login(username: string, password: string): void {
    this.socket.emit('login', { username, password });
  }

  public guestJoin(username: string, color: string): void {
    this.socket.emit('guestJoin', { username, color });
  }

  public sendMessage(text: string): void {
    this.socket.emit('chat', text);
  }

  public resetPassword(targetUsername: string, newPassword: string): void {
    this.socket.emit('resetPassword', { targetUsername, newPassword });
  }

  public deleteMessage(messageId: string): void {
    this.socket.emit('deleteMessage', messageId);
  }

  public kickUser(targetUsername: string): void {
    this.socket.emit('kickUser', { targetUsername });
  }

  // Room methods
  public createRoom(name: string, description: string, isPublic: boolean): void {
    this.socket.emit('createRoom', { name, description, isPublic });
  }

  public joinRoom(roomId: string): void {
    this.socket.emit('joinRoom', roomId);
  }

  public leaveRoom(roomId: string): void {
    this.socket.emit('leaveRoom', roomId);
    this.currentRoomSubject.next(null);
  }

  public getRooms(): void {
    this.socket.emit('getRooms');
  }

  public getMyRooms(): void {
    this.socket.emit('getMyRooms');
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  public reconnect(): void {
    // Clear local state
    this.messagesSubject.next([]);
    this.usersSubject.next([]);
    this.roomsSubject.next([]);
    this.currentRoomSubject.next(null);
    this.roomUsersSubject.next([]);
    this.charactersSubject.next([]);
    this.apiConfigsSubject.next([]);
    // Reconnect socket
    this.socket.connect();
  }

  // Character methods (admin only)
  public getCharacters(): void {
    this.socket.emit('getCharacters');
  }

  public createCharacter(data: Omit<CharacterCard, 'id' | 'createdAt' | 'createdBy'>): void {
    this.socket.emit('createCharacter', data);
  }

  public updateCharacter(character: CharacterCard): void {
    this.socket.emit('updateCharacter', character);
  }

  public deleteCharacter(characterId: string): void {
    this.socket.emit('deleteCharacter', characterId);
  }

  // API Config methods (admin only)
  public getAPIConfigs(): void {
    this.socket.emit('getAPIConfigs');
  }

  public createAPIConfig(data: Omit<APIConfig, 'id' | 'createdAt'>): void {
    this.socket.emit('createAPIConfig', data);
  }

  public updateAPIConfig(config: APIConfig): void {
    this.socket.emit('updateAPIConfig', config);
  }

  public deleteAPIConfig(configId: string): void {
    this.socket.emit('deleteAPIConfig', configId);
  }

  // Room character management (admin only)
  public addCharacterToRoom(roomId: string, character: RoomCharacter): void {
    this.socket.emit('addCharacterToRoom', { roomId, character });
  }

  public removeCharacterFromRoom(roomId: string, characterId: string): void {
    this.socket.emit('removeCharacterFromRoom', { roomId, characterId });
  }
}

// Singleton instance
export const chatService = new ChatService();
