import * as React from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Rating,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { deleteReview, getMyReviews, updateReview } from "../api/reviews";
import styles from "./MyReviewsPage.module.css";

export default function MyReviewsPage() {
    const [reviews, setReviews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [deletingId, setDeletingId] = React.useState(null);
    const [editingId, setEditingId] = React.useState(null);
    const [editComment, setEditComment] = React.useState("");
    const [editRating, setEditRating] = React.useState(0);
    const [savingId, setSavingId] = React.useState(null);

    const load = React.useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getMyReviews();
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || "Nem sikerült betölteni az értékeléseket.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    async function onDelete(reviewId) {
        const ok = window.confirm("Biztosan törlöd ezt az értékelést?");
        if (!ok) return;

        setDeletingId(reviewId);
        setError("");
        try {
            await deleteReview(reviewId);
            await load();
        } catch (err) {
            setError(err?.message || "Nem sikerült törölni az értékelést.");
        } finally {
            setDeletingId(null);
        }
    }

    function onStartEdit(review) {
        const reviewId = review.id ?? review.reviewId;
        setEditingId(reviewId);
        setEditComment(review.comment ?? "");
        setEditRating(Number(review.rating) || 0);
        setError("");
    }

    function onCancelEdit() {
        setEditingId(null);
        setEditComment("");
        setEditRating(0);
    }

    async function onSaveEdit(review) {
        const reviewId = review.id ?? review.reviewId;
        if (!reviewId || review.roomId == null) {
            setError("Az értékelés szerkesztéséhez hiányos adat érkezett.");
            return;
        }
        if (editRating < 1 || editRating > 5) {
            setError("Az értékelésnek 1 és 5 csillag között kell lennie.");
            return;
        }

        setSavingId(reviewId);
        setError("");

        try {
            await updateReview(reviewId, {
                roomId: review.roomId,
                rating: editRating,
                comment: editComment,
            });
            await load();
            onCancelEdit();
        } catch (err) {
            setError(err?.message || "Nem sikerült menteni a módosítást.");
        } finally {
            setSavingId(null);
        }
    }

    return (
        <Container className={styles.page} maxWidth="lg">
            <Stack spacing={2} className={styles.content}>
                <Typography variant="h4" component="h1">
                    Értékeléseim
                </Typography>

                {error ? <Alert severity="error">{error}</Alert> : null}

                {loading ? (
                    <Box className={styles.loadingBox}>
                        <CircularProgress />
                    </Box>
                ) : reviews.length === 0 ? (
                    <Typography color="text.secondary" align="center">Még nincs értékelésed.</Typography>
                ) : (
                    <Stack spacing={2} className={styles.list}>
                        {reviews.map((r) => (
                            <Paper key={r.id ?? r.reviewId ?? JSON.stringify(r)} className={styles.reviewCard}>
                                <Stack spacing={0.5}>
                                    <Typography variant="subtitle1" className={styles.reviewRoomTitle}>
                                        Szoba: {r.roomNumber ?? r.roomId ?? "–"}
                                    </Typography>

                                    {r.rating != null ? (
                                        <Typography variant="body2">
                                            Értékelés: {r.rating}/5
                                        </Typography>
                                    ) : null}

                                    {editingId === (r.id ?? r.reviewId) ? (
                                        <Stack spacing={1}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography variant="body2">Új értékelés:</Typography>
                                                <Rating
                                                    value={editRating}
                                                    onChange={(_, value) => setEditRating(value ?? 0)}
                                                    precision={1}
                                                    max={5}
                                                />
                                                <Typography variant="body2" color="text.secondary">
                                                    {editRating}/5
                                                </Typography>
                                            </Stack>
                                            <TextField
                                                label="Komment (opcionális)"
                                                multiline
                                                minRows={3}
                                                maxRows={8}
                                                value={editComment}
                                                onChange={(e) => setEditComment(e.target.value)}
                                                fullWidth
                                                size="small"
                                                inputProps={{ maxLength: 2000 }}
                                            />
                                        </Stack>
                                    ) : r.comment ? (
                                        <Typography variant="body2" className={styles.reviewComment}>
                                            {r.comment}
                                        </Typography>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" className={styles.reviewComment}>
                                            Nincs megjegyzés.
                                        </Typography>
                                    )}

                                    {editingId === (r.id ?? r.reviewId) ? (
                                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={onCancelEdit}
                                                disabled={savingId === (r.id ?? r.reviewId)}
                                            >
                                                Mégse
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => onSaveEdit(r)}
                                                disabled={savingId === (r.id ?? r.reviewId)}
                                            >
                                                {savingId === (r.id ?? r.reviewId) ? "Mentés..." : "Mentés"}
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => onStartEdit(r)}
                                                disabled={deletingId === (r.id ?? r.reviewId)}
                                            >
                                                Szerkesztés
                                            </Button>
                                            <Button
                                                color="error"
                                                size="small"
                                                onClick={() => onDelete(r.id ?? r.reviewId)}
                                                disabled={deletingId === (r.id ?? r.reviewId)}
                                            >
                                                {deletingId === (r.id ?? r.reviewId) ? "Törlés..." : "Törlés"}
                                            </Button>
                                        </Stack>
                                    )}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Container>
    );
}