import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean;
  requireCaretaker?: boolean;
}

function ProtectedRoute({ children, requireOwner = false, requireCaretaker = false }: ProtectedRouteProps) {
  const { isAuthenticated, userProfile, loading } = useAuth();
  const location = useLocation();

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
    // Allow access if profile is null (still loading) or if user is caretaker or dienstleister
    if (userProfile && userProfile.user_type !== 'caretaker' && userProfile.user_type !== 'dienstleister') {
      return <Navigate to="/" replace />;
    }
  }

  // All checks passed - render children
  return <>{children}</>;
}

export default ProtectedRoute; 