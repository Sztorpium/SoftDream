import * as React from "react";
import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                mt: "auto",
                py: 3,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Container maxWidth="lg">
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                >
                    <Typography variant="body2" color="text.secondary">
                        © {new Date().getFullYear()} SoftDream. Minden jog fenntartva.
                    </Typography>

                    <Stack direction="row" spacing={2}>
                        <Link
                            component={RouterLink}
                            to="/rooms"
                            variant="body2"
                            color="text.secondary"
                            underline="hover"
                        >
                            Szobák
                        </Link>
                        <Link
                            component={RouterLink}
                            to="/about"
                            variant="body2"
                            color="text.secondary"
                            underline="hover"
                        >
                            Rólunk
                        </Link>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}
