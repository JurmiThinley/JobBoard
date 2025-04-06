import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Feed from './components/Feed';
import Messages from './components/Messages';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <div className="container">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Feed user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/messages" 
              element={user ? <Messages user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;