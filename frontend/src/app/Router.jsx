import * as React from "react";
import { Routes, Route } from "react-router-dom";
import AppShell from "../components/AppShell";
import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";

export default function AppRouter() {
    return (
        <AppShell>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AppShell>
    );
}