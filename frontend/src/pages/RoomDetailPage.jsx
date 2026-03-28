import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
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

    return (
        <Container sx={{ py: 3 }} maxWidth="md">
            <Stack spacing={2}>
                <Button component={RouterLink} to="/rooms" size="small">
                    ← Vissza a szobákhoz
                </Button>

                {error ? <Alert severity="error">{error}</Alert> : null}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : room ? (
                    <>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={1.8}>
                                    <Typography variant="h4" component="h1" fontWeight={800}>
                                        {room.name ?? `Szoba #${room.id ?? room.roomId ?? roomId}`}
                                    </Typography>

                                    {room.description && (
                                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
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
                                            {room.type?.name ? (
                                                <Typography variant="body2">
                                                    <b>Típus:</b> {room.type.name}
                                                </Typography>
                                            ) : room.roomType ? (
                                                <Typography variant="body2">
                                                    <b>Típus:</b> {room.roomType}
                                                </Typography>
                                            ) : null}
                                            {room.status && (
                                                <Typography variant="body2">
                                                    <b>Státusz:</b> {room.status}
                                                </Typography>
                                            )}
                                        </Stack>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {formatPrice(room.pricePerNight)}
                                                <Typography component="span" variant="body2" sx={{ opacity: 0.7 }}>
                                                    {" "}
                                                    / éj
                                                </Typography>
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    {/* Average rating with stars */}
                                    {avgRating != null && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 1 }}>
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

                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Értékelések
                                </Typography>
                                {reviews.length === 0 ? (
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        Ehhez a szobához még nincs értékelés.
                                    </Typography>
                                ) : (
                                    <Stack spacing={1.5}>
                                        {reviews.map((r) => (
                                            <Box
                                                key={r.id ?? r.reviewId ?? JSON.stringify(r)}
                                                sx={{ borderBottom: "1px solid rgba(0,0,0,0.08)", pb: 1 }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                        {r.username ?? r.user?.username ?? "Felhasználó"}
                                                    </Typography>
                                                    <RatingStars value={r.rating} />
                                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                                        {r.rating != null ? `${r.rating}/5` : ""}
                                                    </Typography>
                                                </Box>
                                                {r.comment && (
                                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                        {r.comment}
                                                    </Typography>
                                                )}
                                                {(r.checkIn || r.checkOut) && (
                                                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                                                        Szállás: {r.checkIn ?? "?"} – {r.checkOut ?? "?"}
                                                    </Typography>
                                                )}
                                                {r.createdAt && (
                                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                        {String(r.createdAt)}
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