import { useState } from 'react';

const PRESET_COLORS = [
  { name: 'Red', value: '#ff6b6b' },
  { name: 'Orange', value: '#ffa94d' },
  { name: 'Yellow', value: '#ffd43b' },
  { name: 'Green', value: '#69db7c' },
  { name: 'Teal', value: '#38d9a9' },
  { name: 'Cyan', value: '#66d9e8' },
  { name: 'Blue', value: '#74c0fc' },
  { name: 'Purple', value: '#b197fc' },
  { name: 'Pink', value: '#f783ac' },
  { name: 'White', value: '#ffffff' },
];

export default function JoinForm({ onJoin }) {
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[6].value); // Default blue

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin({ username: username.trim(), color: selectedColor });
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
        <div className="color-picker">
          <label>Choose your color:</label>
          <div className="color-options">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => setSelectedColor(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>
        <button type="submit">Join Chat</button>
      </form>
    </div>
  );
}
