import { useState } from 'react';
import JoinForm from './components/JoinForm';
import ChatRoom from './components/ChatRoom';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="app">
      {user ? (
        <ChatRoom username={user.username} color={user.color} />
      ) : (
        <JoinForm onJoin={setUser} />
      )}
    </div>
  );
}

export default App;
