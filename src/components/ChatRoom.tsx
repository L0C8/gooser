import { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import AvatarUpload from './AvatarUpload';
import { useMessages, useRoomUsers, useChatActions } from '../hooks/useChat';
import type { Room } from '../types/chat';

const SERVER_PORT = 3001;

function getAvatarUrl(username: string): string {
  return `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}/avatar/${encodeURIComponent(username)}`;
}

interface ChatRoomProps {
  username: string;
  color: string;
  isAdmin: boolean;
  isGuest: boolean;
  room: Room;
  onLogout: () => void;
  onLeaveRoom: () => void;
}

export default function ChatRoom({ username, color, isAdmin, isGuest, room, onLogout, onLeaveRoom }: ChatRoomProps) {
  const messages = useMessages();
  const users = useRoomUsers();
  const onlineCount = users.filter(user => user.isOnline).length;
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
          <div className="header-left">
            <button className="back-btn" onClick={onLeaveRoom} title="Back to rooms">
              &larr;
            </button>
            <div className="room-info">
              <h2>{room.name}</h2>
              {room.description && <span className="room-desc">{room.description}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={`${getAvatarUrl(username)}?t=${avatarKey}`}
              alt="Your avatar"
              className="avatar"
              style={{ cursor: isGuest ? 'default' : 'pointer' }}
              onClick={() => !isGuest && setShowAvatarUpload(true)}
              title={isGuest ? 'Guests cannot change avatar' : 'Click to change avatar'}
            />
            <span className="user-info">
              <span style={{ color }}>{username}</span>
              {isAdmin && <span className="admin-tag">(Admin)</span>}
            </span>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
            <button
              className="mobile-users-toggle"
              onClick={() => setShowUsers(true)}
            >
              Users ({onlineCount}/{users.length})
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
