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
    Grid,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { createRoom, deleteRoom, getAllRooms, updateRoomStatus } from "../../api/rooms";
import { translateRoomStatus, translateRoomType } from "../../utils/displayText";
import styles from "./AdminRoomsPage.module.css";

const ROOM_TYPE_OPTIONS = [
    { id: 1, code: "SINGLE", label: "Egyágyas" },
    { id: 2, code: "DOUBLE", label: "Kétágyas" },
    { id: 3, code: "TRIPLE", label: "Háromágyas" },
    { id: 4, code: "SUITE", label: "Lakosztály" },
    { id: 5, code: "PENTHOUSE", label: "Penthouse" },
];

const ROOM_STATUS_OPTIONS = [
    { id: 1, code: "AVAILABLE", label: "Elérhető" },
    { id: 2, code: "BOOKED", label: "Foglalt" },
    { id: 3, code: "MAINTENANCE", label: "Karbantartás alatt" },
];

function getRoomId(room) {
    return room?.roomId ?? room?.id ?? null;
}

function getStatusIdByName(status) {
    const normalized = String(status ?? "").toUpperCase();
    const match = ROOM_STATUS_OPTIONS.find((option) => option.code === normalized);
    return match?.id ?? "";
}

function formatMoney(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "—";
    return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF" }).format(amount);
}

