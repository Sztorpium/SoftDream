import * as React from "react";
import { Container, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function NotFound() {
    return (
        <Container sx={{ py: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h4" component="h1">
                    404
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    The page you are looking for does not exist.
                </Typography>

                <div>
                    <Button variant="contained" component={RouterLink} to="/">
                        Back to Home
                    </Button>
                </div>
            </Stack>
        </Container>
    );
}