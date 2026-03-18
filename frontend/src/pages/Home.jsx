import * as React from "react";
import { Container, Typography } from "@mui/material";

export default function Home() {
    return (
        <Container sx={{ py: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Home
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Welcome to SoftDream frontend.
            </Typography>
        </Container>
    );
}