export default function AdminRoomsPage() {
    const [rooms, setRooms] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");
    const [deletingId, setDeletingId] = React.useState(null);
    const [updatingId, setUpdatingId] = React.useState(null);
    const [savingRoom, setSavingRoom] = React.useState(false);
    const [form, setForm] = React.useState({
        roomNumber: "",
        floor: "",
        roomTypeId: "1",
        roomStatusId: "1",
        maxGuests: "1",
    });

    const load = React.useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAllRooms();
            setRooms(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || "Nem sikerült betölteni a szobákat.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    function handleChange(field) {
        return (event) => {
            const value = event.target.value;
            setForm((prev) => ({ ...prev, [field]: value }));
            setError("");
            setSuccess("");
        };
    }

    async function handleCreate(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (
            form.roomNumber.trim() === "" ||
            form.floor === "" ||
            form.roomTypeId === "" ||
            form.roomStatusId === "" ||
            form.maxGuests === ""
        ) {
            setError("Minden mezőt ki kell tölteni.");
            return;
        }

        setSavingRoom(true);
        try {
            await createRoom({
                roomNumber: form.roomNumber.trim(),
                floor: Number(form.floor),
                roomTypeId: Number(form.roomTypeId),
                roomStatusId: Number(form.roomStatusId),
                maxGuests: Number(form.maxGuests),
            });
            setForm({
                roomNumber: "",
                floor: "",
                roomTypeId: "1",
                roomStatusId: "1",
                maxGuests: "1",
            });
            setSuccess("Az új szoba létrehozva.");
            await load();
        } catch (err) {
            setError(err?.message || "Nem sikerült létrehozni a szobát.");
        } finally {
            setSavingRoom(false);
        }
    }

    async function handleUpdateStatus(roomId, statusId) {
        if (roomId == null || statusId === "") return;

        setUpdatingId(roomId);
        setError("");
        setSuccess("");
        try {
            await updateRoomStatus(roomId, { roomStatusId: Number(statusId) });
            setSuccess("A szoba státusza frissítve.");
            await load();
        } catch (err) {
            setError(err?.message || "Nem sikerült módosítani a szoba státuszát.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function handleDelete(roomId, roomNumber) {
        const ok = window.confirm(`Biztosan törlöd ezt a szobát?${roomNumber ? ` (${roomNumber})` : ""}`);
        if (!ok) return;

        setDeletingId(roomId);
        setError("");
        setSuccess("");
        try {
            await deleteRoom(roomId);
            setSuccess("A szoba törölve lett.");
            await load();
        } catch (err) {
            setError(err?.message || "Nem sikerült törölni a szobát.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <Container className={styles.page} maxWidth="xl">
            <Stack spacing={3} className={styles.content}>
                <div>
                    <span className={styles.adminBadge}>Admin</span>
                </div>

                <Box>
                    <Typography variant="h4" component="h1">
                        Admin - Szobák
                    </Typography>
                    <Typography variant="body2" className={styles.pageSubtitle}>
                        Itt lehet új szobát létrehozni, valamint a meglévő szobák státuszát módosítani vagy törölni.
                    </Typography>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}
                {success ? <Alert severity="success">{success}</Alert> : null}

                <Paper className={styles.formCard}>
                    <Stack spacing={2} component="form" onSubmit={handleCreate}>
                        <Typography variant="h6" fontWeight={800}>
                            Új szoba
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <TextField
                                    label="Szobaszám"
                                    value={form.roomNumber}
                                    onChange={handleChange("roomNumber")}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <TextField
                                    label="Emelet"
                                    type="number"
                                    value={form.floor}
                                    onChange={handleChange("floor")}
                                    fullWidth
                                    required
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <TextField
                                    label="Szobatípus"
                                    select
                                    value={form.roomTypeId}
                                    onChange={handleChange("roomTypeId")}
                                    fullWidth
                                    required
                                >
                                    {ROOM_TYPE_OPTIONS.map((option) => (
                                        <MenuItem key={option.id} value={String(option.id)}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <TextField
                                    label="Státusz"
                                    select
                                    value={form.roomStatusId}
                                    onChange={handleChange("roomStatusId")}
                                    fullWidth
                                    required
                                >
                                    {ROOM_STATUS_OPTIONS.map((option) => (
                                        <MenuItem key={option.id} value={String(option.id)}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <TextField
                                    label="Max vendég"
                                    type="number"
                                    value={form.maxGuests}
                                    onChange={handleChange("maxGuests")}
                                    fullWidth
                                    required
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                        </Grid>

                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
                            <Button type="submit" variant="contained" disabled={savingRoom}>
                                {savingRoom ? "Mentés..." : "Szoba létrehozása"}
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>

                <Divider />

                {loading ? (
                    <Box className={styles.loadingBox}>
                        <CircularProgress />
                    </Box>
                ) : rooms.length === 0 ? (
                    <Typography color="text.secondary">Nincs megjeleníthető szoba.</Typography>
                ) : (
                    <Grid container spacing={2}>
                        {rooms.map((room) => {
                            const roomId = getRoomId(room);
                            const statusId = getStatusIdByName(room.status);
                            const statusLabel = translateRoomStatus(room.status);
                            const typeLabel = translateRoomType(room.type);

                            return (
                                <Grid key={roomId ?? JSON.stringify(room)} size={{ xs: 12, md: 6 }}>
                                    <Card variant="outlined" className={styles.roomCard}>
                                        <CardContent>
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" justifyContent="space-between" gap={2}>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight={800}>
                                                            Szoba #{room.roomNumber ?? roomId ?? "?"}
                                                        </Typography>
                                                        <Typography variant="body2" className={styles.roomMeta}>
                                                            ID: {roomId ?? "—"}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" className={styles.roomPrice}>
                                                        {formatMoney(room.pricePerNight)} / éj
                                                    </Typography>
                                                </Stack>

                                                <Typography variant="body2" className={styles.roomMeta}>
                                                    Típus: {typeLabel}
                                                </Typography>
                                                <Typography variant="body2" className={styles.roomMeta}>
                                                    Emelet: {room.floor ?? "—"} | Max vendég: {room.maxGuests ?? "—"}
                                                </Typography>
                                                <Typography variant="body2" className={styles.roomMeta}>
                                                    Jelenlegi státusz: {statusLabel}
                                                </Typography>

                                                <TextField
                                                    select
                                                    size="small"
                                                    label="Státusz módosítása"
                                                    value={statusId}
                                                    onChange={(event) => handleUpdateStatus(roomId, event.target.value)}
                                                    disabled={updatingId === roomId || roomId == null}
                                                >
                                                    {ROOM_STATUS_OPTIONS.map((option) => (
                                                        <MenuItem key={option.id} value={String(option.id)}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Stack>
                                        </CardContent>

                                        <Stack direction="row" justifyContent="flex-end" gap={1} className={styles.roomActions}>
                                            <Button
                                                color="error"
                                                variant="outlined"
                                                onClick={() => handleDelete(roomId, room.roomNumber)}
                                                disabled={deletingId === roomId || roomId == null}
                                            >
                                                {deletingId === roomId ? "Törlés..." : "Törlés"}
                                            </Button>
                                        </Stack>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Stack>
        </Container>
    );
}