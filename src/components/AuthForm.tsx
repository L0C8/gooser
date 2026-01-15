import { useState, useEffect, FormEvent } from 'react';
import { useAuthResult, useChatActions } from '../hooks/useChat';

type AuthMode = 'login' | 'register' | 'guest';

interface ColorOption {
  name: string;
  value: string;
}

const PRESET_COLORS: ColorOption[] = [
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

interface AuthFormProps {
  onSuccess: (username: string, color: string, isGuest: boolean, isAdmin: boolean) => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[6].value);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authResult = useAuthResult();
  const { register, login, guestJoin } = useChatActions();

  useEffect(() => {
    if (authResult) {
      setIsSubmitting(false);
      if (authResult.success) {
        onSuccess(username, selectedColor, mode === 'guest', authResult.isAdmin ?? false);
      } else {
        setError(authResult.error || 'An error occurred');
      }
    }
  }, [authResult, username, selectedColor, mode, onSuccess]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const trimmedUsername = username.trim();

    if (mode === 'login') {
      login(trimmedUsername, password);
    } else if (mode === 'register') {
      register(trimmedUsername, password, selectedColor);
    } else {
      guestJoin(trimmedUsername, selectedColor);
    }
  };

  return (
    <div className="auth-form">
      <h1>Gooser Chat</h1>

      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => { setMode('login'); setError(''); }}
        >
          Login
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => { setMode('register'); setError(''); }}
        >
          Register
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === 'guest' ? 'active' : ''}`}
          onClick={() => { setMode('guest'); setError(''); }}
        >
          Guest
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoFocus
          required
        />

        {mode !== 'guest' && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        )}

        {(mode === 'register' || mode === 'guest') && (
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
        )}

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : (
            mode === 'login' ? 'Login' :
            mode === 'register' ? 'Create Account' :
            'Join as Guest'
          )}
        </button>
      </form>

      <p className="auth-hint">
        {mode === 'login' && "Don't have an account? Register or join as guest."}
        {mode === 'register' && "Create an account to save your username and color."}
        {mode === 'guest' && "Guest accounts are temporary and cannot be recovered."}
      </p>
    </div>
  );
}
