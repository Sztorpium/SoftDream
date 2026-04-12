import * as React from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HotelIcon from "@mui/icons-material/Hotel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import StarIcon from "@mui/icons-material/Star";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LockIcon from "@mui/icons-material/Lock";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NaturePeopleIcon from "@mui/icons-material/NaturePeople";
import styles from "./AboutPage.module.css";

const FEATURES = [
    {
        icon: <HotelIcon fontSize="large" />,
        title: "Kényelmes szobák",
        text: "Prémium minőségű szobáink modern berendezéssel, minden igényt kielégítve várják vendégeinket – az egyágyas szobáktól a luxusszvitokig.",
    },
    {
        icon: <CalendarMonthIcon fontSize="large" />,
        title: "Egyszerű foglalás",
        text: "Néhány kattintással lefoglalhatja álmai szobáját. Válassza ki az időpontot, erősítse meg a foglalást, és már mehet is!",
    },
    {
        icon: <StarIcon fontSize="large" />,
        title: "Valódi értékelések",
        text: "Vendégeink őszinte véleményei segítenek a legjobb döntés meghozatalában. Olvassa el mások tapasztalatait és ossza meg a sajátját is.",
    },
    {
        icon: <SupportAgentIcon fontSize="large" />,
        title: "24/7 ügyfélszolgálat",
        text: "Csapatunk az év minden napján, a nap 24 órájában rendelkezésre áll, hogy kérdéseire választ adjon és problémáit megoldja.",
    },
    {
        icon: <LockIcon fontSize="large" />,
        title: "Biztonságos fizetés",
        text: "Adatait és tranzakcióit a legmagasabb szintű titkosítással védjük. Foglalhat nyugodtan, mert nálunk az Ön biztonsága az első.",
    },
    {
        icon: <AutoAwesomeIcon fontSize="large" />,
        title: "Feledhetetlen élmény",
        text: "Célunk, hogy minden egyes tartózkodás egyedi és emlékezetes legyen. A legapróbb részletekre is odafigyelünk az Ön elégedettsége érdekében.",
    },
];

const STATS = [
    { icon: <HotelIcon />, value: "50+", label: "Szoba" },
    { icon: <PeopleIcon />, value: "10 000+", label: "Elégedett vendég" },
    { icon: <StarIcon />, value: "4.8/5", label: "Átlagos értékelés" },
    { icon: <EmojiEventsIcon />, value: "15+", label: "Év tapasztalat" },
];

const VALUES = [
    {
        icon: <EmojiEventsIcon fontSize="large" color="primary" />,
        title: "Minőség",
        text: "Kompromisszumot nem ismerünk: minden szobánkat, ételünket és szolgáltatásunkat a legmagasabb minőségi elvárások szerint nyújtjuk.",
        borderColor: "primary.main",
    },
    {
        icon: <PeopleIcon fontSize="large" color="secondary" />,
        title: "Vendégközpontúság",
        text: "Az Ön igényei és kényelme vezérel minket. Minden döntésünket az határozza meg, hogy vendégeink a lehető legjobb élménnyel távozzanak.",
        borderColor: "secondary.main",
    },
    {
        icon: <NaturePeopleIcon fontSize="large" color="success" />,
        title: "Fenntarthatóság",
        text: "Felelősen gazdálkodunk erőforrásainkkal. Környezetbarát megoldásokat alkalmazunk, hogy a természeti értékeket megőrizzük a jövő generációinak.",
        borderColor: "success.main",
    },
];

