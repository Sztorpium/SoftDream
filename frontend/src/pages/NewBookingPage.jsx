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
    TextField,
    Typography,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createBooking } from "../api/bookings";
import { getRoomById, getRoomBookedDates } from "../api/rooms";

export default function NewBookingPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const roomId = params.get("roomId") || "";

    const [room, setRoom] = React.useState(null);
    const [loadingRoom, setLoadingRoom] = React.useState(Boolean(roomId));
    const [roomError, setRoomError] = React.useState("");

    const [bookedDates, setBookedDates] = React.useState([]);

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
                setBookedDates([]);
                return;
            }

            setLoadingRoom(true);
            setRoomError("");
            try {
                const [roomData, dates] = await Promise.all([
                    getRoomById(roomId),
                    getRoomBookedDates(roomId),
                ]);
                if (!alive) return;
                setRoom(roomData ?? null);
                setBookedDates(Array.isArray(dates) ? dates : []);
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

    function hasConflict(ci, co) {
        if (!ci || !co) return false;
        const ciDate = new Date(ci);
        const coDate = new Date(co);
        return bookedDates.some(({ checkIn: bIn, checkOut: bOut }) => {
            return ciDate < new Date(bOut) && coDate > new Date(bIn);
        });
    }

    const conflict = hasConflict(checkIn, checkOut);
    const canSubmit = Boolean(roomId && checkIn && checkOut) && !isSubmitting && !conflict;

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

    const today = new Date().toISOString().split("T")[0];

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

                    {bookedDates.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Nem elérhető időszakok:
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {bookedDates.map((d, i) => (
                                    <Chip
                                        key={i}
                                        label={`${d.checkIn} – ${d.checkOut}`}
                                        color="error"
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {conflict && (
                        <Alert severity="warning">
                            A kiválasztott dátumok ütköznek egy már foglalt időszakkal. Kérjük, válasszon más dátumokat.
                        </Alert>
                    )}

                    {submitError ? <Alert severity="error">{submitError}</Alert> : null}

                    <TextField
                        label="Check-in"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: today }}
                        required
                        fullWidth
                    />

                    <TextField
                        label="Check-out"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: checkIn || today }}
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