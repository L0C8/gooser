import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../services/ChatService';
import type { Message, User, ConnectionStatus, AuthResult, AdminResult, Room, RoomResult } from '../types/chat';

export function useMessages(): Message[] {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const subscription = chatService.messages$.subscribe(setMessages);
    return () => subscription.unsubscribe();
  }, []);

  return messages;
}

export function useUsers(): User[] {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const subscription = chatService.users$.subscribe(setUsers);
    return () => subscription.unsubscribe();
  }, []);

  return users;
}

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  useEffect(() => {
    const subscription = chatService.connectionStatus$.subscribe(setStatus);
    return () => subscription.unsubscribe();
  }, []);

  return status;
}

export function useAuthResult(): AuthResult | null {
  const [result, setResult] = useState<AuthResult | null>(null);

  useEffect(() => {
    const subscription = chatService.authResult$.subscribe(setResult);
    return () => subscription.unsubscribe();
  }, []);

  return result;
}

export function useAdminResult(): AdminResult | null {
  const [result, setResult] = useState<AdminResult | null>(null);

  useEffect(() => {
    const subscription = chatService.adminResult$.subscribe(setResult);
    return () => subscription.unsubscribe();
  }, []);

  return result;
}

export function useChatActions() {
  const register = useCallback((username: string, password: string, color: string) => {
    chatService.register(username, password, color);
  }, []);

  const login = useCallback((username: string, password: string) => {
    chatService.login(username, password);
  }, []);

  const guestJoin = useCallback((username: string, color: string) => {
    chatService.guestJoin(username, color);
  }, []);

  const sendMessage = useCallback((text: string) => {
    chatService.sendMessage(text);
  }, []);

  return { register, login, guestJoin, sendMessage };
}

export function useAdminActions() {
  const resetPassword = useCallback((targetUsername: string, newPassword: string) => {
    chatService.resetPassword(targetUsername, newPassword);
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    chatService.deleteMessage(messageId);
  }, []);

  const kickUser = useCallback((targetUsername: string) => {
    chatService.kickUser(targetUsername);
  }, []);

  return { resetPassword, deleteMessage, kickUser };
}

// Room hooks
export function useRooms(): Room[] {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const subscription = chatService.rooms$.subscribe(setRooms);
    return () => subscription.unsubscribe();
  }, []);

  return rooms;
}

export function useCurrentRoom(): Room | null {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  useEffect(() => {
    const subscription = chatService.currentRoom$.subscribe(setCurrentRoom);
    return () => subscription.unsubscribe();
  }, []);

  return currentRoom;
}

export function useRoomResult(): RoomResult | null {
  const [result, setResult] = useState<RoomResult | null>(null);

  useEffect(() => {
    const subscription = chatService.roomResult$.subscribe(setResult);
    return () => subscription.unsubscribe();
  }, []);

  return result;
}

export function useRoomUsers(): User[] {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const subscription = chatService.roomUsers$.subscribe(setUsers);
    return () => subscription.unsubscribe();
  }, []);

  return users;
}

export function useRoomActions() {
  const createRoom = useCallback((name: string, description: string, isPublic: boolean) => {
    chatService.createRoom(name, description, isPublic);
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    chatService.joinRoom(roomId);
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    chatService.leaveRoom(roomId);
  }, []);

  const getRooms = useCallback(() => {
    chatService.getRooms();
  }, []);

  const getMyRooms = useCallback(() => {
    chatService.getMyRooms();
  }, []);

  return { createRoom, joinRoom, leaveRoom, getRooms, getMyRooms };
}
