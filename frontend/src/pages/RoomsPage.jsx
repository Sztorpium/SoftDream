import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getAllRooms } from "../api/rooms";

export default function RoomsPage() {
    const [rooms, setRooms] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        let alive = true;

        async function load() {
            setLoading(true);
            setError("");
            try {
                const data = await getAllRooms();
                if (!alive) return;
                setRooms(Array.isArray(data) ? data : []);
            } catch (err) {
                if (!alive) return;
                setError(err?.message || "Nem sikerült betölteni a szobákat.");
            } finally {
                if (alive) setLoading(false);
            }
        }

        load();
        return () => {
            alive = false;
        };
    }, []);

    return (
        <Container sx={{ py: 3 }} maxWidth="lg">
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Szobák
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Válassz szobát a részletek megtekintéséhez.
                    </Typography>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {rooms.map((room) => (
                            <Grid key={room.id ?? room.roomId ?? JSON.stringify(room)} item xs={12} sm={6} md={4}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {room.name ?? `Szoba #${room.id ?? room.roomId}`}
                                        </Typography>

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
                                        </Stack>
                                    </CardContent>

                                    <CardActions>
                                        <Button
                                            component={RouterLink}
                                            to={`/rooms/${room.id ?? room.roomId}`}
                                            size="small"
                                        >
                                            Részletek
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Stack>
        </Container>
    );
}