import { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ALLOWED_ROLES = ['admin'];

/**
 * Protected route component for the /admin/* section.
 * Redirects to login if not authenticated, or home if authenticated
 * but the logged-in user's role isn't allowed in.
 */
const AdminRoute = () => {
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
  // real enforcement is server-side (auth+isAdmin on every admin route).
  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Authorized, render the child routes
  return <Outlet />;
};

export default AdminRoute;
