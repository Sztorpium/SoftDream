/**
 * LoginPage – POST /api/auth/login
 *
 * Fields  : username, password
 * Success : navigate to the originally requested page (or /)
 * Errors  : display error message from the API
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from   = location.state?.from?.pathname ?? '/';
  const search = location.state?.from?.search   ?? '';

  const [form,  setForm]  = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(form);
      navigate(from + search, { replace: true });
    } catch (err) {
      setError(err.message ?? 'Login failed.');
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>
          Username
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </label>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Logging in…' : 'Login'}
        </button>

        <p style={styles.footer}>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '3rem 1rem' },
  card:  { display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px', padding: '2rem', border: '1px solid #333', borderRadius: '8px' },
  title: { margin: 0 },
  error: { color: 'red', margin: 0 },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem' },
  input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #555', fontSize: '1rem' },
  button: { padding: '0.6rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  footer: { textAlign: 'center', margin: 0 },
};
