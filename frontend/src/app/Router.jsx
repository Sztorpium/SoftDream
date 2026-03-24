import * as React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Home from "../pages/Home";
import About from "../pages/About";
import Login from "../pages/Login";
import Register from "../pages/Register";
import MyBookingsPage from "../pages/MyBookingsPage";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/ProtectedRoute";
import RoomsPage from "../pages/RoomsPage";
import RoomDetailPage from "../pages/RoomDetailPage";
import NewBookingPage from "../pages/NewBookingPage";

export default function AppRouter() {
    return (
        <AppShell>
            <Routes>
                <Route path="/" element={<Navigate to="/rooms" replace />} />

                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/rooms/:roomId" element={<RoomDetailPage />} />

                {/* kept for now */}
                <Route path="/home" element={<Home />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/about" element={<About />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route path="/bookings/new" element={<NewBookingPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </AppShell>
    );
}