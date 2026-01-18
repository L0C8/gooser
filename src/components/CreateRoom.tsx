import { useState, useEffect, FormEvent } from 'react';
import { useRoomActions, useRoomResult } from '../hooks/useChat';
import type { Room } from '../types/chat';

interface CreateRoomProps {
  onSuccess: (room: Room) => void;
  onCancel: () => void;
}

export default function CreateRoom({ onSuccess, onCancel }: CreateRoomProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { createRoom } = useRoomActions();
  const roomResult = useRoomResult();

  useEffect(() => {
    if (roomResult) {
      setLoading(false);
      if (roomResult.success && roomResult.room) {
        onSuccess(roomResult.room);
      } else if (!roomResult.success && roomResult.error) {
        setError(roomResult.error);
      }
    }
  }, [roomResult, onSuccess]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Room name is required');
      return;
    }

    if (name.length < 2 || name.length > 50) {
      setError('Room name must be 2-50 characters');
      return;
    }

    setLoading(true);
    createRoom(name.trim(), description.trim(), isPublic);
  };

  return (
    <div className="create-room-overlay">
      <div className="create-room-modal">
        <h2>Create New Room</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="room-name">Room Name</label>
            <input
              id="room-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name"
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="room-description">Description (optional)</label>
            <textarea
              id="room-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this room about?"
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span>Public room (anyone can join)</span>
            </label>
          </div>

          {error && <div className="create-room-error">{error}</div>}

          <div className="create-room-buttons">
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
