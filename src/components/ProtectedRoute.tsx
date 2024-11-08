// src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean; // Optional prop to check if it's an admin route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly }) => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    return <Navigate to="/signin" />;
  }

  const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the JWT
  if (adminOnly && decodedToken?.role !== 'admin') {
    return <Navigate to="/" />; // Redirect non-admin users to home or another page
  }

  return <>{children}</>;
};

export default ProtectedRoute;
