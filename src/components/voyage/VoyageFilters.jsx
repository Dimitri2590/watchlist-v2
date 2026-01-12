import React from 'react';

export function VoyageFilters({ viewMode, setViewMode, departure, setDeparture }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Departure Select */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Départ :</span>
                <select
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className="rounded-lg bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#7f00ff]"
                >
                    <option value="PAR">Paris</option>
                    <option value="LYS">Lyon</option>
                </select>
            </div>

            {/* View Toggle */}
            <div className="inline-flex rounded-lg bg-gray-800 p-1 border border-gray-700 h-fit">
                {["map", "list"].map((k) => (
                    <button
                        key={k}
                        onClick={() => setViewMode(k)}
                        className={[
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            viewMode === k
                                ? "bg-[#7f00ff] text-white shadow-sm"
                                : "text-gray-400 hover:text-white hover:bg-gray-700",
                        ].join(" ")}
                    >
                        {k === "map" ? "Carte" : "Liste"}
                    </button>
                ))}
            </div>
        </div>
    );
}
