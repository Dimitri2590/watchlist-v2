import { Routes, Route, BrowserRouter } from 'react-router-dom';
import App from './App';
import FilmList from './FilmList';
import SeenFilmsList from './FilmValide';

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/vu" element={<SeenFilmsList />} />
            </Routes>
        </BrowserRouter>
    );
}