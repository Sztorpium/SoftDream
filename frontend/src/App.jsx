/**
 * App – root router.
 *
 * Route map
 * ─────────
 * Public
 *   /               → redirect to /rooms
 *   /rooms          → RoomsPage
 *   /rooms/:roomId  → RoomDetailPage
 *   /login          → LoginPage
 *   /register       → RegisterPage
 *
 * Protected (requires login)
 *   /my-bookings    → MyBookingsPage
 *   /bookings/new   → BookingCreatePage
 *   /my-reviews     → MyReviewsPage
 *
 * Admin only
 *   /admin/users    → AdminUsersPage
 *   /admin/bookings → AdminBookingsPage
 */

import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import RoomsPage          from './pages/RoomsPage';
import RoomDetailPage     from './pages/RoomDetailPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import MyBookingsPage     from './pages/MyBookingsPage';
import BookingCreatePage  from './pages/BookingCreatePage';
import MyReviewsPage      from './pages/MyReviewsPage';
import AdminUsersPage     from './pages/admin/AdminUsersPage';
import AdminBookingsPage  from './pages/admin/AdminBookingsPage';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"              element={<Navigate to="/rooms" replace />} />
        <Route path="/rooms"         element={<RoomsPage />} />
        <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/register"      element={<RegisterPage />} />

        {/* Protected – authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-bookings"   element={<MyBookingsPage />} />
          <Route path="/bookings/new"  element={<BookingCreatePage />} />
          <Route path="/my-reviews"    element={<MyReviewsPage />} />
        </Route>

        {/* Protected – admin only */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/users"    element={<AdminUsersPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/rooms" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
