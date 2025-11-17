import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useEffect, useState } from 'react';

interface SafeProtectedRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean;
  requireCaretaker?: boolean;
}

function SafeProtectedRoute({ children, requireOwner = false, requireCaretaker = false }: SafeProtectedRouteProps) {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for component to mount to avoid hydration issues
  if (!mounted) {
    return <LoadingSpinner />;
  }

  // Show loading spinner while authentication is being checked
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/anmelden" state={{ from: location }} replace />;
  }

  // User is authenticated - check specific requirements
  if (requireOwner) {
    // Allow access if profile is null (still loading) or if user is owner
    if (userProfile && userProfile.user_type !== 'owner') {
      return <Navigate to="/" replace />;
    }
  }

  if (requireCaretaker) {
    // Allow access if profile is null (still loading) or if user is any type of service provider
    const isServiceProvider = userProfile && (
      userProfile.user_type === 'caretaker' ||
      userProfile.user_type === 'dienstleister' ||
      userProfile.user_type === 'tierarzt' ||
      userProfile.user_type === 'hundetrainer' ||
      userProfile.user_type === 'tierfriseur' ||
      userProfile.user_type === 'physiotherapeut' ||
      userProfile.user_type === 'ernaehrungsberater' ||
      userProfile.user_type === 'tierfotograf' ||
      userProfile.user_type === 'sonstige'
    );
    
    if (userProfile && !isServiceProvider) {
      return <Navigate to="/" replace />;
    }
  }

  // All checks passed - render children
  return <>{children}</>;
}

export default SafeProtectedRoute;
