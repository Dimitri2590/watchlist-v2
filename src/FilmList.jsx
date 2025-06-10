import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './FilmList.css'

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
        console.error('Erreur de récupération :', error.message)
      } else {
        setFilms(data)
      }
    }

    fetchFilms()
  }, [refresh])

  const handleDelete = async (id) => {
    const { error } = await supabase.from('films').delete().eq('id', id)
    if (error) {
      console.error('Erreur de suppression :', error.message)
    } else {
      setFilms(films.filter(film => film.id !== id))
    }
  }

  const handleUpdate = async (id) => {
    const { error } = await supabase
      .from('films')
      .update(updatedFilmData)
      .eq('id', id)

    if (error) {
      console.error('Erreur de mise à jour :', error.message)
    } else {
      setFilms(films.map(film => (film.id === id ? { ...film, ...updatedFilmData } : film)))
      setEditingFilm(null) // Fermer le formulaire de modification
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUpdatedFilmData({ ...updatedFilmData, [name]: value })
  }

  return (
      <div className="film-list-container">
        <h2>🎬 Films à voir</h2>
        <ul className="film-list">
          {films.map((film) => (
              <li key={film.id} className="film-list-item">
                <h3 className="film-title">
                  {film.titre} <small>({film.type})</small>
                </h3>
                <p className="film-resume">{film.resume}</p>
                <p className="film-priority"><strong>Priorité : {film.priorite}</strong></p>
                <button className="film-btn" onClick={() => handleDelete(film.id)}>Supprimer</button>
                <button className="film-btn" onClick={() => { setEditingFilm(film); setUpdatedFilmData(film); }}>Modifier</button>
              </li>
          ))}
        </ul>
        {editingFilm && (
            <div className="film-modal-overlay">
              <div className="film-modal">
                <div className="film-modal-header">
                  <h5>Modifier le film</h5>
                  <button type="button" className="film-modal-close" onClick={() => setEditingFilm(null)}>&times;</button>
                </div>
                <form>
                  <div className="film-modal-form-group">
                    <label htmlFor="titre" className="film-modal-label">Titre</label>
                    <input type="text" className="film-modal-input" id="titre" name="titre" value={updatedFilmData.titre} onChange={handleInputChange} />
                  </div>
                  <div className="film-modal-form-group">
                    <label htmlFor="type" className="film-modal-label">Type</label>
                    <input type="text" className="film-modal-input" id="type" name="type" value={updatedFilmData.type} onChange={handleInputChange} />
                  </div>
                  <div className="film-modal-form-group">
                    <label htmlFor="resume" className="film-modal-label">Résumé</label>
                    <textarea className="film-modal-textarea" id="resume" name="resume" value={updatedFilmData.resume} onChange={handleInputChange}></textarea>
                  </div>
                  <div className="film-modal-form-group">
                    <label className="film-modal-label">Priorité</label>
                    <select className="film-modal-select" name="priorite" value={updatedFilmData.priorite} onChange={handleInputChange}>
                      <option value="1">1 : J'ai très envie de voir ce film</option>
                      <option value="2">2 : le film a l'air intéressant</option>
                      <option value="3">3 : Pourquoi pas</option>
                    </select>
                  </div>
                </form>
                <div className="film-modal-actions">
                  <button type="button" className="film-modal-action-btn" onClick={() => setEditingFilm(null)}>Annuler</button>
                  <button type="button" className="film-modal-action-btn" onClick={() => handleUpdate(editingFilm.id)}>Enregistrer</button>
                </div>
              </div>
            </div>
        )}
      </div>
  )
}
