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
import { createReview } from "../api/reviews";

const STATUS_COLOR = {
    CONFIRMED: "success",
    PENDING: "warning",
    CANCELLED: "error",
};

//only works when status is one of these and check-out date is in the past
const REVIEWABLE_STATUSES = new Set(["PENDING", "CONFIRMED", "COMPLETED", "FINISHED"]);

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

    React.useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError("");

        getMyBookings()
            .then((data) => {
                if (!cancelled) setBookings(data ?? []);
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
            setReviewSuccess("Értékelés sikeresen elküldve!");
        } catch (err) {
            setReviewError(err?.message || "Nem sikerült elküldeni az értékelést.");
        } finally {
            setReviewSubmitting(false);
        }
    }

    return (
        <Container sx={{ py: 3 }} maxWidth="md">
            <Typography variant="h4" component="h1" gutterBottom>
                Foglalásaim
            </Typography>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && error && (
                <Typography color="error">{error}</Typography>
            )}

            {!loading && !error && bookings.length === 0 && (
                <Typography color="text.secondary">Nincs aktív foglalás.</Typography>
            )}

            {!loading && !error && bookings.length > 0 && (
                <Stack spacing={2}>
                    {bookings.map((booking) => {
                        const canReview = canWriteReview(booking);
                        const roomId = getBookingRoomId(booking);
                        const checkIn = getBookingCheckIn(booking);
                        const checkOut = getBookingCheckOut(booking) ?? "-";
                        return (
                            <Paper key={booking.bookingId ?? booking.id} sx={{ p: 2 }}>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    flexWrap="wrap"
                                    gap={1}
                                >
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            Foglalás #{booking.id}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Szoba: {roomId ?? "-"}
                                        </Typography>
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
            <Dialog open={!!reviewDialog} onClose={closeReviewDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Értékelés – Szoba:{" "}
                    {getBookingRoomId(reviewDialog) ?? "-"}
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
