/**
 * BookingCreatePage – create a new booking.
 *
 * Reads optional `roomId` from the query string (pre-filled when navigating
 * from the room detail page).
 *
 * GET  /api/rooms           – to populate the room selector
 * POST /api/bookings        – { roomId, checkIn, checkOut }
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllRooms } from '../api/rooms';
import { createBooking } from '../api/bookings';

export default function BookingCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    roomId:   searchParams.get('roomId') ?? '',
    checkIn:  '',
    checkOut: '',
  });

  useEffect(() => {
    getAllRooms()
      .then(setRooms)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createBooking({
        roomId:   Number(form.roomId),
        checkIn:  form.checkIn,
        checkOut: form.checkOut,
      });
      navigate('/my-bookings');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={styles.status}>Loading rooms…</p>;

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>New Booking</h2>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>
          Room
          <select name="roomId" value={form.roomId} onChange={handleChange} required style={styles.input}>
            <option value="">— select a room —</option>
            {rooms.map(r => (
              <option key={r.roomId} value={r.roomId}>
                {r.roomNumber} – {r.type} (${r.basePrice}/night)
              </option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Check-in
          <input name="checkIn" type="date" min={today} value={form.checkIn} onChange={handleChange} required style={styles.input} />
        </label>

        <label style={styles.label}>
          Check-out
          <input name="checkOut" type="date" min={form.checkIn || today} value={form.checkOut} onChange={handleChange} required style={styles.input} />
        </label>

        <button type="submit" disabled={saving} style={styles.button}>
          {saving ? 'Booking…' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '3rem 1rem' },
  status:    { padding: '1.5rem', textAlign: 'center' },
  card:  { display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '440px', padding: '2rem', border: '1px solid #333', borderRadius: '8px' },
  title: { margin: 0 },
  error: { color: 'red', margin: 0 },
  label: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem' },
  input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #555', fontSize: '1rem' },
  button: { padding: '0.6rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
};
