import * as React from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createBooking } from "../api/bookings";
import { getRoomById } from "../api/rooms";

export default function NewBookingPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const roomId = params.get("roomId") || "";

    const [room, setRoom] = React.useState(null);
    const [loadingRoom, setLoadingRoom] = React.useState(Boolean(roomId));
    const [roomError, setRoomError] = React.useState("");

    const [checkIn, setCheckIn] = React.useState("");
    const [checkOut, setCheckOut] = React.useState("");

    const [submitError, setSubmitError] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        let alive = true;

        async function loadRoom() {
            if (!roomId) {
                setRoom(null);
                setLoadingRoom(false);
                setRoomError("");
                return;
            }

            setLoadingRoom(true);
            setRoomError("");
            try {
                const data = await getRoomById(roomId);
                if (!alive) return;
                setRoom(data ?? null);
            } catch (err) {
                if (!alive) return;
                setRoomError(err?.message || "Nem sikerült betölteni a szobát.");
            } finally {
                if (alive) setLoadingRoom(false);
            }
        }

        loadRoom();
        return () => {
            alive = false;
        };
    }, [roomId]);

    const canSubmit = Boolean(roomId && checkIn && checkOut) && !isSubmitting;

    async function onSubmit(e) {
        e.preventDefault();
        setSubmitError("");

        if (!roomId || !checkIn || !checkOut) return;

        setIsSubmitting(true);
        try {
            await createBooking({
                roomId: Number(roomId),
                checkIn,
                checkOut,
            });
            navigate("/my-bookings", { replace: true });
        } catch (err) {
            setSubmitError(err?.message || "Nem sikerült létrehozni a foglalást.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Container sx={{ py: 3 }} maxWidth="sm">
            <Paper sx={{ p: 3 }}>
                <Stack spacing={2} component="form" onSubmit={onSubmit} noValidate>
                    <Typography variant="h4" component="h1">
                        Új foglalás
                    </Typography>

                    {roomId ? (
                        loadingRoom ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                                <CircularProgress size={22} />
                            </Box>
                        ) : roomError ? (
                            <Alert severity="error">{roomError}</Alert>
                        ) : room ? (
                            <Alert severity="info">
                                Szoba: {room.name ?? `#${room.id ?? room.roomId ?? roomId}`}
                            </Alert>
                        ) : null
                    ) : (
                        <Alert severity="warning">
                            Hiányzik a <strong>roomId</strong> a URL-ből. Nyisd meg a foglalást a szoba
                            részleteinél.
                        </Alert>
                    )}

                    {submitError ? <Alert severity="error">{submitError}</Alert> : null}

                    <TextField
                        label="Check-in"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                        fullWidth
                    />

                    <TextField
                        label="Check-out"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        required
                        fullWidth
                    />

                    <Button type="submit" variant="contained" disabled={!canSubmit}>
                        {isSubmitting ? "Mentés..." : "Foglalás létrehozása"}
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}