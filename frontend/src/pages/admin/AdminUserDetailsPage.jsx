import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { getUserById } from "../../api/users";
import { getBookingsByUserId, deleteBooking } from "../../api/bookings";
import { getReviewsByUserId, deleteReview } from "../../api/reviews";

const STATUS_COLOR = {
    CONFIRMED: "success",
    PENDING: "warning",
    CANCELLED: "error",
};

export default function AdminUserDetailsPage() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = React.useState(null);
    const [bookings, setBookings] = React.useState([]);
    const [reviews, setReviews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [deletingBookingId, setDeletingBookingId] = React.useState(null);
    const [deletingReviewId, setDeletingReviewId] = React.useState(null);

    const load = React.useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [userData, bookingsData, reviewsData] = await Promise.all([
                getUserById(userId),
                getBookingsByUserId(userId),
                getReviewsByUserId(userId),
            ]);
            setUser(userData);
            setBookings(Array.isArray(bookingsData) ? bookingsData : []);
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (err) {
            setError(err?.message || "Nem sikerült betölteni az adatokat.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    React.useEffect(() => {
        load();
    }, [load]);

    async function onDeleteBooking(id) {
        const ok = window.confirm("Biztosan törlöd ezt a foglalást? (Végleges)");
        if (!ok) return;

        setDeletingBookingId(id);
        setError("");
        try {
            await deleteBooking(id);
            setBookings((prev) => prev.filter((b) => (b.bookingId ?? b.id) !== id));
        } catch (err) {
            setError(err?.message || "Nem sikerült törölni a foglalást.");
        } finally {
            setDeletingBookingId(null);
        }
    }

    async function onDeleteReview(id) {
        const ok = window.confirm("Biztosan törlöd ezt az értékelést? (Végleges)");
        if (!ok) return;

        setDeletingReviewId(id);
        setError("");
        try {
            await deleteReview(id);
            setReviews((prev) => prev.filter((r) => (r.reviewId ?? r.id) !== id));
        } catch (err) {
            setError(err?.message || "Nem sikerült törölni az értékelést.");
        } finally {
            setDeletingReviewId(null);
        }
    }

    return (
        <Container sx={{ py: 3 }} maxWidth="md">
            <Stack spacing={3}>
                <Stack direction="row" alignItems="center" gap={2}>
                    <Button variant="outlined" size="small" onClick={() => navigate("/admin/users")}>
                        ← Vissza
                    </Button>
                    <Typography variant="h4" component="h1">
                        Felhasználó részletei
                    </Typography>
                </Stack>

                {error ? <Alert severity="error">{error}</Alert> : null}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* User info */}
                        {user && (
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    {user.username ?? "—"}{" "}
                                    <Typography component="span" sx={{ opacity: 0.7 }}>
                                        #{user.userId ?? user.id ?? "?"}
                                    </Typography>
                                </Typography>
                                {user.email && (
                                    <Typography variant="body2">{user.email}</Typography>
                                )}
                                {user.phone && (
                                    <Typography variant="body2">{user.phone}</Typography>
                                )}
                                {user.role && (
                                    <Typography variant="body2">Role: {user.role}</Typography>
                                )}
                            </Paper>
                        )}

                        <Divider />

                        {/* Bookings */}
                        <Typography variant="h5" component="h2">
                            Foglalások ({bookings.length})
                        </Typography>

                        {bookings.length === 0 ? (
                            <Typography color="text.secondary">Nincs foglalás.</Typography>
                        ) : (
                            <Stack spacing={2}>
                                {bookings.map((b) => {
                                    const id = b.bookingId ?? b.id;
                                    const status = b.status ?? "—";
                                    return (
                                        <Paper key={id ?? JSON.stringify(b)} sx={{ p: 2 }}>
                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                justifyContent="space-between"
                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                                gap={1}
                                            >
                                                <Box>
                                                    <Typography fontWeight={700}>
                                                        Foglalás #{id ?? "?"}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                        Szoba: {b.roomNumber ?? b.roomId ?? "–"}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                        {b.checkIn ?? "?"} → {b.checkOut ?? "?"}
                                                    </Typography>
                                                </Box>
                                                <Stack direction="row" gap={1} alignItems="center">
                                                    <Chip
                                                        label={status}
                                                        color={STATUS_COLOR[status] ?? "default"}
                                                        size="small"
                                                    />
                                                    {id != null && (
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            variant="outlined"
                                                            onClick={() => onDeleteBooking(id)}
                                                            disabled={deletingBookingId === id}
                                                        >
                                                            {deletingBookingId === id ? "Törlés..." : "Törlés"}
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        )}

                        <Divider />

                        {/* Reviews */}
                        <Typography variant="h5" component="h2">
                            Értékelések ({reviews.length})
                        </Typography>

                        {reviews.length === 0 ? (
                            <Typography color="text.secondary">Nincs értékelés.</Typography>
                        ) : (
                            <Stack spacing={2}>
                                {reviews.map((r) => {
                                    const id = r.reviewId ?? r.id;
                                    return (
                                        <Paper key={id ?? JSON.stringify(r)} sx={{ p: 2 }}>
                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                justifyContent="space-between"
                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                                gap={1}
                                            >
                                                <Box>
                                                    <Typography fontWeight={700}>
                                                        Értékelés #{id ?? "?"}{" "}
                                                        <Typography component="span" sx={{ opacity: 0.7 }}>
                                                            – Szoba: {r.roomNumber ?? r.roomId ?? "–"}
                                                        </Typography>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                        Értékelés: {r.rating ?? "–"} / 5
                                                    </Typography>
                                                    {r.comment && (
                                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                            {r.comment}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                {id != null && (
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                        onClick={() => onDeleteReview(id)}
                                                        disabled={deletingReviewId === id}
                                                    >
                                                        {deletingReviewId === id ? "Törlés..." : "Törlés"}
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        )}
                    </>
                )}
            </Stack>
        </Container>
    );
}
