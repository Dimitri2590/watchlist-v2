import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { signOut } = useAuth();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center gap-3 mr-8">
                            <span className="text-2xl">🎥</span>
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Watchlist</span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')
                                        ? 'bg-[#7f00ff]/10 text-[#7f00ff]'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-[#7f00ff] hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    Ma Liste
                                </Link>
                                <Link
                                    to="/vus"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/vus')
                                        ? 'bg-[#7f00ff]/10 text-[#7f00ff]'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-[#7f00ff] hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    Films Vus
                                </Link>
                                <Link
                                    to="/voyages"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/voyages')
                                        ? 'bg-[#7f00ff]/10 text-[#7f00ff]'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-[#7f00ff] hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    Voyages
                                </Link>
                                <Link
                                    to="/date"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/date')
                                        ? 'bg-[#7f00ff]/10 text-[#7f00ff]'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-[#7f00ff] hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    Date
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="md:hidden flex space-x-2">
                            <Link to="/" className={`text-sm ${isActive('/') ? 'text-[#7f00ff] font-bold' : 'text-gray-500'}`}>Liste</Link>
                            <Link to="/vus" className={`text-sm ${isActive('/vus') ? 'text-[#7f00ff] font-bold' : 'text-gray-500'}`}>Vus</Link>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="ml-4 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors shadow-sm"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
