import * as React from "react";
import { Box } from "@mui/material";

export default function RatingStars({ value = 0, outOf = 5, size = 16 }) {
    const v = Math.max(0, Math.min(outOf, Number(value) || 0));
    const full = Math.floor(v);
    const half = v - full >= 0.5;

    return (
        <Box sx={{ display: "inline-flex", gap: "2px", fontSize: size, lineHeight: 1 }}>
            {Array.from({ length: outOf }).map((_, i) => {
                const isFull = i < full;
                const isHalf = i === full && half;
                const char = isFull ? "★" : isHalf ? "⯪" : "☆"; // half is a decent fallback char
                const color = isFull || isHalf ? "#f5a623" : "rgba(0,0,0,0.35)";
                return (
                    <span key={i} style={{ color }}>
                        {char}
                    </span>
                );
            })}
        </Box>
    );
}