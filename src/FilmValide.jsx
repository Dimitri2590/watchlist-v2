// src/SeenFilmsList.jsx
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './FilmList.css'

export default function SeenFilmsList() {
    const [films, setFilms] = useState([])

    useEffect(() => {
        const fetchFilms = async () => {
            const { data, error } = await supabase
                .from('films')
                .select('*')
                .eq('vu', true)
                .order('priorite', { ascending: true })

            if (!error) setFilms(data)
        }
        fetchFilms()
    }, [])

    return (
        <div className="film-list-container">
            <h2>✅ Films vus</h2>
            <ul className="film-list">
                {films.map((film) => (
                    <li key={film.id} className="film-list-item">
                        <div className="film-item-flex">
                            <img src="src/assets/test.jpg" alt="test" className="film-image" />
                            <div className="film-content">
                                <h3 className="film-title">
                                    {film.titre}
                                    <small>({[film.type, film.type2].filter(Boolean).join(', ')})</small>
                                </h3>
                                <p className="film-resume">{film.resume}</p>
                                <p className="film-priority"><strong>Priorité : {film.priorite}</strong></p>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}