import { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import { useMessages, useUsers, useChatActions } from '../hooks/useChat';

interface ChatRoomProps {
  username: string;
  color: string;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function ChatRoom({ username, color, isAdmin, onLogout }: ChatRoomProps) {
  const messages = useMessages();
  const users = useUsers();
  const { sendMessage } = useChatActions();
  const [showUsers, setShowUsers] = useState(false);

  return (
    <div className="chat-room">
      <div className="chat-main">
        <header>
          <h2>Gooser Chat</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>Logged in as <span style={{ color }}>{username}</span>{isAdmin && ' (Admin)'}</span>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
            <button
              className="mobile-users-toggle"
              onClick={() => setShowUsers(true)}
            >
              Users ({users.length})
            </button>
          </div>
        </header>
        <MessageList messages={messages} currentUser={username} isAdmin={isAdmin} />
        <MessageInput onSend={sendMessage} />
      </div>
      <UserList
        users={users}
        isOpen={showUsers}
        onClose={() => setShowUsers(false)}
      />
    </div>
  );
}
