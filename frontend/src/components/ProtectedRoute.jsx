/**
 * ProtectedRoute – redirects unauthenticated users to /login.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/my-bookings" element={<MyBookingsPage />} />
 *   </Route>
 *
 * The original destination is preserved as `state.from` so that LoginPage
 * can redirect back after a successful login.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
