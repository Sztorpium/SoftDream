import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Container,
    Divider,
    Stack,
    Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { getRoomById } from "../api/rooms";
import { getAverageRating, getReviewsByRoomId } from "../api/reviews";
import RatingStars from "../components/RatingStars";
import { getRoomImage } from "../utils/roomImages";
import styles from "./RoomDetailPage.module.css";

export default function RoomDetailPage() {
    const { roomId } = useParams();

    const [room, setRoom] = React.useState(null);
    const [reviews, setReviews] = React.useState([]);
    const [avgRating, setAvgRating] = React.useState(null);

    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        let alive = true;

        async function load() {
            setLoading(true);
            setError("");

            try {
                const [roomData, reviewsData, avgData] = await Promise.all([
                    getRoomById(roomId),
                    getReviewsByRoomId(roomId),
                    getAverageRating(roomId),
                ]);
                if (!alive) return;

                setRoom(roomData ?? null);
                setReviews(Array.isArray(reviewsData) ? reviewsData : []);
                setAvgRating(
                    typeof avgData === "number"
                        ? avgData
                        : typeof avgData?.average === "number"
                            ? avgData.average
                            : typeof avgData?.value === "number"
                                ? avgData.value
                                : null
                );
            } catch (err) {
                if (!alive) return;
                setError(err?.message || "Nem sikerült betölteni a szoba részleteit.");
            } finally {
                if (alive) setLoading(false);
            }
        }

        load();
        return () => {
            alive = false;
        };
    }, [roomId]);

    function formatPrice(price) {
        if (price == null) return "—";
        return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF" }).format(Number(price));
    }

    function parseDateSafe(value) {
        if (!value) return null;
        const date = value instanceof Date ? value : new Date(String(value));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatDate(value) {
        const date = parseDateSafe(value);
        if (!date) return value ?? "?";
        return new Intl.DateTimeFormat("hu-HU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(date);
    }

    function formatDateTime(value) {
        const date = parseDateSafe(value);
        if (!date) return value ?? "";
        return new Intl.DateTimeFormat("hu-HU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    }

    return (
        <Container className={styles.page} maxWidth="lg">
            <Stack spacing={2} className={styles.content}>
                <Button component={RouterLink} to="/rooms" size="small">
                    ← Vissza a szobákhoz
                </Button>

                {error ? <Alert severity="error">{error}</Alert> : null}

                {loading ? (
                    <Box className={styles.loadingBox}>
                        <CircularProgress />
                    </Box>
                ) : room ? (
                    <>
                        <Card variant="outlined" className={styles.roomCard}>
                            <CardMedia
                                component="img"
                                height="320"
                                image={getRoomImage(room.id ?? room.roomId ?? roomId)}
                                alt={room.name ?? `Szoba #${room.id ?? room.roomId ?? roomId}`}
                                className={styles.roomImg}
                            />
                            <CardContent>
                                <Stack spacing={1.8}>
                                    <Typography variant="h4" component="h1" fontWeight={800}>
                                        {room.name ?? `Szoba #${room.id ?? room.roomId ?? roomId}`}
                                    </Typography>

                                    {room.description && (
                                        <Typography variant="body1" className={styles.roomDescription}>
                                            {room.description}
                                        </Typography>
                                    )}

                                    <Divider light />

                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={2}
                                        alignItems={{ sm: "center" }}
                                        justifyContent="space-between"
                                    >
                                        <Stack spacing={0.2}>
                                            {room.roomNumber != null && (
                                                <Typography variant="body2">
                                                    <b>Szobaszám:</b> {room.roomNumber}
                                                </Typography>
                                            )}
                                            {room.type ? (
                                                <Typography variant="body2">
                                                    <b>Típus:</b> {room.type}
                                                </Typography>
                                            ) : null}
                                            {room.status && (
                                                <Typography variant="body2">
                                                    <b>Státusz:</b> {room.status}
                                                </Typography>
                                            )}
                                        </Stack>
                                        <Box>
                                            <Typography variant="body2" className={styles.priceText}>
                                                {formatPrice(room.pricePerNight)}
                                                <Typography component="span" variant="body2" className={styles.priceUnit}>
                                                    {" "}
                                                    / éj
                                                </Typography>
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Average rating with stars */}
                                    {avgRating != null && (
                                        <Box className={styles.ratingRow}>
                                            <RatingStars value={avgRating} size={24} />
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {avgRating.toFixed(1)}/5
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box sx={{ pt: 1 }}>
                                        <Button
                                            component={RouterLink}
                                            to={`/bookings/new?roomId=${encodeURIComponent(roomId)}`}
                                            variant="contained"
                                        >
                                            Foglalás
                                        </Button>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" className={styles.reviewsCard}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Értékelések
                                </Typography>
                                {reviews.length === 0 ? (
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        Ehhez a szobához még nincs értékelés.
                                    </Typography>
                                ) : (
                                    <Stack spacing={1.5} className={styles.reviewsList}>
                                        {reviews.map((r) => (
                                            <Box
                                                key={r.id ?? r.reviewId ?? JSON.stringify(r)}
                                                className={styles.reviewItem}
                                            >
                                                <Box className={styles.reviewHeader}>
                                                    <Typography variant="subtitle2" className={styles.reviewUsername}>
                                                        {r.username ?? r.user?.username ?? "Felhasználó"}
                                                    </Typography>
                                                    <RatingStars value={r.rating} />
                                                    <Typography variant="body2" className={styles.reviewRating}>
                                                        {r.rating != null ? `${r.rating}/5` : ""}
                                                    </Typography>
                                                </Box>
                                                {r.comment && (
                                                    <Typography variant="body2" className={styles.reviewComment}>
                                                        {r.comment}
                                                    </Typography>
                                                )}
                                                {(r.checkIn || r.checkOut) && (
                                                    <Typography variant="caption" className={styles.reviewCaption} display="block">
                                                        Szállás: {formatDate(r.checkIn) ?? "?"} – {formatDate(r.checkOut) ?? "?"}
                                                    </Typography>
                                                )}
                                                {r.createdAt && (
                                                    <Typography variant="caption" className={styles.reviewCaption} display="block">
                                                        Értékelés ideje: {formatDateTime(r.createdAt)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Alert severity="warning">A szoba nem található.</Alert>
                )}
            </Stack>
        </Container>
    );
}