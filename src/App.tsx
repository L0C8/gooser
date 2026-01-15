import { useState, useCallback } from 'react';
import AuthForm from './components/AuthForm';
import ChatRoom from './components/ChatRoom';
import { chatService } from './services/ChatService';
import './App.css';

interface AuthenticatedUser {
  username: string;
  color: string;
  isGuest: boolean;
  isAdmin: boolean;
}

function App() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  const handleAuthSuccess = useCallback((username: string, color: string, isGuest: boolean, isAdmin: boolean) => {
    setUser({ username, color, isGuest, isAdmin });
  }, []);

  const handleLogout = useCallback(() => {
    chatService.disconnect();
    setUser(null);
    // Reconnect so the auth form can work again
    chatService.reconnect();
  }, []);

  return (
    <div className="app">
      {user ? (
        <ChatRoom username={user.username} color={user.color} isAdmin={user.isAdmin} onLogout={handleLogout} />
      ) : (
        <AuthForm onSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;
