import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import type { Message, User, ConnectionStatus, AuthResult, AdminResult, ServerToClientEvents, ClientToServerEvents } from '../types/chat';

const SERVER_PORT = 3001;

class ChatService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private usersSubject = new BehaviorSubject<User[]>([]);
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>('connecting');
  private authResultSubject = new Subject<AuthResult>();
  private adminResultSubject = new Subject<AdminResult>();

  public messages$: Observable<Message[]> = this.messagesSubject.asObservable();
  public users$: Observable<User[]> = this.usersSubject.asObservable();
  public connectionStatus$: Observable<ConnectionStatus> = this.connectionStatusSubject.asObservable();
  public authResult$: Observable<AuthResult> = this.authResultSubject.asObservable();
  public adminResult$: Observable<AdminResult> = this.adminResultSubject.asObservable();

  constructor() {
    const serverUrl = `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`;
    this.socket = io(serverUrl);

    this.setupConnectionEvents();
    this.setupMessageStream();
    this.setupUsersStream();
    this.setupAuthStream();
    this.setupAdminStream();
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

  public disconnect(): void {
    this.socket.disconnect();
  }

  public reconnect(): void {
    // Clear local state
    this.messagesSubject.next([]);
    this.usersSubject.next([]);
    // Reconnect socket
    this.socket.connect();
  }
}

// Singleton instance
export const chatService = new ChatService();
