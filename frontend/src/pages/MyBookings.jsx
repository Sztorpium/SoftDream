import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Rating,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { getMyBookings } from "../api/bookings";
import { createReview, getAverageRating, getMyReviews } from "../api/reviews";
import RatingStars from "../components/RatingStars";
import styles from "./MyBookings.module.css";

const STATUS_COLOR = {
    CONFIRMED: "success",
    PENDING: "warning",
    CANCELLED: "error",
};

// review is allowed only for confirmed bookings and after checkout
const REVIEWABLE_STATUSES = new Set(["CONFIRMED"]);

function normalizeStatus(status) {
    return String(status ?? "")
        .trim()
        .toUpperCase();
}

function parseDateSafe(value) {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

    const raw = String(value).trim();
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;

    const dotFormat = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dotFormat) {
        const [, d, m, y] = dotFormat;
        const normalized = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        const date = new Date(normalized);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
}

function getBookingCheckOut(booking) {
    return (
        booking?.checkOut ??
        booking?.checkout ??
        booking?.checkOutDate ??
        booking?.endDate ??
        null
    );
}

function getBookingCheckIn(booking) {
    return booking?.checkIn ?? booking?.checkin ?? booking?.checkInDate ?? booking?.startDate ?? "-";
}

function getBookingRoomId(booking) {
    return booking?.roomId ?? booking?.room?.id ?? booking?.room?.roomId ?? null;
}

function normalizeAverageRating(value) {
    if (typeof value === "number") return value;
    if (typeof value?.average === "number") return value.average;
    if (typeof value?.value === "number") return value.value;
    return null;
}

function canWriteReview(booking) {
    const status = normalizeStatus(booking?.status);
    if (!REVIEWABLE_STATUSES.has(status)) return false;
    const checkOut = parseDateSafe(getBookingCheckOut(booking));
    if (!checkOut) return false;
    return checkOut < new Date();
}

