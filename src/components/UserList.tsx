import type { User } from '../types/chat';
import { useAdminActions } from '../hooks/useChat';

interface UserListProps {
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  currentUsername: string;
}

export default function UserList({ users, isOpen, onClose, isAdmin, currentUsername }: UserListProps) {
  const { kickUser } = useAdminActions();

  const handleKick = (username: string) => {
    if (confirm(`Kick ${username} from the chat?`)) {
      kickUser(username);
    }
  };

  return (
    <>
      <div
        className={`user-list-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`user-list ${isOpen ? 'open' : ''}`}>
        <div className="user-list-header">
          <h3>Online ({users.length})</h3>
          <button className="user-list-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <ul>
          {users.map((user, index) => {
            const showActions = user.isAdmin || (isAdmin && user.username !== currentUsername);
            return (
              <li key={index} style={{ color: user.color }}>
                <span className="user-name">{user.username}</span>
                {showActions && (
                  <span className="user-actions">
                    {user.isAdmin && (
                      <span className="admin-badge" aria-label="Admin">
                        👑 Admin
                      </span>
                    )}
                    {isAdmin && user.username !== currentUsername && (
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
          })}
        </ul>
      </div>
    </>
  );
}
