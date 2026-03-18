/**
 * MyBookingsPage – authenticated user's booking list.
 *
 * GET  /api/bookings/my-bookings         – own bookings
 * PATCH /api/bookings/{bookingId}/cancel  – cancel a booking
 */

import { useEffect, useState } from 'react';
import { cancelBooking, getMyBookings } from '../api/bookings';

const STATUS_COLOR = {
  CONFIRMED: 'green',
  PENDING:   '#f0a500',
  CANCELLED: '#999',
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setBookings(await getMyBookings());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId) {
    if (!confirm('Cancel this booking?')) return;
    try {
      const updated = await cancelBooking(bookingId);
      setBookings(prev => prev.map(b => b.bookingId === bookingId ? updated : b));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p style={styles.status}>Loading…</p>;
  if (error)   return <p style={{ ...styles.status, color: 'red' }}>{error}</p>;

  return (
    <div style={styles.page}>
      <h1>My Bookings</h1>

      {bookings.length === 0 && <p>You have no bookings yet.</p>}

      <div style={styles.list}>
        {bookings.map(b => (
          <div key={b.bookingId} style={styles.card}>
            <div style={styles.row}>
              <span style={styles.room}>Room {b.roomNumber}</span>
              <span style={{ color: STATUS_COLOR[b.status] ?? '#333', fontWeight: 600 }}>{b.status}</span>
            </div>
            <p style={styles.dates}>{b.checkIn} → {b.checkOut}</p>
            <p style={styles.meta}>Booking #{b.bookingId} · created {new Date(b.createdAt).toLocaleDateString()}</p>
            {b.status !== 'CANCELLED' && (
              <button onClick={() => handleCancel(b.bookingId)} style={styles.cancelBtn}>
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page:      { padding: '1.5rem' },
  status:    { padding: '1.5rem', textAlign: 'center' },
  list:      { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' },
  card:      { padding: '1rem 1.25rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' },
  row:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' },
  room:      { fontWeight: 700, fontSize: '1rem' },
  dates:     { margin: '0.25rem 0', color: '#444' },
  meta:      { margin: '0 0 0.75rem', color: '#888', fontSize: '0.8rem' },
  cancelBtn: { padding: '0.3rem 0.8rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};
