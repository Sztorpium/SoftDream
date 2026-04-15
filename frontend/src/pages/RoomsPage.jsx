import * as React from "react";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    Grid,
    MenuItem,
    Slider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getAllRooms } from "../api/rooms";
import { getAverageRating } from "../api/reviews";
import RatingStars from "../components/RatingStars";
import { getRoomImage } from "../utils/roomImages";
import styles from "./RoomsPage.module.css";

function formatPrice(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF" }).format(n);
}

function getRoomType(room) {
    // adapt if you have a `type` field; fallback from name/category
    return room.type ?? room.roomType ?? room.category ?? "";
}

const TEXT_SEARCH_DEBOUNCE_MS = 350;

export default function RoomsPage() {
    const [allRooms, setAllRooms] = React.useState([]);       // unfiltered – used for types dropdown & slider max
    const [rooms, setRooms] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [roomAverageRatings, setRoomAverageRatings] = React.useState({});

    // filters
    const [q, setQ] = React.useState("");
    const [type, setType] = React.useState("ALL");
    const [maxPrice, setMaxPrice] = React.useState(null);
    const [sort, setSort] = React.useState("RECOMMENDED"); // PRICE_ASC / PRICE_DESC

// Fetch the full room list once to drive the types dropdown and the price slider max.
    React.useEffect(() => {
        let cancelled = false;

        getAllRooms()
            .then((data) => {
                if (!cancelled) setAllRooms(Array.isArray(data) ? data : []);
            })
            .catch(() => {});
                return () => { cancelled = true; };
            }, []);

        // Re-fetch whenever filters change, with a short debounce for the text field.
            React.useEffect(() => {
                let cancelled = false;
                setLoading(true);
                setError("");

                const timer = setTimeout(() => {
                    getAllRooms({ q, type, maxPrice, sort })
                        .then((data) => {
                            if (!cancelled) setRooms(Array.isArray(data) ? data : []);
                        })
                        .catch((err) => {
                            if (!cancelled) setError(err?.message || "Nem sikerült betölteni a szobákat.");
                        })
                        .finally(() => {
                            if (!cancelled) setLoading(false);
                        });
                }, q.trim() ? TEXT_SEARCH_DEBOUNCE_MS : 0);

                return () => {
                    cancelled = true;
                    clearTimeout(timer);
                };
            }, [q, type, maxPrice, sort]);

    React.useEffect(() => {
        let cancelled = false;

        async function loadAverageRatings() {
            const roomIds = rooms
                .map((r) => r.id ?? r.roomId)
                .filter((id) => id != null);

            if (roomIds.length === 0) {
                setRoomAverageRatings({});
                return;
            }

            const uniqueRoomIds = Array.from(new Set(roomIds));

            try {
                const entries = await Promise.all(
                    uniqueRoomIds.map(async (roomId) => {
                        const avgData = await getAverageRating(roomId);
                        const avgValue =
                            typeof avgData === "number"
                                ? avgData
                                : typeof avgData?.average === "number"
                                    ? avgData.average
                                    : typeof avgData?.value === "number"
                                        ? avgData.value
                                        : null;
                        return [String(roomId), avgValue];
                    })
                );

                if (!cancelled) {
                    setRoomAverageRatings(Object.fromEntries(entries));
                }
            } catch {
                if (!cancelled) {
                    setRoomAverageRatings({});
                }
            }
        }

        loadAverageRatings();

        return () => {
            cancelled = true;
        };
    }, [rooms]);

    const maxAvailablePrice = React.useMemo(() => {
        const prices = allRooms
            .map((r) => Number(r.pricePerNight ?? r.price ?? r.nightlyPrice ?? 0))
            .filter((p) => Number.isFinite(p) && p > 0);
        if (prices.length === 0) return 100;
        return Math.max(...prices);
    }, [allRooms]);

    const maxSliderValue = React.useMemo(() => {
        if (!Number.isFinite(maxAvailablePrice) || maxAvailablePrice <= 0) {
            return 100000;
        }

        const scaled = maxAvailablePrice * 1.2;
        return Math.max(1000, Math.ceil(scaled / 1000) * 1000);
    }, [maxAvailablePrice]);

    const displayedMaxPrice = maxPrice ?? maxSliderValue;

    const activeFilterCount = React.useMemo(() => {
        let count = 0;
        if (q.trim() !== "") count += 1;
        if (type !== "ALL") count += 1;
        if (maxPrice != null) count += 1;
        if (sort !== "RECOMMENDED") count += 1;
        return count;
    }, [q, type, maxPrice, sort]);

    const roomTypes = React.useMemo(() => {
        const set = new Set();
        allRooms.forEach((r) => {
            const t = String(getRoomType(r) || "").trim();
            if (t) set.add(t);
        });
        return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [allRooms]);

    return (
        <Container className={styles.page} maxWidth="xl">
            <Stack spacing={2} className={styles.content}>
                <Box>
                    <Typography variant="h4" component="h1">
                        Szobák
                    </Typography>
                    <Typography variant="body2" className={styles.pageSubtitle}>
                        Böngéssz a szobák között, állítsd be a szűrőket, és találd meg a legjobb ajánlatot.
                    </Typography>
                </Box>

                {/* Filters */}
                <Card variant="outlined" className={styles.filterCard}>
                    <CardContent>
                        <Grid container spacing={2} className={styles.filterGrid}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box className={styles.filterItem}>
                                    <Typography variant="caption" className={styles.fieldLabel}>Keresés</Typography>
                                    <TextField
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="pl. deluxe, panoráma, családi"
                                        size="small"
                                        fullWidth
                                    />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <Box className={styles.filterItem}>
                                    <Typography variant="caption" className={styles.fieldLabel}>Típus</Typography>
                                    <TextField
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        select
                                        size="small"
                                        fullWidth
                                    >
                                        {roomTypes.map((t) => (
                                            <MenuItem key={t} value={t}>
                                                {t === "ALL" ? "Összes" : t}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box className={styles.filterItem}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" className={styles.fieldLabel}>Max ár / éj</Typography>
                                        <Typography variant="caption" className={styles.pricePreviewText}>
                                            {formatPrice(displayedMaxPrice)}
                                        </Typography>
                                    </Stack>
                                    <Box className={styles.priceFilterBlock}>
                                        <Stack direction="row" spacing={1} alignItems="center" className={styles.priceControlRow}>
                                            <Slider
                                                min={0}
                                                max={maxSliderValue}
                                                step={1000}
                                                value={displayedMaxPrice}
                                                onChange={(_, value) => setMaxPrice(Number(value))}
                                                valueLabelDisplay="auto"
                                                valueLabelFormat={(value) => formatPrice(value)}
                                                sx={{ flexGrow: 1 }}
                                            />
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={displayedMaxPrice}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    if (raw === "") {
                                                        setMaxPrice(null);
                                                        return;
                                                    }
                                                    const n = Number(raw);
                                                    if (!Number.isFinite(n)) return;
                                                    const clamped = Math.max(0, Math.min(maxSliderValue, n));
                                                    setMaxPrice(clamped);
                                                }}
                                                inputProps={{ min: 0, max: maxSliderValue, step: 1000 }}
                                                sx={{ width: 124 }}
                                            />
                                        </Stack>
                                        <Typography variant="caption" className={styles.sliderHint}>
                                            Tartomány: 0 – {formatPrice(maxSliderValue)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 2 }}>
                                <Box className={styles.filterItem}>
                                    <Typography variant="caption" className={styles.fieldLabel}>Rendezés</Typography>
                                    <TextField
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value)}
                                        select
                                        size="small"
                                        fullWidth
                                    >
                                        <MenuItem value="RECOMMENDED">Ajánlott</MenuItem>
                                        <MenuItem value="PRICE_ASC">Ár ↑</MenuItem>
                                        <MenuItem value="PRICE_DESC">Ár ↓</MenuItem>
                                    </TextField>
                                </Box>
                            </Grid>
                        </Grid>

                        <Box className={styles.chipRow}>
                            <Chip label={`Összes: ${allRooms.length}`} variant="outlined" />
                            <Chip label={`Találat: ${rooms.length}`} color="primary" variant="outlined" />
                            {activeFilterCount > 0 && (
                                <Chip label={`Aktív szűrők: ${activeFilterCount}`} color="secondary" variant="outlined" />
                            )}
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => { setQ(""); setType("ALL"); setMaxPrice(null); setSort("RECOMMENDED"); }}
                            >
                                Szűrők törlése
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* List */}
                {loading ? (
                    <Box className={styles.loadingBox}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box className={styles.stateBox}>
                        <Typography color="error" fontWeight={700}>Hiba történt</Typography>
                        <Typography color="error">{error}</Typography>
                    </Box>
                ) : rooms.length === 0 ? (
                    <Box className={styles.stateBox}>
                        <Typography sx={{ fontWeight: 700 }}>Nincs találat</Typography>
                        <Typography sx={{ opacity: 0.82 }}>Próbálj lazább szűrőket vagy töröld a beállításokat.</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={2} className={`${styles.list} ${styles.roomGrid}`}>
                        {rooms.map((r) => {
                            const id = r.id ?? r.roomId;
                            const price = r.pricePerNight ?? r.price ?? r.nightlyPrice;
                            const directRating = r.avgRating ?? r.ratingAvg ?? r.rating ?? r.averageRating;
                            const rating =
                                Number.isFinite(Number(directRating))
                                    ? Number(directRating)
                                    : (id != null ? roomAverageRatings[String(id)] : null);

                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={id ?? JSON.stringify(r)} className={styles.roomGridItem}>
                                    <Card variant="outlined" className={styles.roomCard}>
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={getRoomImage(id)}
                                            alt={r.name ?? `Szoba #${id ?? "?"}`}
                                            className={styles.roomCardImg}
                                        />
                                        <CardContent className={styles.roomCardContent}>
                                            <Stack spacing={1.2}>
                                                <Box className={styles.roomHeaderRow}>
                                                    <Typography variant="h6" className={styles.roomName}>
                                                        {r.name ?? `Szoba #${id ?? "?"}`}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={getRoomType(r) || "Room"}
                                                        variant="outlined"
                                                    />
                                                </Box>

                                                <Box className={styles.ratingRow}>
                                                    <RatingStars value={rating ?? 0} size={18} />
                                                    <Typography variant="body2" className={styles.ratingText}>
                                                        {rating == null ? "Nincs értékelés" : Number(rating).toFixed(1)}
                                                    </Typography>
                                                </Box>

                                                <Typography variant="body2" className={styles.roomDesc}>
                                                    {r.description ? String(r.description).slice(0, 120) : " "}
                                                    {r.description && String(r.description).length > 120 ? "…" : ""}
                                                </Typography>

                                                <Typography variant="h6" className={styles.priceText}>
                                                    {formatPrice(price)}{" "}
                                                    <Typography component="span" variant="body2" className={styles.priceUnit}>
                                                        / éj
                                                    </Typography>
                                                </Typography>
                                            </Stack>
                                        </CardContent>

                                        <CardActions className={styles.roomActions}>
                                            <Button
                                                component={RouterLink}
                                                to={`/rooms/${id}`}
                                                variant="contained"
                                                fullWidth
                                                disabled={id == null}
                                            >
                                                Részletek
                                            </Button>
                                        </CardActions>
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