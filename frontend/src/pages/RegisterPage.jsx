/**
 * RegisterPage – POST /api/auth/register
 *
 * Fields  : username, email, phone, password
 * Success : navigate to /
 * Errors  : display error message from the API
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const INITIAL = { username: '', email: '', phone: '', password: '' };

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form,  setForm]  = useState(INITIAL);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message ?? 'Registration failed.');
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Register</h2>

        {error && <p style={styles.error}>{error}</p>}

        {[
          { name: 'username', label: 'Username',     type: 'text' },
          { name: 'email',    label: 'Email',         type: 'email' },
          { name: 'phone',    label: 'Phone',         type: 'tel' },
          { name: 'password', label: 'Password',      type: 'password' },
        ].map(({ name, label, type }) => (
          <label key={name} style={styles.label}>
            {label}
            <input
              name={name}
              type={type}
              value={form[name]}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </label>
        ))}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Registering…' : 'Register'}
        </button>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Login</Link>
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
