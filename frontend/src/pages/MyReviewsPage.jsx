/**
 * MyReviewsPage – authenticated user's reviews.
 *
 * GET    /api/reviews/my-reviews      – own reviews
 * PUT    /api/reviews/{reviewId}      – edit a review (inline form)
 * DELETE /api/reviews/{reviewId}      – (admin only – not shown here)
 */

import { useEffect, useState } from 'react';
import { getMyReviews, updateReview } from '../api/reviews';

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [editing, setEditing] = useState(null); // reviewId being edited

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setReviews(await getMyReviews());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(review) {
    setEditing({ reviewId: review.reviewId, roomId: review.roomId, rating: review.rating, comment: review.comment ?? '' });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit(e) {
    e.preventDefault();
    try {
      const updated = await updateReview(editing.reviewId, {
        roomId:  editing.roomId,
        rating:  Number(editing.rating),
        comment: editing.comment,
      });
      setReviews(prev => prev.map(r => r.reviewId === editing.reviewId ? updated : r));
      setEditing(null);
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p style={styles.status}>Loading…</p>;
  if (error)   return <p style={{ ...styles.status, color: 'red' }}>{error}</p>;

  return (
    <div style={styles.page}>
      <h1>My Reviews</h1>

      {reviews.length === 0 && <p>You have not written any reviews yet.</p>}

      <div style={styles.list}>
        {reviews.map(r => (
          <div key={r.reviewId} style={styles.card}>
            {editing?.reviewId === r.reviewId ? (
              <form onSubmit={saveEdit} style={styles.editForm}>
                <label style={styles.label}>
                  Rating (1–5)
                  <input
                    type="number" min={1} max={5}
                    value={editing.rating}
                    onChange={e => setEditing({ ...editing, rating: e.target.value })}
                    required style={styles.input}
                  />
                </label>
                <label style={styles.label}>
                  Comment
                  <textarea
                    value={editing.comment}
                    onChange={e => setEditing({ ...editing, comment: e.target.value })}
                    rows={3} style={styles.textarea}
                  />
                </label>
                <div style={styles.editButtons}>
                  <button type="submit" style={styles.saveBtn}>Save</button>
                  <button type="button" onClick={cancelEdit} style={styles.cancelBtn}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div style={styles.row}>
                  <span style={styles.room}>Room {r.roomNumber}</span>
                  <span style={styles.rating}>{'⭐'.repeat(r.rating)} ({r.rating}/5)</span>
                </div>
                {r.comment && <p style={styles.comment}>{r.comment}</p>}
                <p style={styles.meta}>{new Date(r.createdAt).toLocaleDateString()}</p>
                <button onClick={() => startEdit(r)} style={styles.editBtn}>Edit</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page:        { padding: '1.5rem' },
  status:      { padding: '1.5rem', textAlign: 'center' },
  list:        { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' },
  card:        { padding: '1rem 1.25rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fff' },
  row:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' },
  room:        { fontWeight: 700 },
  rating:      { color: '#f0a500' },
  comment:     { margin: '0.25rem 0', lineHeight: 1.5 },
  meta:        { margin: '0 0 0.5rem', color: '#888', fontSize: '0.8rem' },
  editBtn:     { padding: '0.3rem 0.8rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  editForm:    { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label:       { display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' },
  input:       { padding: '0.4rem', borderRadius: '4px', border: '1px solid #aaa' },
  textarea:    { padding: '0.4rem', borderRadius: '4px', border: '1px solid #aaa', resize: 'vertical' },
  editButtons: { display: 'flex', gap: '0.5rem' },
  saveBtn:     { padding: '0.3rem 0.8rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn:   { padding: '0.3rem 0.8rem', background: '#888', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};
