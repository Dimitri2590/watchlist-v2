import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import FilmCard from './FilmCard'

export default function FilmList({ refresh }) {
  const [films, setFilms] = useState([])
  const [editingFilm, setEditingFilm] = useState(null)
  const [updatedFilmData, setUpdatedFilmData] = useState({})

  useEffect(() => {
    const fetchFilms = async () => {
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .order('priorite', { ascending: true })

      if (error) {
        console.error('Erreurs de récupérations :', error.message)
      } else {
        setFilms(data)
      }
    }

    fetchFilms()
  }, [refresh])

  const handleValidate = async (id) => {
    try {
      // 1. Récupérer le film
      const { data: film, error: fetchError } = await supabase
        .from('films')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // 2. Préparer les données (on retire l'ID et la date de création pour laisser la nouvelle table les gérer)
      const { id: oldId, created_at, ...filmData } = film;

      // 3. Insérer dans 'filmsvu'
      const { error: insertError } = await supabase
        .from('filmsvu')
        .insert([filmData]);

      if (insertError) throw insertError;

      // 4. Supprimer de 'films'
      const { error: deleteError } = await supabase
        .from('films')
        .delete()
        .eq('id', id);

      if (deleteError) {
        alert("Le film a été copié dans 'Vus' mais impossible de le supprimer de cette liste : " + deleteError.message);
      } else {
        // 5. Mise à jour de l'interface
        setFilms(films.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur est survenue : " + error.message);
    }
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase
      .from('films')
      .update(updatedFilmData)
      .eq('id', id)

    if (error) {
      console.error('Erreur de mise à jour :', error.message)
    } else {
      setFilms(films.map(film => (film.id === id ? { ...film, ...updatedFilmData } : film)))
      setEditingFilm(null)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUpdatedFilmData({ ...updatedFilmData, [name]: value })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `films/${fileName}`;

    const { error } = await supabase.storage
      .from('films-poster')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Erreur upload image :', error.message);
    } else {
      const publicUrl = `https://qtdezvbginizovlzgtdn.supabase.co/storage/v1/object/public/films-poster/${filePath}`;
      setUpdatedFilmData(prev => ({ ...prev, image_url: publicUrl }));
    }
  };


  const allGenres = Array.from(new Set(films.flatMap(film => [film.type, film.type2]))).filter(Boolean)

  const [searchTitle, setSearchTitle] = useState("")
  const [searchType, setSearchType] = useState("")
  const [searchPriority, setSearchPriority] = useState("")

  const filteredFilms = films.filter((film) => {
    const matchTitle = film.titre.toLowerCase().includes(searchTitle.toLowerCase())
    const matchType = searchType ? film.type === searchType || film.type2 === searchType : true
    const matchPriority = film.priorite.toString().includes(searchPriority)
    return matchTitle && matchType && matchPriority
  })

  return (
    <div className="mt-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
          🎬 Films à voir <span className="text-sm font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded-full">{filteredFilms.length}</span>
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
          <p className="text-xl text-gray-400">Aucun film trouvé 🕵️‍♂️</p>
          <p className="text-sm text-gray-500 mt-2">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFilms.map((film) => (
            <FilmCard
              key={film.id}
              film={film}
              onValidate={handleValidate}
              onEdit={(f) => {
                setEditingFilm(f);
                setUpdatedFilmData(f);
              }}
            />
          ))}
        </ul>
      )}

      {editingFilm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h5 className="text-lg font-bold text-gray-900 dark:text-white">Modifier le film</h5>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                onClick={() => setEditingFilm(null)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(editingFilm.id) }} className="p-6 space-y-4">
              <div>
                <label htmlFor="titre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7f00ff]" id="titre" name="titre" value={updatedFilmData.titre} onChange={handleInputChange} />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7f00ff]" id="type" name="type" value={updatedFilmData.type} onChange={handleInputChange} />
              </div>

              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Résumé</label>
                <textarea rows="3" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7f00ff] resize-none" id="resume" name="resume" value={updatedFilmData.resume} onChange={handleInputChange}></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorité</label>
                <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7f00ff]" name="priorite" value={updatedFilmData.priorite} onChange={handleInputChange}>
                  <option value="1">J'ai très envie de voir ce film</option>
                  <option value="2">Le film a l'air intéressant</option>
                  <option value="3">Pourquoi pas</option>
                </select>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouvelle image</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#7f00ff]/10 file:text-[#7f00ff] hover:file:bg-[#7f00ff]/20 dark:file:bg-gray-700 dark:file:text-gray-300"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => setEditingFilm(null)}>Annuler</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#7f00ff] hover:bg-[#6a00d6] text-white font-medium transition-colors">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
