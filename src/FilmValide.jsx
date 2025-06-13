import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './FilmList.css'

export default function FilmValide() {
    const [films, setFilms] = useState([]);

    useEffect(() => {
        const fetchFilms = async () => {
            const { data, error } = await supabase
                .from('films')
                .select('*')
                .eq('vu', true)
                .order('priorite', { ascending: true });

            if (!error) setFilms(data);
        };
        fetchFilms();
    }, []);

    return (
        <div>
            <h2>🎉 Films déjà vus</h2>
            <ul>
                {films.map(film => (
                    <li key={film.id}>{film.titre} ({film.type})</li>
                ))}
            </ul>
        </div>
    );
}