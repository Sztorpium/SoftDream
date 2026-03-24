import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import {
    cancelBooking,
    confirmBooking,
    deleteBooking,
    getAllBookings,
} from "../../api/bookings";

const STATUS_COLOR = {
    CONFIRMED: "success",
    PENDING: "warning",
    CANCELLED: "error",
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [actingId, setActingId] = React.useState(null);

    const load = React.useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAllBookings();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || "Nem sikerült betölteni a foglalásokat.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    async function onConfirm(id) {
        setActingId(id);
        setError("");
        try {
            await confirmBooking(id);
            await load();
        } catch (err) {
            setError(err?.message || "Nem sikerült megerősíteni a foglalást.");
        } finally {
            setActingId(null);
        }
    }

    async function onCancel(id) {
        const ok = window.confirm("Biztosan lemondod ezt a foglalást?");
        if (!ok) return;

        setActingId(id);
        setError("");
        try {
            await cancelBooking(id);
            await load();
        } catch (err) {
            setError(err?.message || "Nem sikerült lemondani a foglalást.");
        } finally {
            setActingId(null);
        }
    }

    async function onDelete(id) {
        const ok = window.confirm("Biztosan törlöd ezt a foglalást? (Végleges)");
        if (!ok) return;

        setActingId(id);
        setError("");
        try {
            await deleteBooking(id);
            await load();
        } catch (err) {
            setError(err?.message || "Nem sikerült törölni a foglalást.");
        } finally {
            setActingId(null);
        }
    }

    return (
        <Container sx={{ py: 3 }} maxWidth="md">
            <Stack spacing={2}>
                <Typography variant="h4" component="h1">
                    Admin – Bookings
                </Typography>

                {error ? <Alert severity="error">{error}</Alert> : null}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : bookings.length === 0 ? (
                    <Typography color="text.secondary">Nincs foglalás.</Typography>
                ) : (
                    <Stack spacing={2}>
                        {bookings.map((b) => {
                            const id = b.id ?? b.bookingId;
                            const status = b.status ?? "—";
                            const disabled = actingId === id;

                            return (
                                <Paper key={id ?? JSON.stringify(b)} sx={{ p: 2 }}>
                                    <Stack spacing={1}>
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            justifyContent="space-between"
                                            alignItems={{ xs: "flex-start", sm: "center" }}
                                            gap={1}
                                        >
                                            <Box>
                                                <Typography fontWeight={800}>
                                                    Foglalás #{id ?? "?"}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                    User: {b.userId ?? b.user?.id ?? "–"} | Room:{" "}
                                                    {b.roomId ?? b.room?.id ?? "–"}
                                                </Typography>
                                                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                    {b.checkIn ?? "?"} → {b.checkOut ?? "?"}
                                                </Typography>
                                            </Box>

                                            <Chip
                                                label={status}
                                                color={STATUS_COLOR[status] ?? "default"}
                                                size="small"
                                            />
                                        </Stack>

                                        <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="flex-end">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => onConfirm(id)}
                                                disabled={disabled || id == null}
                                            >
                                                {disabled ? "..." : "Confirm"}
                                            </Button>

                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="warning"
                                                onClick={() => onCancel(id)}
                                                disabled={disabled || id == null}
                                            >
                                                {disabled ? "..." : "Cancel"}
                                            </Button>

                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => onDelete(id)}
                                                disabled={disabled || id == null}
                                            >
                                                {disabled ? "..." : "Delete"}
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Stack>
        </Container>
    );
}