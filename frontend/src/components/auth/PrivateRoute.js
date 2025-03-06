import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../config';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted url
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    // Redirect to home page if user is not an admin
    return <Navigate to={ROUTES.home} replace />;
  }

  return children;
};

export default PrivateRoute; 