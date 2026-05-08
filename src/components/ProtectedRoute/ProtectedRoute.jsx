import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * ProtectedRoute — renders children only when the user is authenticated.
 * While the initial silent refresh is in progress, renders a full-screen
 * loading indicator so there is no flash-of-unauthenticated-content.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-purple-600/30 border-t-purple-500 animate-spin" />
          <p className="text-gray-600 text-sm">Restoring session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the intended destination so we can redirect back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
