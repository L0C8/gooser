import { useEffect, useRef } from 'react';
import type { Message } from '../types/chat';
import { useAdminActions } from '../hooks/useChat';

const SERVER_PORT = 3001;

function getAvatarUrl(username: string): string {
  return `${window.location.protocol}//${window.location.hostname}:${SERVER_PORT}/avatar/${encodeURIComponent(username)}`;
}

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  isAdmin: boolean;
}

export default function MessageList({ messages, currentUser, isAdmin }: MessageListProps) {
  const { deleteMessage } = useAdminActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (messageId: string) => {
    if (confirm('Delete this message?')) {
      deleteMessage(messageId);
    }
  };

  return (
    <div className="message-list">
      {messages.map((msg, index) => {
        const messageId = msg.type === 'user' ? msg.id : msg.id;
        return (
          <div
            key={messageId || index}
            className={`message ${msg.type} ${msg.type === 'user' && msg.username === currentUser ? 'own' : ''}`}
          >
            {msg.type === 'system' ? (
              <span className="system-text">{msg.text}</span>
            ) : (
              <div className="message-content">
                <img
                  src={`${getAvatarUrl(msg.username)}?t=${msg.timestamp}`}
                  alt={`${msg.username}'s avatar`}
                  className="message-avatar"
                />
                <div className="message-body">
                  <span className="username" style={{ color: msg.color }}>{msg.username}</span>
                  <span className="text">{msg.text}</span>
                  <span className="time">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            )}
            {isAdmin && messageId && (
              <button
                className="delete-message-btn"
                onClick={() => handleDelete(messageId)}
                title="Delete message"
              >
                x
              </button>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
