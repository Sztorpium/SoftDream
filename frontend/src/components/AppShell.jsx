import * as React from "react";
import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";

export default function AppShell({ children }) {
    return (
        <Box sx={{ minHeight: "100vh" }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        SoftDream
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container sx={{ py: 3 }}>{children}</Container>
        </Box>
    );
}