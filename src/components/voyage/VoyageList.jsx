import React from 'react';

function formatPriceRange(p) {
    if (!p) return "—";
    if (p.unavailable) return "Indisponible";
    return `${p.min}–${p.max}€`;
}

export function VoyageList({ places, departure, selectedId, onSelect, onDelete }) {
    if (places.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                <p className="text-xl text-gray-400">Ta liste est vide 🌍</p>
                <p className="text-sm text-gray-500 mt-2">Clique sur la carte pour ajouter une destination !</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {places.map((p) => {
                const active = p.id === selectedId;
                const flight = p.flightPrices?.[departure];
                return (
                    <div key={p.id} className="relative group">
                        <button
                            onClick={() => onSelect(p.id)}
                            className={[
                                "w-full text-left rounded-xl border transition overflow-hidden",
                                active
                                    ? "border-[#7f00ff] bg-gray-800 shadow-[0_0_15px_rgba(127,0,255,0.2)]"
                                    : "border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750",
                            ].join(" ")}
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {p.name} <span className="text-gray-400 font-medium text-base">· {p.country}</span>
                                            </h3>
                                            <p className="mt-2 text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                                {p.shortDescription || "Aucune description"}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Vol AR</div>
                                            <div className="text-lg font-bold text-[#7f00ff]">
                                                {formatPriceRange(flight)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {p.whatToSee && p.whatToSee.length > 0 && (
                                            <span className="text-xs text-gray-500 mr-1 self-center">À voir :</span>
                                        )}
                                        {p.whatToSee?.slice(0, 3).map((x) => (
                                            <span
                                                key={x}
                                                className="text-xs text-gray-300 bg-gray-700/50 border border-gray-600 rounded px-2 py-1"
                                            >
                                                {x}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="hidden sm:block w-32 md:w-40 bg-gray-700">
                                    {p.imageUrl ? (
                                        <img
                                            src={p.imageUrl}
                                            alt={p.name}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-500 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(p.id);
                            }}
                            className="absolute top-2 right-2 p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-gray-700/80 transition-all"
                            title="Supprimer"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