export default function MyBookings() {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    const [reviewDialog, setReviewDialog] = React.useState(null);
    const [rating, setRating] = React.useState(0);
    const [comment, setComment] = React.useState("");
    const [reviewSubmitting, setReviewSubmitting] = React.useState(false);
    const [reviewError, setReviewError] = React.useState("");
    const [reviewSuccess, setReviewSuccess] = React.useState("");
    const [roomAverageRatings, setRoomAverageRatings] = React.useState({});
    /** roomId-k halmaza amelyekre a felhasználónak már van értékelése */
    const [reviewedRoomIds, setReviewedRoomIds] = React.useState(new Set());

    React.useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");

        Promise.all([getMyBookings(), getMyReviews()])
                    .then(([bookingData, reviewData]) => {
                        if (!cancelled) {
                            setBookings(bookingData ?? []);
                            const ids = new Set(
                                (Array.isArray(reviewData) ? reviewData : [])
                                    .map((r) => r.roomId ?? r.room?.id ?? r.room?.roomId)
                                    .filter((id) => id != null)
                                    .map(String)
                            );
                            setReviewedRoomIds(ids);
                        }
            })
            .catch((err) => {
                if (!cancelled) setError(err?.message || "Nem sikerült betölteni a foglalásokat.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    React.useEffect(() => {
        let cancelled = false;

        async function loadAverageRatings() {
            const uniqueRoomIds = Array.from(
                new Set(
                    bookings
                        .map((booking) => getBookingRoomId(booking))
                        .filter((roomId) => roomId != null)
                )
            );

            if (uniqueRoomIds.length === 0) {
                setRoomAverageRatings({});
                return;
            }

            try {
                const entries = await Promise.all(
                    uniqueRoomIds.map(async (roomId) => {
                        const avgData = await getAverageRating(roomId);
                        return [String(roomId), normalizeAverageRating(avgData)];
                    })
                );

                if (!cancelled) {
                    setRoomAverageRatings(Object.fromEntries(entries));
                }
            } catch {
                if (!cancelled) {
                    setRoomAverageRatings({});
                }
            }
        }

        loadAverageRatings();

        return () => {
            cancelled = true;
        };
    }, [bookings]);

    function openReviewDialog(booking) {
        setReviewDialog(booking);
        setRating(0);
        setComment("");
        setReviewError("");
        setReviewSuccess("");
    }

    function closeReviewDialog() {
        setReviewDialog(null);
    }

    async function handleSubmitReview() {
        if (rating < 1) {
            setReviewError("Kérjük, adj meg egy értékelést (1–5 csillag).");
            return;
        }
        const roomId = getBookingRoomId(reviewDialog);
        const bookingId = reviewDialog?.id ?? reviewDialog?.bookingId;
        if (!roomId) {
            setReviewError("Nem sikerült azonosítani a szobát.");
            return;
        }
        setReviewSubmitting(true);
        setReviewError("");
        try {
            await createReview({
                roomId,
                bookingId,
                rating,
                comment: comment.trim() || undefined,
            });
            setReviewedRoomIds((prev) => new Set([...prev, String(roomId)]));
            setReviewSuccess("Értékelés sikeresen elküldve!");
        } catch (err) {
            setReviewError(err?.message || "Nem sikerült elküldeni az értékelést.");
        } finally {
            setReviewSubmitting(false);
        }
    }

    return (
        <Container className={styles.page} maxWidth="lg">
            <Stack spacing={2} className={styles.content}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Foglalásaim
                </Typography>

                {loading && (
                    <Box className={styles.loadingBox}>
                        <CircularProgress />
                    </Box>
                )}

                {!loading && error && (
                    <Typography color="error" align="center">{error}</Typography>
                )}

                {!loading && !error && bookings.length === 0 && (
                    <Typography color="text.secondary" align="center">Nincs aktív foglalás.</Typography>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <Stack spacing={2} className={styles.list}>
                        {bookings.map((booking) => {
                        const roomId = getBookingRoomId(booking);
                        const alreadyReviewed = roomId != null && reviewedRoomIds.has(String(roomId));
                        const canReview = canWriteReview(booking) && !alreadyReviewed;
                        const averageRating = roomId != null ? roomAverageRatings[String(roomId)] : null;
                        const checkIn = getBookingCheckIn(booking);
                        const checkOut = getBookingCheckOut(booking) ?? "-";
                        return (
                            <Paper key={booking.bookingId ?? booking.id} className={styles.bookingCard}>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    flexWrap="wrap"
                                    gap={1}
                                >
                                    <Box>
                                        <Typography variant="subtitle1" className={styles.bookingTitle}>
                                            Foglalás #{booking.bookingId ?? booking.id}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Szoba: {booking.roomNumber ?? roomId ?? "-"}
                                        </Typography>
                                        <Box className={styles.ratingRow}>
                                            <RatingStars value={averageRating ?? 0} />
                                            <Typography variant="body2" className={styles.ratingText}>
                                                {averageRating == null ? "Nincs értékelés" : `${Number(averageRating).toFixed(1)}/5`}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ my: 0.5 }} />
                                        <Typography variant="body2">
                                            {checkIn} → {checkOut}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" alignItems="center" gap={1}>
                                        {canReview && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => openReviewDialog(booking)}
                                            >
                                                Értékelés írása
                                            </Button>
                                        )}
                                        <Chip
                                            label={booking.status}
                                            color={STATUS_COLOR[booking.status] ?? "default"}
                                            size="small"
                                        />
                                    </Stack>
                                </Stack>
                            </Paper>
                        );
                        })}
                    </Stack>
                )}
            </Stack>
            <Dialog open={!!reviewDialog} onClose={closeReviewDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Értékelés – Szoba:{" "}
                    {reviewDialog?.roomNumber ?? getBookingRoomId(reviewDialog) ?? "-"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {reviewError && <Alert severity="error">{reviewError}</Alert>}
                        {reviewSuccess && <Alert severity="success">{reviewSuccess}</Alert>}
                        {!reviewSuccess && (
                            <>
                                <Box>
                                    <Typography variant="body2" gutterBottom>
                                        Értékelés (1–5 csillag) *
                                    </Typography>
                                    <Rating
                                        value={rating}
                                        onChange={(_, newValue) => setRating(newValue)}
                                        size="large"
                                    />
                                </Box>
                                <TextField
                                    label="Megjegyzés (opcionális)"
                                    multiline
                                    minRows={3}
                                    fullWidth
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeReviewDialog}>
                        {reviewSuccess ? "Bezárás" : "Mégse"}
                    </Button>
                    {!reviewSuccess && (
                        <Button
                            variant="contained"
                            onClick={handleSubmitReview}
                            disabled={reviewSubmitting}
                        >
                            {reviewSubmitting ? "Küldés…" : "Értékelés beküldése"}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
}