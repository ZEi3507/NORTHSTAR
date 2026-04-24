import React from 'react';
import { Navigate } from 'react-router-dom';
import { useConductorStore } from '../stores/conductorStore';

// OWNER UID: Replace this with the actual Firebase UID string for the platform owner.
export const OWNER_UID = 'SwbYjFnnW4Pu9o3GQDyfefxZsU42';

interface RequireAdminProps {
  children: React.ReactNode;
}

export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { uid, isLoading } = useConductorStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-accent animate-pulse">VERIFYING AUTHORITY...</div>
      </div>
    );
  }

  if (uid !== OWNER_UID) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};
