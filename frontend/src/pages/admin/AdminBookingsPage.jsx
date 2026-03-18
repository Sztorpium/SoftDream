/**
 * AdminBookingsPage – admin view of all bookings.
 *
 * GET   /api/bookings                      [ADMIN]
 * PATCH /api/bookings/{bookingId}/confirm  [ADMIN]
 * DELETE /api/bookings/{bookingId}         [ADMIN]
 */

import { useEffect, useState } from 'react';
import { confirmBooking, deleteBooking, getAllBookings } from '../../api/bookings';

const STATUS_COLOR = {
  CONFIRMED: 'green',
  PENDING:   '#f0a500',
  CANCELLED: '#999',
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setBookings(await getAllBookings());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(bookingId) {
    try {
      const updated = await confirmBooking(bookingId);
      setBookings(prev => prev.map(b => b.bookingId === bookingId ? updated : b));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(bookingId) {
    if (!confirm('Delete this booking permanently?')) return;
    try {
      await deleteBooking(bookingId);
      setBookings(prev => prev.filter(b => b.bookingId !== bookingId));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p style={styles.status}>Loading…</p>;
  if (error)   return <p style={{ ...styles.status, color: 'red' }}>{error}</p>;

  return (
    <div style={styles.page}>
      <h1>Admin – All Bookings</h1>
      <p style={styles.count}>{bookings.length} bookings total</p>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Room</th>
              <th style={styles.th}>Check-in</th>
              <th style={styles.th}>Check-out</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.bookingId} style={styles.tr}>
                <td style={styles.td}>{b.bookingId}</td>
                <td style={styles.td}>{b.username}</td>
                <td style={styles.td}>{b.roomNumber}</td>
                <td style={styles.td}>{b.checkIn}</td>
                <td style={styles.td}>{b.checkOut}</td>
                <td style={{ ...styles.td, color: STATUS_COLOR[b.status] ?? '#333', fontWeight: 600 }}>{b.status}</td>
                <td style={styles.td}>
                  {b.status === 'PENDING' && (
                    <button onClick={() => handleConfirm(b.bookingId)} style={styles.confirmBtn}>
                      Confirm
                    </button>
                  )}
                  <button onClick={() => handleDelete(b.bookingId)} style={styles.deleteBtn}>
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
  confirmBtn:{ marginRight: '0.4rem', padding: '0.25rem 0.6rem', background: 'green', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { padding: '0.25rem 0.6rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};
