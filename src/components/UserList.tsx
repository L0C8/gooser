import type { User } from '../types/chat';
import { useAdminActions } from '../hooks/useChat';

const SERVER_PORT = 3001;

function getAvatarUrl(username: string): string {
  return `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}/avatar/${encodeURIComponent(username)}`;
}

interface UserListProps {
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  currentUsername: string;
}

export default function UserList({ users, isOpen, onClose, isAdmin, currentUsername }: UserListProps) {
  const { kickUser } = useAdminActions();
  const onlineUsers = users.filter(user => user.isOnline);
  // Only show registered users (non-guests) in offline section
  const offlineUsers = users.filter(user => !user.isOnline && !user.isGuest);

  const handleKick = (username: string) => {
    if (confirm(`Kick ${username} from the chat?`)) {
      kickUser(username);
    }
  };

  const renderUser = (user: User, index: number) => {
    const showActions = user.isAdmin || (isAdmin && user.username !== currentUsername && user.isOnline);
    return (
      <li
        key={`${user.username}-${index}`}
        className={user.isOnline ? '' : 'offline'}
      >
        <img
          src={`${getAvatarUrl(user.username)}?v=1`}
          alt={`${user.username}'s avatar`}
          className="avatar avatar-small"
        />
        <span className="user-name" style={{ color: user.color }}>{user.username}</span>
        {showActions && (
          <span className="user-actions">
            {user.isAdmin && (
              <span className="admin-badge" aria-label="Admin">
                Admin
              </span>
            )}
            {isAdmin && user.username !== currentUsername && user.isOnline && (
              <button
                className="kick-user-btn"
                onClick={() => handleKick(user.username)}
                title={`Kick ${user.username}`}
              >
                Kick
              </button>
            )}
          </span>
        )}
      </li>
    );
  };

  return (
    <>
      <div
        className={`user-list-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`user-list ${isOpen ? 'open' : ''}`}>
        <div className="user-list-header">
          <h3>Users ({users.length})</h3>
          <button className="user-list-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="user-list-section">
          <div className="user-list-section-title">Online ({onlineUsers.length})</div>
          <ul>
            {onlineUsers.map((user, index) => renderUser(user, index))}
          </ul>
        </div>
        <div className="user-list-section">
          <div className="user-list-section-title">Offline ({offlineUsers.length})</div>
          <ul>
            {offlineUsers.map((user, index) => renderUser(user, index))}
          </ul>
        </div>
      </div>
    </>
  );
}
