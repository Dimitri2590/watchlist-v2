import { useState } from 'react';

const FilmCard = ({ film, onValidate, onEdit, isSeen = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongText = film.resume && film.resume.length > 150;

    return (
        <li className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-200 dark:border-gray-700">
            <div className="relative h-[400px] bg-black group">
                {film.image_url ? (
                    <img
                        src={film.image_url}
                        alt={film.titre}
                        className="w-full h-full object-contain transition-transform duration-500"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x600?text=No+Image'
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">🎬</span>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm ${Number(film.priorite) === 1 ? 'bg-red-500' :
                        Number(film.priorite) === 2 ? 'bg-orange-500' : 'bg-[#7f00ff]'
                        }`}>
                        {Number(film.priorite) === 1 ? 'Très envie de voir le film' : Number(film.priorite) === 2 ? 'Le film a l\'air intéressant' : 'Pourquoi pas'}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                        {film.titre}
                    </h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    {[film.type, film.type2].filter(Boolean).map((genre, idx) => (
                        <span key={idx} className="text-xs font-medium px-2 py-1 rounded-full bg-[#7f00ff]/10 dark:bg-[#7f00ff]/20 text-[#7f00ff] dark:text-[#7f00ff]/80">
                            {genre}
                        </span>
                    ))}
                </div>

                <div className="mb-4 flex-grow">
                    <p className={`text-gray-600 dark:text-gray-300 text-sm ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {film.resume}
                    </p>
                    {isLongText && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-[#7f00ff] dark:text-[#7f00ff] text-xs font-medium mt-1 hover:underline focus:outline-none"
                        >
                            {isExpanded ? "Voir moins" : "Plus..."}
                        </button>
                    )}
                </div>

                {!isSeen && (
                    <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => onValidate(film.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                            Vu
                        </button>
                        <button
                            onClick={() => {
                                onEdit(film);
                            }}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                        >
                            Modifier
                        </button>
                    </div>
                )}
            </div>
        </li>
    );
};

export default FilmCard;
