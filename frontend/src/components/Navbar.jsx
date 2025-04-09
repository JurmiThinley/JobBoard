import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">SocialApp</Link>
      </div>
      <div className="nav-menu">
        <Link to="/" className="nav-item">Feed</Link>
        <Link to="/messages" className="nav-item">Messages</Link>
      </div>
      <div className="nav-user">
        <span className="user-name">{user.name}</span>
        <img src={user.avatar || "https://via.placeholder.com/40"} alt={user.name} className="user-avatar" />
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;