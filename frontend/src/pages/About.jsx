import * as React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";

const FEATURES = [
    {
        icon: <HotelIcon sx={{ fontSize: 48 }} color="primary" />,
        title: "Kényelmes szobák",
        description:
            "Böngéssz egyedi, gondosan válogatott szobáink között, és találd meg a számodra tökéletes helyet.",
    },
    {
        icon: <EventAvailableIcon sx={{ fontSize: 48 }} color="primary" />,
        title: "Egyszerű foglalás",
        description:
            "Pár kattintással lefoglalhatod a kiszemelt szobát, és nyomon követheted foglalásaidat.",
    },
    {
        icon: <StarIcon sx={{ fontSize: 48 }} color="primary" />,
        title: "Vendégértékelések",
        description:
            "Olvasd el korábbi vendégeink véleményét, vagy oszd meg a saját tapasztalataidat.",
    },
];

export default function About() {
    const navigate = useNavigate();

    return (
        <Box>
            {/* Hero section */}
            <Box
                sx={{
                    py: { xs: 6, md: 10 },
                    textAlign: "center",
                    background: (t) =>
                        `linear-gradient(135deg, ${t.palette.primary.light} 0%, ${t.palette.primary.dark} 100%)`,
                    color: "primary.contrastText",
                    borderRadius: 3,
                    mt: 2,
                    px: 3,
                }}
            >
                <Typography variant="h3" component="h1" fontWeight={800} gutterBottom>
                    Üdvözlünk a SoftDream-nél
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, mx: "auto", mb: 4 }}>
                    Az álom szálláshelyed mindössze pár kattintásra van. Fedezd fel szobáinkat,
                    foglalj könnyedén, és élj felejthetetlen élményeket.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/rooms")}
                    sx={{
                        bgcolor: "background.paper",
                        color: "primary.main",
                        fontWeight: 700,
                        px: 4,
                        "&:hover": { bgcolor: "grey.100" },
                    }}
                >
                    Szobák böngészése
                </Button>
            </Box>

            {/* Feature cards */}
            <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
                <Typography
                    variant="h4"
                    component="h2"
                    fontWeight={700}
                    textAlign="center"
                    gutterBottom
                >
                    Miért válassz minket?
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 5, maxWidth: 500, mx: "auto" }}
                >
                    Mindent egy helyen kínálunk, hogy szállásélményed a lehető legkellemesebb
                    legyen.
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    {FEATURES.map((f) => (
                        <Grid item xs={12} sm={6} md={4} key={f.title}>
                            <Card
                                elevation={2}
                                sx={{
                                    height: "100%",
                                    borderRadius: 3,
                                    transition: "box-shadow 0.2s",
                                    "&:hover": { boxShadow: 6 },
                                }}
                            >
                                <CardContent>
                                    <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 2 }}>
                                        {f.icon}
                                        <Typography variant="h6" fontWeight={700}>
                                            {f.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {f.description}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* CTA section */}
            <Box
                sx={{
                    py: { xs: 5, md: 7 },
                    textAlign: "center",
                    bgcolor: "grey.50",
                    borderRadius: 3,
                    mb: 2,
                    px: 3,
                }}
            >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Készen állsz a foglaláson?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Nézd meg elérhető szobáinkat, és foglald le a számodra ideálisat még ma.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/rooms")}
                    sx={{ px: 4, fontWeight: 700 }}
                >
                    Szobák megtekintése
                </Button>
            </Box>
        </Box>
    );
}
