import * as React from "react";
import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
    return (
        <Box component="footer" sx={{ mt: 6, py: 3, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <Container>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    © {new Date().getFullYear()} SoftDream — Hotel booking demo
                </Typography>
            </Container>
        </Box>
    );
}