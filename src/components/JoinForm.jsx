import { useState } from 'react';

export default function JoinForm({ onJoin }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim());
    }
  };

  return (
    <div className="join-form">
      <h1>Gooser Chat</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          autoFocus
        />
        <button type="submit">Join Chat</button>
      </form>
    </div>
  );
}
