import * as React from "react";
import { Container, Typography } from "@mui/material";

export default function About() {
    return (
        <Container sx={{ py: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                About
            </Typography>
            <Typography variant="body1" color="text.secondary">
                SoftDream frontend – About page.
            </Typography>
        </Container>
    );
}