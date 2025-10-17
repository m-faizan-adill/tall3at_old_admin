import React from 'react';
import { Navigate } from 'react-router-dom';

const getToken = () => localStorage.getItem('token');

export function PrivateRoute({ children }) {
    const token = getToken();
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export function PublicRoute({ children }) {
    const token = getToken();
    if (token) {
        return <Navigate to="/admin/home" replace />;
    }
    return children;
}
