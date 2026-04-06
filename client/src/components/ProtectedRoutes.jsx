// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    console.log('Current user from context:', user);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
