import { useFormik } from 'formik';
import * as Yup from 'yup';
import { supabase } from './supabaseClient';
import './index.css';

const validationSchema = Yup.object().shape({
  titre: Yup.string().required('Le titre est requis'),
  typeInput: Yup.string().required('Le type est requis'),
  resume: Yup.string().required('Le résumé est requis'),
  priorite: Yup.number().required('La priorité est requise'),
});

export default function AddFilmForm({ onAdd }) {
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

      const filmData = {
        titre: values.titre,
        type: genre1,
        type2: genre2,
        resume: values.resume,
        priorite: values.priorite,
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={formik.handleSubmit} className="max-w-md w-full p-6 bg-white rounded-lg shadow-md space-y-4">
          <div className="mb-5">
            <label htmlFor="titre" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Titre</label>
            <input
                id="titre"
                name="titre"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.titre}
                placeholder="Titre"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            {formik.touched.titre && formik.errors.titre ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.titre}</div>
            ) : null}
          </div>
          <div className="mb-5">
            <label htmlFor="typeInput" className="block text-sm font-medium text-gray-700">Genres</label>
            <input
                id="typeInput"
                name="typeInput"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.typeInput}
                placeholder="Genre(s) (séparés par des virgules)"
                className="w-full mt-1 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formik.touched.typeInput && formik.errors.typeInput ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.typeInput}</div>
            ) : null}
          </div>
          <div className="mb-5">
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700">Résumé</label>
            <textarea
                id="resume"
                name="resume"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.resume}
                placeholder="Résumé"
                className="w-full mt-1 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formik.touched.resume && formik.errors.resume ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.resume}</div>
            ) : null}
          </div>
          <div className="mb-5">
            <label htmlFor="priorite" className="block text-sm font-medium text-gray-700">Priorité</label>
            <select
                id="priorite"
                name="priorite"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.priorite}
                className="w-full mt-1 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 : J'ai très envie de voir ce film</option>
              <option value={2}>2 : Le film a l'air intéressant</option>
              <option value={3}>3 : Pourquoi pas</option>
            </select>
            {formik.touched.priorite && formik.errors.priorite ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.priorite}</div>
            ) : null}
          </div>
          <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Ajouter
          </button>
        </form>
      </div>
  );
}
