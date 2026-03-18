/**
 * AdminRoute – redirects non-admin users to the home page.
 *
 * Wraps ProtectedRoute so unauthenticated users are still redirected to /login.
 *
 * Usage:
 *   <Route element={<AdminRoute />}>
 *     <Route path="/admin/users" element={<AdminUsersPage />} />
 *   </Route>
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
