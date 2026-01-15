import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';

// Connect to the server on the same host (works for LAN access)
const SERVER_PORT = 3001;
const socket = io(`${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}`);

export default function ChatRoom({ username, color }) {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    socket.emit('join', { username, color });

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('users', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('message');
      socket.off('users');
    };
  }, [username, color]);

  const handleSend = (text) => {
    socket.emit('chat', text);
  };

  return (
    <div className="chat-room">
      <div className="chat-main">
        <header>
          <h2>Gooser Chat</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>Logged in as <span style={{ color }}>{username}</span></span>
            <button
              className="mobile-users-toggle"
              onClick={() => setShowUsers(true)}
            >
              Users ({users.length})
            </button>
          </div>
        </header>
        <MessageList messages={messages} currentUser={username} />
        <MessageInput onSend={handleSend} />
      </div>
      <UserList
        users={users}
        isOpen={showUsers}
        onClose={() => setShowUsers(false)}
      />
    </div>
  );
}
