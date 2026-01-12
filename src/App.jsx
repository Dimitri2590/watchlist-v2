import React from 'react';
import { Routes, Route as RouterRoute } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Route from './components/Route';
import Home from './pages/Home';
import SeenFilms from './pages/SeenFilms';
import Voyage from './pages/Voyage';

function App() {
    return (
        <AuthProvider>
            <div className="App min-h-screen bg-gray-100 dark:bg-[#1a1a1a]">
                <Route>
                    <Navbar />
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <title>Watchlist</title>
                        <Routes>
                            <RouterRoute path="/" element={<Home />} />
                            <RouterRoute path="/vus" element={<SeenFilms />} />
                            <RouterRoute path="/voyages" element={<Voyage />} />
                        </Routes>
                    </main>
                </Route>
            </div>
        </AuthProvider>
    );
}

export default App;