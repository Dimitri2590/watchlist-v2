import React from 'react';

function formatPriceRange(p) {
    if (!p) return "—";
    if (p.unavailable) return "Indisponible";
    return `${p.min}–${p.max}€`;
}

export function PlaceDetails({ place, departure, onDelete }) {
    if (!place) {
        return (
            <div className="rounded-xl border border-dashed border-gray-700 bg-gray-800/50 p-6 text-center">
                <h3 className="text-base font-semibold text-white">Détails</h3>
                <p className="mt-2 text-sm text-gray-400">
                    Sélectionne une destination pour voir plus d'infos.
                </p>
            </div>
        );
    }

    // Cas marqueur temporaire
    if (place.id === "temp") {
        return (
            <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-[#7f00ff]">Nouvelle destination ?</h3>
                <p className="mt-3 text-2xl font-bold text-white leading-none">{place.name}</p>
                <p className="text-base text-gray-400 mt-1">{place.country}</p>
                <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-700/50">
                    <p className="text-sm text-gray-300">
                        Clique sur <span className="font-semibold text-white">"Ajouter aux favoris"</span> dans la bulle sur la carte pour confirmer l'ajout.
                    </p>
                </div>
            </div>
        );
    }

    const flight = place.flightPrices?.[departure];

    return (
        <div className="rounded-xl border border-gray-700 bg-gray-800 overflow-hidden shadow-lg sticky top-6">
            <div className="relative bg-gray-900 h-56">
                {place.imageUrl ? (
                    <img
                        src={place.imageUrl}
                        alt={place.name}
                        className="h-full w-full object-cover transition-transform hover:scale-105 duration-700"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        Chargement image...
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">
                        {place.name} <span className="text-gray-300 font-normal text-lg">· {place.country}</span>
                    </h2>
                    <p className="text-sm text-gray-200 mt-1 line-clamp-2 drop-shadow-sm leading-relaxed">
                        {place.shortDescription}
                    </p>
                </div>
            </div>

            <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-700/50 border border-gray-700 p-3">
                        <div className="text-xs text-gray-400 mb-1">Vol AR ({departure} → {flight?.arrivalAirport || place.cityCode})</div>
                        <div className="text-lg font-bold text-[#b466ff]">{formatPriceRange(flight)}</div>
                    </div>
                    <div className="rounded-lg bg-gray-700/50 border border-gray-700 p-3">
                        <div className="text-xs text-gray-400 mb-1">Durée estimée</div>
                        <div className="text-lg font-bold text-white">{flight?.duration ?? "—"}</div>
                    </div>
                </div>

                <div>
                    {place.whatToSee && place.whatToSee.length > 0 && (
                        <>
                            <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">À visiter</div>
                            <ul className="grid grid-cols-1 gap-2">
                                {place.whatToSee.map((x) => (
                                    <li key={x} className="flex items-center px-3 py-2 rounded-md bg-gray-700/30 text-sm text-gray-300 border border-gray-700/50">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#7f00ff] mr-2.5"></span>
                                        {x}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                <div>
                    {place.bestMonths && place.bestMonths.length > 0 && (
                        <>
                            <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">Meilleurs moments</div>
                            <div className="flex flex-wrap gap-2">
                                {place.bestMonths.map((m) => (
                                    <span
                                        key={m}
                                        className="rounded-full bg-gray-700 text-gray-300 px-3 py-1 text-xs font-medium border border-gray-600"
                                    >
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        onClick={() => onDelete(place.id)}
                        className="w-full rounded-lg border border-red-900/30 bg-red-900/10 text-red-400 px-4 py-3 text-sm font-medium hover:bg-red-900/20 hover:text-red-300 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        Supprimer cette destination
                    </button>
                </div>

                {flight && (
                    <p className="text-[10px] text-gray-500 text-center">
                        *Atterrissage à {flight.arrivalAirport}. Prix est. via Amadeus.
                    </p>
                )}
            </div>
        </div>
    );
}
