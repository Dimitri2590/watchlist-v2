import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

const Route = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7f00ff]"></div>
            </div>
        );
    }

    // Si pas connecté -> Page de connexion uniquement
    if (!user) {
        return <Login />;
    }

    // Si connecté -> Vos composants existants
    return children;
};

export default Route;
