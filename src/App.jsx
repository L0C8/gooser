import { useState } from 'react';
import JoinForm from './components/JoinForm';
import ChatRoom from './components/ChatRoom';
import './App.css';

function App() {
  const [username, setUsername] = useState(null);

  return (
    <div className="app">
      {username ? (
        <ChatRoom username={username} />
      ) : (
        <JoinForm onJoin={setUsername} />
      )}
    </div>
  );
}

export default App;
