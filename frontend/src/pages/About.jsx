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
import { Link as RouterLink } from "react-router-dom";

function FeatureCard({ title, text }) {
    return (
        <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {text}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default function About() {
    return (
        <Container sx={{ py: 4 }}>
            <Box
                sx={{
                    p: { xs: 2.5, md: 4 },
                    borderRadius: 4,
                    background:
                        "linear-gradient(135deg, rgba(25,118,210,0.12), rgba(124,77,255,0.10))",
                    border: "1px solid rgba(0,0,0,0.06)",
                }}
            >
                <Stack spacing={1}>
                    <Typography variant="h4" component="h1">
                        About SoftDream
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 720 }}>
                        A simple hotel booking app: browse rooms, book dates, leave reviews,
                        and manage bookings. Admins can manage users and bookings.
                    </Typography>

                    <Box sx={{ pt: 2 }}>
                        <Button component={RouterLink} to="/rooms" variant="contained">
                            Browse rooms
                        </Button>
                    </Box>
                </Stack>
            </Box>

            <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <FeatureCard
                            title="Rooms"
                            text="List rooms, view details, pricing, and ratings."
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FeatureCard
                            title="Bookings"
                            text="Create bookings and view your booking history."
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FeatureCard
                            title="Reviews"
                            text="Read reviews on room pages and manage your reviews."
                        />
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
}
