import { useState, useEffect } from 'react';
import { useRooms, useRoomActions, useRoomResult } from '../hooks/useChat';
import type { Room } from '../types/chat';

interface RoomListProps {
  username: string;
  isGuest: boolean;
  onJoinRoom: (room: Room) => void;
  onCreateRoom: () => void;
}

export default function RoomList({ username, isGuest, onJoinRoom, onCreateRoom }: RoomListProps) {
  const rooms = useRooms();
  const roomResult = useRoomResult();
  const { joinRoom, getMyRooms } = useRoomActions();
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    getMyRooms();
  }, [getMyRooms]);

  useEffect(() => {
    if (roomResult?.success && roomResult.room) {
      onJoinRoom(roomResult.room);
      setJoining(null);
    } else if (roomResult && !roomResult.success) {
      setJoining(null);
    }
  }, [roomResult, onJoinRoom]);

  const handleJoinRoom = (roomId: string) => {
    setJoining(roomId);
    joinRoom(roomId);
  };

  const myRooms = rooms.filter(r => r.members.includes(username.toLowerCase()));
  const publicRooms = rooms.filter(r => r.isPublic && !r.members.includes(username.toLowerCase()));

  return (
    <div className="room-list-page">
      <div className="room-list-header">
        <h1>Gooser Chat</h1>
        <p>Welcome, <span className="username">{username}</span>{isGuest && ' (Guest)'}</p>
      </div>

      <div className="room-list-content">
        {!isGuest && (
          <section className="room-section">
            <div className="section-header">
              <h2>My Rooms</h2>
              <button className="create-room-btn" onClick={onCreateRoom}>
                + Create Room
              </button>
            </div>
            {myRooms.length === 0 ? (
              <p className="empty-message">You haven't joined any rooms yet. Create one or join a public room below.</p>
            ) : (
              <div className="room-grid">
                {myRooms.map(room => (
                  <div key={room.id} className="room-card member">
                    <h3>{room.name}</h3>
                    {room.description && <p className="room-description">{room.description}</p>}
                    <div className="room-meta">
                      <span className="member-count">{room.members.length} member{room.members.length !== 1 ? 's' : ''}</span>
                      {room.isPublic ? (
                        <span className="room-badge public">Public</span>
                      ) : (
                        <span className="room-badge private">Private</span>
                      )}
                    </div>
                    <button
                      className="join-btn"
                      onClick={() => handleJoinRoom(room.id)}
                      disabled={joining === room.id}
                    >
                      {joining === room.id ? 'Joining...' : 'Enter'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="room-section">
          <div className="section-header">
            <h2>Public Rooms</h2>
          </div>
          {publicRooms.length === 0 && myRooms.length === 0 && rooms.length === 0 ? (
            <p className="empty-message">No rooms available. {!isGuest ? 'Create the first one!' : 'Register to create rooms.'}</p>
          ) : publicRooms.length === 0 ? (
            <p className="empty-message">No other public rooms available.</p>
          ) : (
            <div className="room-grid">
              {publicRooms.map(room => (
                <div key={room.id} className="room-card">
                  <h3>{room.name}</h3>
                  {room.description && <p className="room-description">{room.description}</p>}
                  <div className="room-meta">
                    <span className="member-count">{room.members.length} member{room.members.length !== 1 ? 's' : ''}</span>
                    <span className="room-badge public">Public</span>
                  </div>
                  <button
                    className="join-btn"
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={joining === room.id}
                  >
                    {joining === room.id ? 'Joining...' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {roomResult && !roomResult.success && (
        <div className="room-error">{roomResult.error}</div>
      )}
    </div>
  );
}
