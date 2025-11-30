import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './FilmList.css'

export default function Filmvu({ refresh }) {
    const [films, setFilms] = useState([])

    useEffect(() => {
        const fetchFilms = async () => {
            const { data, error } = await supabase
                .from('films')
                .update({ vu: true })
                .eq('id', id)

            if (error) {
                console.error('Erreurs de validation :', error.message)
            } else {
                setFilms(films.filter(film => film.id !== id));
            }
        }

        fetchFilms()
    }, [refresh])



    const [searchTitle, setSearchTitle] = useState("")
    const [searchType, setSearchType] = useState("")
    const [searchPriority, setSearchPriority] = useState("")

    const filteredFilms = films.filter((film) => {
        const matchTitle = film.titre.toLowerCase().includes(searchTitle.toLowerCase())
        const matchType = searchType ? film.type === searchType || film.type2 === searchType : true
        const matchPriority = film.priorite.toString().includes(searchPriority)
        return matchTitle && matchType && matchPriority
    })

    const allGenres = Array.from(new Set(films.flatMap(film => [film.type, film.type2]))).filter(Boolean)


    return (
        <div className="film-list-container">
            <h2>🎬 Films vu</h2>
            <ul className="film-list">
                <input
                    type="text"
                    placeholder="Rechercher par nom"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                />
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                >
                    <option value="">Rechercher par genre</option>
                    {allGenres.map((genre) => (
                        <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>
                <select
                    value={searchPriority}
                    onChange={(e) => setSearchPriority(e.target.value)}
                >
                    <option value="">Toutes les priorités</option>
                    <option value="1">1 : J'ai très envie de voir ce film</option>
                    <option value="2">2 : le film a l'air intéressant</option>
                    <option value="3">3 : Pourquoi pas</option>
                </select>

                {filteredFilms.map((film) => (
                    <li key={film.id} className="film-list-item">
                        <div className="film-item-flex">
                            {film.image_url && (
                                <img
                                    src={film.image_url}
                                    alt={film.titre}
                                    className="film-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/150?text=Image+absente'
                                    }}
                                />
                            )}

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
    )}