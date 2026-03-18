/**
 * Navbar – top navigation bar.
 *
 * Shows different links based on authentication / admin status:
 *   - Public:       Rooms
 *   - Authenticated: My Bookings, My Reviews, Logout
 *   - Admin extras: Admin → Users, Admin → Bookings
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>SoftDream</Link>

      <div style={styles.links}>
        <Link to="/rooms" style={styles.link}>Rooms</Link>

        {user ? (
          <>
            <Link to="/my-bookings" style={styles.link}>My Bookings</Link>
            <Link to="/my-reviews"  style={styles.link}>My Reviews</Link>
            {isAdmin && (
              <>
                <Link to="/admin/users"    style={styles.link}>Admin: Users</Link>
                <Link to="/admin/bookings" style={styles.link}>Admin: Bookings</Link>
              </>
            )}
            <span style={styles.username}>{user.username}</span>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"    style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.5rem',
    background: '#1a1a2e',
    color: '#fff',
  },
  brand: {
    color: '#e94560',
    fontWeight: 700,
    fontSize: '1.2rem',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
  },
  username: {
    color: '#a0a0b0',
    fontSize: '0.9rem',
  },
  button: {
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.3rem 0.8rem',
    cursor: 'pointer',
  },
};
