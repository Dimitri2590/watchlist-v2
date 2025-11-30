import { useFormik } from 'formik';
import * as Yup from 'yup';
import { supabase } from './supabaseClient';
import { useState } from "react";

const validationSchema = Yup.object().shape({
  titre: Yup.string().required('Le titre est requis'),
  typeInput: Yup.string().required('Le type est requis'),
  resume: Yup.string().required('Le résumé est requis'),
  priorite: Yup.number().required('La priorité est requise'),
});

export default function AddFilmForm({ onAdd }) {
  const [imageFile, setImageFile] = useState(null);
  const formik = useFormik({
    initialValues: {
      titre: '',
      typeInput: '',
      resume: '',
      priorite: 1,
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const genres = values.typeInput.split(',').map(g => g.trim());
      const genre1 = genres[0] || null;
      const genre2 = genres[1] || null;

      let imageUrl = null;

      if (imageFile) {
        const { data, error } = await supabase
          .storage
          .from('films-poster')
          .upload(`films/${Date.now()}_${imageFile.name}`, imageFile);

        if (error) {
          alert("Erreur d'upload de l'image : " + error.message);
          return;
        }

        const { data: publicUrlData } = supabase
          .storage
          .from('film-images')
          .getPublicUrl(data.path);

        imageUrl = publicUrlData.publicUrl;
      }

      const filmData = {
        titre: values.titre,
        type: genre1,
        type2: genre2,
        resume: values.resume,
        priorite: values.priorite,
        image_url: imageUrl,
      };

      const { error } = await supabase.from('films').insert([filmData]);

      if (error) {
        alert('Erreur : ' + error.message);
      } else {
        onAdd();
        resetForm();
      }
    },
  });

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ajouter un film</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-2">
              <label htmlFor="titre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
              <input
                id="titre"
                name="titre"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.titre}
                placeholder="Ex: Inception"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7f00ff] focus:border-transparent transition-colors"
              />
              {formik.touched.titre && formik.errors.titre ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.titre}</div>
              ) : null}
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="typeInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genres</label>
              <input
                id="typeInput"
                name="typeInput"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.typeInput}
                placeholder="Sci-Fi, Thriller..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7f00ff] focus:border-transparent transition-colors"
              />
              {formik.touched.typeInput && formik.errors.typeInput ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.typeInput}</div>
              ) : null}
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="priorite" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorité</label>
              <select
                id="priorite"
                name="priorite"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.priorite}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7f00ff] focus:border-transparent transition-colors"
              >
                <option value={1}>🔥 J'ai très envie de voir ce film</option>
                <option value={2}>👍 Le film a l'air intéressant</option>
                <option value={3}>🤔 Pourquoi pas</option>
              </select>
            </div>

            <div className="col-span-2">
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Résumé</label>
              <textarea
                id="resume"
                name="resume"
                rows="3"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.resume}
                placeholder="De quoi ça parle ?"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#7f00ff] focus:border-transparent transition-colors resize-none"
              />
              {formik.touched.resume && formik.errors.resume ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.resume}</div>
              ) : null}
            </div>

            <div className="col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Affiche du film</label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#7f00ff]/10 file:text-[#7f00ff]
                      hover:file:bg-[#7f00ff]/20
                      dark:file:bg-gray-700 dark:file:text-gray-300
                    "
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#7f00ff] hover:bg-[#6a00d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7f00ff] transition-all transform hover:scale-[1.02]"
          >
            Ajouter à ma liste
          </button>
        </form>
      </div>
    </div>
  );
}
