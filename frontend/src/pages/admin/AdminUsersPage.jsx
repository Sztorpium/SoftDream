/**
 * AdminUsersPage – admin view of all registered users.
 *
 * GET    /api/users          [ADMIN]
 * DELETE /api/users/{userId} [ADMIN]
 */

import { useEffect, useState } from 'react';
import { deleteUser, getAllUsers } from '../../api/users';

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setUsers(await getAllUsers());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(userId, username) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.userId !== userId));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p style={styles.status}>Loading…</p>;
  if (error)   return <p style={{ ...styles.status, color: 'red' }}>{error}</p>;

  return (
    <div style={styles.page}>
      <h1>Admin – All Users</h1>
      <p style={styles.count}>{users.length} users total</p>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.userId} style={styles.tr}>
                <td style={styles.td}>{u.userId}</td>
                <td style={styles.td}>{u.username}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.phone}</td>
                <td style={styles.td}>{u.role}</td>
                <td style={styles.td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                <td style={styles.td}>
                  <button onClick={() => handleDelete(u.userId, u.username)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page:      { padding: '1.5rem' },
  status:    { padding: '1.5rem', textAlign: 'center' },
  count:     { color: '#666', marginTop: 0 },
  tableWrap: { overflowX: 'auto' },
  table:     { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th:        { padding: '0.6rem 0.8rem', background: '#1a1a2e', color: '#fff', textAlign: 'left', whiteSpace: 'nowrap' },
  tr:        { borderBottom: '1px solid #eee' },
  td:        { padding: '0.55rem 0.8rem' },
  deleteBtn: { padding: '0.25rem 0.6rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};
