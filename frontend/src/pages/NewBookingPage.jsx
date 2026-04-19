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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createBooking } from "../api/bookings";
import { getRoomById, getRoomBookedDates } from "../api/rooms";
import styles from "./NewBookingPage.module.css";

export default function NewBookingPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const roomId = params.get("roomId") || "";

    const [room, setRoom] = React.useState(null);
    const [loadingRoom, setLoadingRoom] = React.useState(Boolean(roomId));
    const [roomError, setRoomError] = React.useState("");

    const [bookedDates, setBookedDates] = React.useState([]);

    const [checkIn, setCheckIn] = React.useState(null);
    const [checkOut, setCheckOut] = React.useState(null);

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

    function isDateBooked(date) {
        return bookedDates.some(({ checkIn: bIn, checkOut: bOut }) => {
            return date.isAfter(dayjs(bIn).subtract(1, "day")) &&
                date.isBefore(dayjs(bOut));
        });
    }

    // Returns true if the [from, to) range overlaps with any existing booking.
    // Used to prevent "surrounding" a booked period with a new booking.
    function rangeOverlapsBooking(from, to) {
        if (!from || !to) return false;
        return bookedDates.some(({ checkIn: bIn, checkOut: bOut }) => {
            return dayjs(bIn).isBefore(to) && dayjs(bOut).isAfter(from);
        });
    }
    const rangeConflict = rangeOverlapsBooking(checkIn, checkOut);
    const canSubmit = Boolean(roomId && checkIn && checkOut) && !isSubmitting && !rangeConflict;

    async function onSubmit(e) {
        e.preventDefault();
        setSubmitError("");

        if (!roomId || !checkIn || !checkOut) return;

        setIsSubmitting(true);
        try {
            await createBooking({
                roomId: Number(roomId),
                checkIn: checkIn.format("YYYY-MM-DD"),
                checkOut: checkOut.format("YYYY-MM-DD"),
            });
            navigate("/my-bookings", { replace: true });
        } catch (err) {
            setSubmitError(err?.message || "Nem sikerült létrehozni a foglalást.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const today = dayjs();

    return (
        <Container className={styles.page} maxWidth="sm">
            <Paper className={styles.formPaper}>
                <Stack spacing={2} component="form" onSubmit={onSubmit} noValidate>
                    <Typography variant="h4" component="h1">
                        Új foglalás
                    </Typography>

                    {roomId ? (
                        loadingRoom ? (
                            <Box className={styles.loadingBox}>
                                <CircularProgress size={22} />
                            </Box>
                        ) : roomError ? (
                            <Alert severity="error">{roomError}</Alert>
                        ) : room ? (
                            <Alert severity="info">
                                Szoba: {room.roomNumber ?? `#${room.roomId ?? roomId}`}
                            </Alert>
                        ) : null
                    ) : (
                        <Alert severity="warning">
                            Hiányzik a <strong>szobaazonosító</strong> a URL-ből. Nyisd meg a foglalást a szoba
                            részleteinél.
                        </Alert>
                    )}

                    {bookedDates.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Nem elérhető időszakok:
                            </Typography>
                            <Box className={styles.bookedDatesBox}>
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

                    {submitError ? <Alert severity="error">{submitError}</Alert> : null}

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Érkezés"
                            value={checkIn}
                            onChange={(val) => {
                                setCheckIn(val);
                                setSubmitError("");
                                if (checkOut && val) {
                                    if (!checkOut.isAfter(val) || rangeOverlapsBooking(val, checkOut)) {
                                        setCheckOut(null);
                                    }
                                }
                            }}
                            minDate={today}
                            shouldDisableDate={(date) =>
                                isDateBooked(date) ||
                                (checkOut ? rangeOverlapsBooking(date, checkOut) : false)
                            }
                            slotProps={{ textField: { required: true, fullWidth: true } }}
                        />

                        <DatePicker
                            label="Távozás"
                            value={checkOut}
                            onChange={(val) => {
                                setCheckOut(val);
                                setSubmitError("");
                            }}
                            minDate={checkIn ? checkIn.add(1, "day") : today.add(1, "day")}
                            shouldDisableDate={(date) =>
                                isDateBooked(date) ||
                                (checkIn ? rangeOverlapsBooking(checkIn, date) : false)
                            }
                            slotProps={{ textField: { required: true, fullWidth: true } }}
                        />
                    </LocalizationProvider>

                    <Button type="submit" variant="contained" disabled={!canSubmit}>
                        {isSubmitting ? "Mentés..." : "Foglalás létrehozása"}
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}