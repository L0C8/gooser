import type { User } from '../types/chat';

interface UserListProps {
  users: User[];
  isOpen: boolean;
  onClose: () => void;
}

export default function UserList({ users, isOpen, onClose }: UserListProps) {
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
          {users.map((user, index) => (
            <li key={index} style={{ color: user.color }}>
              <span className="user-name">{user.username}</span>
              {user.isAdmin && (
                <span className="admin-badge" aria-label="Admin">
                  👑 Admin
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