function FeatureCard({ icon, title, text }) {
    return (
        <Card
            variant="outlined"
            className={styles.featureCard}
        >
            <CardContent>
                <Stack spacing={1.5}>
                    <Box sx={{ color: "primary.main" }}>{icon}</Box>
                    <Typography variant="h6" className={styles.featureTitle}>
                        {title}
                    </Typography>
                    <Typography variant="body2" className={styles.featureText}>
                        {text}
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}

function StatCard({ icon, value, label }) {
    return (
        <Card
            variant="outlined"
            className={styles.statCard}
        >
            <CardContent>
                <Avatar
                    className={styles.statAvatar}
                    sx={{ bgcolor: "primary.main" }}
                >
                    {icon}
                </Avatar>
                <Typography variant="h4" className={styles.statValue} sx={{ color: "primary.main" }}>
                    {value}
                </Typography>
                <Typography variant="body2" className={styles.statLabel}>
                    {label}
                </Typography>
            </CardContent>
        </Card>
    );
}

function ValueCard({ icon, title, text, borderColor }) {
    return (
        <Card
            variant="outlined"
            className={styles.valueCard}
            sx={{ height: "100%", borderTop: "4px solid", borderColor }}
        >
            <CardContent>
                <Box sx={{ mb: 1 }}>{icon}</Box>
                <Typography variant="h6" className={styles.valueTitle}>
                    {title}
                </Typography>
                <Typography variant="body2" className={styles.valueText}>
                    {text}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function AboutPage() {
    return (
        <Container className={styles.page} maxWidth="lg">
            <Stack spacing={6}>

                {/* ── Hero ─────────────────────────────────────────── */}
                <Box
                    className={styles.hero}
                    sx={{
                        p: { xs: 3, md: 6 },
                        textAlign: { xs: "left", md: "center" },
                    }}
                >
                    <Chip label="Rólunk" color="primary" size="small" sx={{ mb: 2 }} />
                    <Typography variant="h3" component="h1" fontWeight={900} gutterBottom>
                        Üdvözöljük a SoftDream Hotelben
                    </Typography>
                    <Typography
                        variant="h6"
                        className={styles.heroSubtitle}
                        sx={{ mx: "auto" }}
                    >
                        Több mint 15 éve nyújtunk felejthetetlen szállásélményt vendégeinknek.
                        Fedezze fel prémium szobáinkat, és foglalja le álmai nyaralását néhány
                        kattintással!
                    </Typography>
                    <Box
                        className={styles.heroCtas}
                        sx={{ justifyContent: { xs: "flex-start", md: "center" } }}
                    >
                        <Button
                            component={RouterLink}
                            to="/rooms"
                            variant="contained"
                            size="large"
                        >
                            Szobák megtekintése
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/register"
                            variant="outlined"
                            size="large"
                        >
                            Regisztráció
                        </Button>
                    </Box>
                </Box>

                {/* ── Stats ────────────────────────────────────────── */}
                <Box>
                    <Grid container spacing={2} className={styles.cardGrid}>
                        {STATS.map((s) => (
                            <Grid item xs={6} md={3} key={s.label} className={styles.cardGridItem}>
                                <StatCard icon={s.icon} value={s.value} label={s.label} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* ── Story ────────────────────────────────────────── */}
                <Box>
                    <Typography variant="h4" fontWeight={900} gutterBottom>
                        A mi történetünk
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Stack spacing={2}>
                                <Typography
                                    variant="body1"
                                    sx={{ opacity: 0.9, lineHeight: 1.8 }}
                                >
                                    A SoftDream Hotel 2009-ben nyitotta meg kapuit azzal a
                                    céllal, hogy minden vendég különleges élménnyel távozzon.
                                    Alapítóink hittek abban, hogy a luxus nem csupán a
                                    csillogásról szól – sokkal inkább a gondoskodásról, a
                                    részletekre való odafigyelésről és az otthon melegéről.
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ opacity: 0.9, lineHeight: 1.8 }}
                                >
                                    Azóta folyamatosan fejlesztjük szolgáltatásainkat és
                                    szállodánk infrastruktúráját, hogy a lehető legmagasabb
                                    szintű kényelmet biztosítsuk. Büszkék vagyunk 10 000-nél is
                                    több elégedett vendégünkre és a közel 5 csillagos átlagos
                                    értékelésünkre.
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=500&fit=crop&auto=format&q=80"
                                alt="Hotel lobby"
                                className={styles.storyImage}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ── Features ─────────────────────────────────────── */}
                <Box>
                    <Typography variant="h4" fontWeight={900} gutterBottom>
                        Miért válasszon minket?
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={2} className={styles.cardGrid}>
                        {FEATURES.map((f) => (
                            <Grid item xs={12} sm={6} md={4} key={f.title} className={styles.cardGridItem}>
                                <FeatureCard icon={f.icon} title={f.title} text={f.text} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* ── Values ───────────────────────────────────────── */}
                <Box>
                    <Typography variant="h4" fontWeight={900} gutterBottom>
                        Értékeink
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={2} className={styles.cardGrid}>
                        {VALUES.map((v) => (
                            <Grid item xs={12} md={4} key={v.title} className={styles.cardGridItem}>
                                <ValueCard
                                    icon={v.icon}
                                    title={v.title}
                                    text={v.text}
                                    borderColor={v.borderColor}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* ── CTA ──────────────────────────────────────────── */}
                <Box
                    className={styles.cta}
                    sx={{ p: { xs: 3, md: 5 } }}
                >
                    <Typography variant="h4" fontWeight={900} gutterBottom>
                        Készen áll a tökéletes pihenésre?
                    </Typography>
                    <Typography
                        variant="body1"
                        className={styles.ctaSubtitle}
                    >
                        Ne habozzon – foglalja le szobáját még ma, és tapasztalja meg a
                        SoftDream egyedülálló vendéglátását!
                    </Typography>
                    <Button
                        component={RouterLink}
                        to="/rooms"
                        variant="contained"
                        size="large"
                        className={styles.ctaButton}
                    >
                        Foglaljon most!
                    </Button>
                </Box>

            </Stack>
        </Container>
    );
}