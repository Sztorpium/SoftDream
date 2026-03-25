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
                                <Stack spacing={1.2}>
                                    <Typography variant="h4" component="h1">
                                        {room.name ?? `Szoba #${room.id ?? room.roomId ?? roomId}`}
                                    </Typography>

                                    {room.description ? (
                                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                            {room.description}
                                        </Typography>
                                    ) : null}

                                    <Divider />

                                    <Stack spacing={0.5}>
                                        {room.roomNumber != null ? (
                                            <Typography variant="body2">
                                                Szobaszám: {room.roomNumber}
                                            </Typography>
                                        ) : null}
                                        {room.type?.name ? (
                                            <Typography variant="body2">
                                                Típus: {room.type.name}
                                            </Typography>
                                        ) : room.roomType ? (
                                            <Typography variant="body2">
                                                Típus: {room.roomType}
                                            </Typography>
                                        ) : null}
                                        {room.pricePerNight != null ? (
                                            <Typography variant="body2">
                                                Ár / éj: {room.pricePerNight}
                                            </Typography>
                                        ) : null}
                                        {room.status ? (
                                            <Typography variant="body2">
                                                Státusz: {room.status}
                                            </Typography>
                                        ) : null}
                                        {avgRating != null ? (
                                            <Typography variant="body2">
                                                Átlagos értékelés: {avgRating}
                                            </Typography>
                                        ) : null}
                                    </Stack>

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
                                                <Typography variant="subtitle2">
                                                    {r.username ?? r.user?.username ?? "Felhasználó"}
                                                    {r.rating != null ? ` — ${r.rating}/5` : ""}
                                                </Typography>
                                                {r.comment ? (
                                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                        {r.comment}
                                                    </Typography>
                                                ) : null}
                                                {r.createdAt ? (
                                                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                                        {String(r.createdAt)}
                                                    </Typography>
                                                ) : null}
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