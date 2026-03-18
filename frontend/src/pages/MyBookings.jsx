import * as React from "react";
import {
    Box,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { getMyBookings } from "../api/bookings";

const STATUS_COLOR = {
    CONFIRMED: "success",
    PENDING: "warning",
    CANCELLED: "error",
};

export default function MyBookings() {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");

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
                    {bookings.map((booking) => (
                        <Paper key={booking.id} sx={{ p: 2 }}>
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
                                        Szoba: {booking.roomId ?? booking.room?.id ?? "–"}
                                    </Typography>
                                    <Divider sx={{ my: 0.5 }} />
                                    <Typography variant="body2">
                                        {booking.checkIn} → {booking.checkOut}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={booking.status}
                                    color={STATUS_COLOR[booking.status] ?? "default"}
                                    size="small"
                                />
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Container>
    );
}
