/**
 * RoomsPage – public listing of all rooms with availability search.
 *
 * GET /api/rooms                          – all rooms (initial load)
 * GET /api/rooms/available?checkIn&checkOut – filtered by date range
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAvailableRooms, getAllRooms } from '../api/rooms';

export default function RoomsPage() {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [checkIn,  setCheckIn]  = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    fetchAllRooms();
  }, []);

  async function fetchAllRooms() {
    setLoading(true);
    setError('');
    try {
      const data = await getAllRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    setLoading(true);
    setError('');
    try {
      const data = await getAvailableRooms(checkIn, checkOut);
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setCheckIn('');
    setCheckOut('');
    fetchAllRooms();
  }

  return (
    <div style={styles.page}>
      <h1>Rooms</h1>

      {/* Availability search */}
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <label style={styles.label}>
          Check-in
          <input type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)} style={styles.input} />
        </label>
        <label style={styles.label}>
          Check-out
          <input type="date" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)} style={styles.input} />
        </label>
        <button type="submit" style={styles.button}>Search</button>
        <button type="button" onClick={handleReset} style={styles.resetBtn}>Reset</button>
      </form>

      {error   && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading…</p>}

      {!loading && !error && rooms.length === 0 && (
        <p>No rooms found.</p>
      )}

      <div style={styles.grid}>
        {rooms.map(room => (
          <Link key={room.roomId} to={`/rooms/${room.roomId}`} style={styles.cardLink}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Room {room.roomNumber}</h3>
              <p style={styles.cardType}>{room.type}</p>
              <p>Floor: {room.floor}</p>
              <p>Max guests: {room.maxGuests}</p>
              <p>Status: <span style={{ color: room.status === 'AVAILABLE' ? 'green' : '#e94560' }}>{room.status}</span></p>
              <p style={styles.price}>
                {room.basePrice != null ? `$${room.basePrice}/night` : ''}
              </p>
              {room.averageRating != null && (
                <p>⭐ {room.averageRating.toFixed(1)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page:       { padding: '1.5rem' },
  searchForm: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' },
  label:      { display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' },
  input:      { padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #ccc' },
  button:     { padding: '0.45rem 1rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  resetBtn:   { padding: '0.45rem 1rem', background: '#888', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  cardLink:   { textDecoration: 'none', color: 'inherit' },
  card:       { padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', transition: 'box-shadow 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle:  { margin: '0 0 0.25rem', fontWeight: 700 },
  cardType:   { margin: '0 0 0.5rem', color: '#666', fontSize: '0.85rem' },
  price:      { fontWeight: 600, color: '#1a1a2e' },
};
