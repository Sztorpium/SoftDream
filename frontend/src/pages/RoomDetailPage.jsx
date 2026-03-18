/**
 * RoomDetailPage – public detail view for a single room.
 *
 * GET /api/rooms/{roomId}               – room info
 * GET /api/reviews/room/{roomId}        – room reviews
 *
 * Includes a "Book this room" button that links authenticated users to the
 * booking creation form, or redirects to /login if not authenticated.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getRoomById } from '../api/rooms';
import { getReviewsByRoomId } from '../api/reviews';
import { useAuth } from '../context/AuthContext';

export default function RoomDetailPage() {
  const { roomId }  = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [room,    setRoom]    = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [roomData, reviewData] = await Promise.all([
          getRoomById(roomId),
          getReviewsByRoomId(roomId),
        ]);
        setRoom(roomData);
        setReviews(reviewData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [roomId]);

  function handleBook() {
    if (user) {
      navigate(`/bookings/new?roomId=${roomId}`);
    } else {
      navigate('/login', { state: { from: { pathname: `/bookings/new` }, search: `?roomId=${roomId}` } });
    }
  }

  if (loading) return <p style={styles.status}>Loading…</p>;
  if (error)   return <p style={{ ...styles.status, color: 'red' }}>{error}</p>;
  if (!room)   return null;

  return (
    <div style={styles.page}>
      <Link to="/rooms" style={styles.back}>← Back to Rooms</Link>

      <div style={styles.card}>
        <h1>Room {room.roomNumber}</h1>
        <p style={styles.type}>{room.type}</p>

        <dl style={styles.dl}>
          <dt>Floor</dt>        <dd>{room.floor}</dd>
          <dt>Status</dt>       <dd style={{ color: room.status === 'AVAILABLE' ? 'green' : '#e94560' }}>{room.status}</dd>
          <dt>Max guests</dt>   <dd>{room.maxGuests}</dd>
          <dt>Price/night</dt>  <dd>{room.basePrice != null ? `$${room.basePrice}` : '—'}</dd>
          <dt>Avg. rating</dt>  <dd>{room.averageRating != null ? `⭐ ${room.averageRating.toFixed(1)}` : '—'}</dd>
        </dl>

        {room.description && <p style={styles.desc}>{room.description}</p>}

        <button onClick={handleBook} style={styles.bookBtn}>Book this room</button>
      </div>

      <section style={styles.reviews}>
        <h2>Reviews</h2>
        {reviews.length === 0 && <p>No reviews yet.</p>}
        {reviews.map(r => (
          <div key={r.reviewId} style={styles.reviewCard}>
            <p style={styles.reviewMeta}>{r.username} · {r.rating} / 5 · {new Date(r.createdAt).toLocaleDateString()}</p>
            {r.comment && <p style={styles.reviewComment}>{r.comment}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}

const styles = {
  page:          { padding: '1.5rem', maxWidth: '720px', margin: '0 auto' },
  status:        { padding: '1.5rem', textAlign: 'center' },
  back:          { textDecoration: 'none', color: '#666', fontSize: '0.9rem' },
  card:          { marginTop: '1rem', padding: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' },
  type:          { color: '#666', marginTop: 0 },
  dl:            { display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: '0.4rem', columnGap: '0.5rem', margin: '1rem 0' },
  desc:          { marginTop: '0.5rem', lineHeight: 1.6 },
  bookBtn:       { marginTop: '1rem', padding: '0.6rem 1.4rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
  reviews:       { marginTop: '2rem' },
  reviewCard:    { padding: '0.75rem 1rem', border: '1px solid #eee', borderRadius: '6px', marginBottom: '0.75rem', background: '#fafafa' },
  reviewMeta:    { margin: '0 0 0.3rem', fontWeight: 600, fontSize: '0.85rem', color: '#555' },
  reviewComment: { margin: 0, lineHeight: 1.5 },
};
