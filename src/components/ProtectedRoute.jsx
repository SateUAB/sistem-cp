import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Only allow access if the hostname is localhost or 127.0.0.1
    // This effectively hides the admin validation from the public deployment
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isLocal) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
