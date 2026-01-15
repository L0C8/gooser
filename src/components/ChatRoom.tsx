import { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import AvatarUpload from './AvatarUpload';
import { useMessages, useUsers, useChatActions } from '../hooks/useChat';

const SERVER_PORT = 3001;

function getAvatarUrl(username: string): string {
  return `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}/avatar/${encodeURIComponent(username)}`;
}

interface ChatRoomProps {
  username: string;
  color: string;
  isAdmin: boolean;
  isGuest: boolean;
  onLogout: () => void;
}

export default function ChatRoom({ username, color, isAdmin, isGuest, onLogout }: ChatRoomProps) {
  const messages = useMessages();
  const users = useUsers();
  const { sendMessage } = useChatActions();
  const [showUsers, setShowUsers] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Force refresh after upload

  const handleAvatarUploadSuccess = () => {
    setAvatarKey(Date.now()); // Force avatar refresh
  };

  return (
    <div className="chat-room">
      <div className="chat-main">
        <header>
          <h2>Gooser Chat</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={`${getAvatarUrl(username)}?t=${avatarKey}`}
              alt="Your avatar"
              className="avatar"
              style={{ cursor: isGuest ? 'default' : 'pointer' }}
              onClick={() => !isGuest && setShowAvatarUpload(true)}
              title={isGuest ? 'Guests cannot change avatar' : 'Click to change avatar'}
            />
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
        isAdmin={isAdmin}
        currentUsername={username}
      />
      {showAvatarUpload && (
        <AvatarUpload
          username={username}
          currentAvatarUrl={`${getAvatarUrl(username)}?t=${avatarKey}`}
          onUploadSuccess={handleAvatarUploadSuccess}
          onClose={() => setShowAvatarUpload(false)}
        />
      )}
    </div>
  );
}
