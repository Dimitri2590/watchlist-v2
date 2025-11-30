import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AddFilmForm from './AddFilmForm';
import FilmList from './FilmList';
import FilmValide from './FilmValide';
import { supabase } from './supabaseClient.js';


// Contexte d'authentification
const AuthContext = createContext({});

// Hook personnalisé pour l'authentification
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Provider d'authentification
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    const value = {
        user,
        signIn,
        signOut,
        loading,
        supabase // Exposer supabase pour vos composants existants
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Page de connexion
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#1a1a1a] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white-900">
                        Connexion à votre Watchlist
                    </h2>
                </div>
                <div className="mt-8 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white-900 rounded-t-md focus:outline-none focus:ring-[#7f00ff] focus:border-[#7f00ff] focus:z-10 sm:text-sm"
                                    placeholder="Adresse email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white-900 rounded-b-md focus:outline-none focus:ring-[#7f00ff] focus:border-[#7f00ff] focus:z-10 sm:text-sm"
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#7f00ff] hover:bg-[#6a00d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7f00ff] disabled:opacity-50"
                            >
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Barre de navigation avec déconnexion
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

// Votre App existante avec vos composants
const MainApp = () => {
    const [refresh, setRefresh] = useState(0);

    const handleRefresh = () => {
        setRefresh(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#1a1a1a]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <title>Watchlist</title>

                <Routes>
                    <Route path="/" element={
                        <div className="space-y-12">
                            <section>
                                <AddFilmForm onAdd={handleRefresh} />
                            </section>

                            <section>
                                <FilmList refresh={refresh} />
                            </section>
                        </div>
                    } />
                    <Route path="/vus" element={<FilmValide />} />
                </Routes>
            </main>
        </div>
    );
};

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
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

// Composant App principal avec authentification
function App() {
    return (
        <AuthProvider>
            <div className="App">
                <ProtectedRoute>
                    <MainApp />
                </ProtectedRoute>
            </div>
        </AuthProvider>
    );
}

export default App;