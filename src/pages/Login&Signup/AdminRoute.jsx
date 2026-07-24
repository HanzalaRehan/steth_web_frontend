import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const DEFAULT_ALLOWED_ROLES = ['admin'];

/**
 * Protected route component for the /admin/* section.
 * Redirects to login if not authenticated, or home if authenticated
 * but the logged-in user's role isn't allowed in. Defaults to admin-only;
 * pass allowedRoles to widen it (e.g. the Marketing dashboard, B.3).
 */
const AdminRoute = ({ allowedRoles = DEFAULT_ALLOWED_ROLES }) => {
  const { checkAuthenticated, loading, user } = useContext(AuthContext);
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    if (!loading) {
      setIsAuth(checkAuthenticated());
    }
  }, [loading, checkAuthenticated]);

  // Show loading state while we determine authentication
  if (loading || isAuth === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role - this is client-side hiding only, the
  // real enforcement is server-side (auth+isAdmin/authorize on every route).
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Authorized, render the child routes
  return <Outlet />;
};

export default AdminRoute;
