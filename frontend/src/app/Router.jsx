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
import MyReviewsPage from "../pages/MyReviewsPage";
import AdminRoute from "../components/AdminRoute";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";


export default function AppRouter() {
    return (
        <AppShell>
            <Routes>
                <Route path="/" element={<Navigate to="/rooms" replace />} />

                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
                <Route path="/about" element={<About />} />

                {/* kept for now */}
                <Route path="/home" element={<Home />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route path="/my-reviews" element={<MyReviewsPage />} />
                    <Route path="/bookings/new" element={<NewBookingPage />} />
                </Route>

                <Route element={<AdminRoute />}>
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </AppShell>
    );
}