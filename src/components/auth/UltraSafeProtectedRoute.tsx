import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useEffect, useState } from 'react';

interface UltraSafeProtectedRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean;
  requireCaretaker?: boolean;
}

function UltraSafeProtectedRoute({ children, requireOwner = false, requireCaretaker = false }: UltraSafeProtectedRouteProps) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  // Sichere Auth-Daten-Extraktion
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Auth context error:', error);
    authContext = {
      isAuthenticated: false,
      userProfile: null,
      loading: false
    };
  }

  const { isAuthenticated, userProfile, loading } = authContext;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for component to mount
  if (!mounted) {
    return <LoadingSpinner />;
  }

  // Show loading spinner while authentication is being checked
  if (authState.loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!authState.isAuthenticated) {
    return <Navigate to="/anmelden" state={{ from: location }} replace />;
  }

  // User is authenticated - check specific requirements
  try {
    if (requireOwner) {
      const userType = authState.userProfile?.user_type;
      if (userType && userType !== 'owner') {
        return <Navigate to="/" replace />;
      }
    }

    if (requireCaretaker) {
      const userType = authState.userProfile?.user_type;
      if (userType && userType !== 'caretaker' && userType !== 'dienstleister') {
        return <Navigate to="/" replace />;
      }
    }

    // All checks passed - render children
    return <>{children}</>;
  } catch (error) {
    console.error('UltraSafeProtectedRoute error:', error);
    return <Navigate to="/" replace />;
  }
}

export default UltraSafeProtectedRoute;
