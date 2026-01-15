export default function UserList({ users, isOpen, onClose }) {
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
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
