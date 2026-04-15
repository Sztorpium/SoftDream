import * as React from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { deleteReview, getMyReviews } from "../api/reviews";
import styles from "./MyReviewsPage.module.css";

export default function MyReviewsPage() {
    const [reviews, setReviews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [deletingId, setDeletingId] = React.useState(null);

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

                                    {r.comment ? (
                                        <Typography variant="body2" className={styles.reviewComment}>
                                            {r.comment}
                                        </Typography>
                                    ) : null}

                                    <Stack direction="row" justifyContent="flex-end">
                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={() => onDelete(r.id ?? r.reviewId)}
                                            disabled={deletingId === (r.id ?? r.reviewId)}
                                        >
                                            {deletingId === (r.id ?? r.reviewId) ? "Törlés..." : "Törlés"}
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Container>
    );
}