import { useState, useCallback } from 'react';
import AuthForm from './components/AuthForm';
import ChatRoom from './components/ChatRoom';
import RoomList from './components/RoomList';
import CreateRoom from './components/CreateRoom';
import { chatService } from './services/ChatService';
import type { Room } from './types/chat';
import './App.css';

interface AuthenticatedUser {
  username: string;
  color: string;
  isGuest: boolean;
  isAdmin: boolean;
}

type View = 'auth' | 'rooms' | 'chat' | 'createRoom';

function App() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [view, setView] = useState<View>('auth');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const handleAuthSuccess = useCallback((username: string, color: string, isGuest: boolean, isAdmin: boolean) => {
    setUser({ username, color, isGuest, isAdmin });
    setView('rooms');
  }, []);

  const handleLogout = useCallback(() => {
    chatService.disconnect();
    setUser(null);
    setCurrentRoom(null);
    setView('auth');
    // Reconnect so the auth form can work again
    chatService.reconnect();
  }, []);

  const handleJoinRoom = useCallback((room: Room) => {
    setCurrentRoom(room);
    setView('chat');
  }, []);

  const handleLeaveRoom = useCallback(() => {
    if (currentRoom) {
      chatService.leaveRoom(currentRoom.id);
    }
    setCurrentRoom(null);
    setView('rooms');
  }, [currentRoom]);

  const handleCreateRoom = useCallback(() => {
    setView('createRoom');
  }, []);

  const handleRoomCreated = useCallback((room: Room) => {
    setCurrentRoom(room);
    setView('chat');
    // Join the room we just created
    chatService.joinRoom(room.id);
  }, []);

  const handleCancelCreate = useCallback(() => {
    setView('rooms');
  }, []);

  return (
    <div className="app">
      {view === 'auth' && (
        <AuthForm onSuccess={handleAuthSuccess} />
      )}
      {view === 'rooms' && user && (
        <div className="rooms-container">
          <header className="rooms-header">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </header>
          <RoomList
            username={user.username}
            isGuest={user.isGuest}
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
          />
        </div>
      )}
      {view === 'chat' && user && currentRoom && (
        <ChatRoom
          username={user.username}
          color={user.color}
          isAdmin={user.isAdmin}
          isGuest={user.isGuest}
          room={currentRoom}
          onLogout={handleLogout}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
      {view === 'createRoom' && user && (
        <CreateRoom
          onSuccess={handleRoomCreated}
          onCancel={handleCancelCreate}
        />
      )}
    </div>
  );
}

export default App;
