import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import FilmCard from './FilmCard'

export default function FilmValide() {
    const [filmsvu, setFilmsvu] = useState([])
    const [searchTitle, setSearchTitle] = useState("")
    const [searchType, setSearchType] = useState("")
    const [searchPriority, setSearchPriority] = useState("")

    useEffect(() => {
        const fetchFilms = async () => {
            const { data, error } = await supabase
                .from('filmsvu')
                .select('*')
                .order('priorite', { ascending: true })

            if (error) {
                console.error('Erreur de récupération :', error.message)
            } else {
                setFilmsvu(data)
            }
        }
        fetchFilms()
    }, [])

    const allGenres = Array.from(new Set(filmsvu.flatMap(film => [film.type, film.type2]))).filter(Boolean)

    const filteredFilms = filmsvu.filter((film) => {
        const matchTitle = film.titre.toLowerCase().includes(searchTitle.toLowerCase())
        const matchType = searchType ? film.type === searchType || film.type2 === searchType : true
        const matchPriority = film.priorite.toString().includes(searchPriority)
        return matchTitle && matchType && matchPriority
    })

    return (
        <div className="mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    ✅ Films vus <span className="text-sm font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded-full">{filteredFilms.length}</span>
                </h2>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-[#7f00ff] focus:border-transparent"
                    />
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-[#7f00ff]"
                    >
                        <option value="">Tous les genres</option>
                        {allGenres.map((genre) => (
                            <option key={genre} value={genre}>{genre}</option>
                        ))}
                    </select>
                    <select
                        value={searchPriority}
                        onChange={(e) => setSearchPriority(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-[#7f00ff]"
                    >
                        <option value="">Toutes priorités</option>
                        <option value="1">J'ai très envie de voir ce film</option>
                        <option value="2">Le film a l'air intéressant</option>
                        <option value="3">Pourquoi pas</option>
                    </select>
                </div>
            </div>

            {filteredFilms.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                    <p className="text-xl text-gray-400">Aucun film vu trouvé 🕵️‍♂️</p>
                    <p className="text-sm text-gray-500 mt-2">Essayez de modifier vos filtres</p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFilms.map((film) => (
                        <FilmCard
                            key={film.id}
                            film={film}
                            isSeen={true}
                            onValidate={() => { }}
                            onEdit={() => { }}
                        />
                    ))}
                </ul>
            )}
        </div>
    )
}