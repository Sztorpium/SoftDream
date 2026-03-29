import * as React from "react";
import { Box } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import StarBorderIcon from "@mui/icons-material/StarBorder";

export default function RatingStars({ value = 0, outOf = 5, size = 16 }) {
    const v = Math.max(0, Math.min(outOf, Number(value) || 0));
    const full = Math.floor(v);
    const half = v - full >= 0.5;

    return (
        <Box sx={{ display: "inline-flex", gap: "2px", lineHeight: 1 }}>
            {Array.from({ length: outOf }).map((_, i) => {
                const isFull = i < full;
                const isHalf = i === full && half;
                const color = isFull || isHalf ? "#f5a623" : "rgba(0,0,0,0.35)";
                const Icon = isFull ? StarIcon : isHalf ? StarHalfIcon : StarBorderIcon;
                return (
                    <Icon key={i} sx={{ color, fontSize: size }} />
                );
            })}
        </Box>
    );
}