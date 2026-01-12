import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from "react-leaflet";
import L from "leaflet";
import { getFlightEstimates, getDestinationImage, getPointsOfInterest, getCityFromCoordinates } from "../services/travelService";
import { fetchVoyages, addVoyage, deleteVoyage } from "../services/voyageDbService";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function formatPriceRange(p) {
  if (!p) return "—";
  return `${p.min}–${p.max}€`;
}

function MapEffects({ places, selectedPlace }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedPlace) return;
    map.flyTo([selectedPlace.lat, selectedPlace.lng], Math.max(map.getZoom(), 8), {
      duration: 0.8,
    });
  }, [map, selectedPlace]);

  return null;
}

// Composant pour capter les clics sur la carte
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-zinc-100 p-1">
      {["map", "list"].map((k) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={[
            "px-3 py-1.5 text-sm font-medium rounded-lg transition",
            value === k ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900",
          ].join(" ")}
        >
          {k === "map" ? "Carte" : "Liste"}
        </button>
      ))}
    </div>
  );
}

function DepartureSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-600">Départ :</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
      >
        <option value="PAR">Paris</option>
        <option value="LYS">Lyon</option>
      </select>
    </div>
  );
}

function PlacesList({ places, departure, selectedId, onSelect, onDelete }) {
  if (places.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-500 text-sm">
        <p>Ta liste est vide.</p>
        <p>Clique sur la carte pour ajouter une destination !</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {places.map((p) => {
        const active = p.id === selectedId;
        const flight = p.flightPrices?.[departure];
        return (
          <div key={p.id} className="relative group">
            <button
              onClick={() => onSelect(p.id)}
              className={[
                "w-full text-left rounded-2xl border transition overflow-hidden",
                active ? "border-zinc-900 bg-white shadow-sm" : "border-zinc-200 bg-white hover:shadow-sm",
              ].join(" ")}
            >
              <div className="flex gap-4">
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900">
                        {p.name} <span className="text-zinc-500 font-medium">· {p.country}</span>
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{p.shortDescription || "Aucune description"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-zinc-500">Vol AR</div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {formatPriceRange(flight)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.whatToSee && p.whatToSee.length > 0 && <span className="text-xs text-zinc-500 mr-1">À voir :</span>}
                    {p.whatToSee?.slice(0, 3).map((x) => (
                      <span key={x} className="text-xs text-zinc-700 bg-zinc-100 rounded px-1.5 py-0.5">{x}</span>
                    ))}
                  </div>
                </div>

                <div className="w-24 sm:w-32 bg-zinc-100">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
              className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-white transition"
              title="Supprimer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function PlaceDetailsPanel({ place, departure, onDelete }) {
  if (!place) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h3 className="text-base font-semibold text-zinc-900">Détails</h3>
        <p className="mt-2 text-sm text-zinc-600">
          Clique sur la carte pour ajouter une destination ou sélectionne un favoris existant.
        </p>
      </div>
    );
  }

  // Cas marqueur temporaire
  if (place.id === "temp") {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h3 className="text-base font-semibold text-zinc-900">Nouvelle destination ?</h3>
        <p className="mt-2 text-lg font-bold text-zinc-800">{place.name}</p>
        <p className="text-sm text-zinc-500">{place.country}</p>
        <p className="mt-4 text-sm text-zinc-600">Clique sur "Ajouter aux favoris" dans la bulle sur la carte pour confirmer.</p>
      </div>
    );
  }

  const flight = place.flightPrices?.[departure];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
      <div className="relative bg-zinc-100 h-44">
        {place.imageUrl ? (
          <img src={place.imageUrl} alt={place.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400 text-sm">Chargement image...</div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h2 className="text-lg font-semibold text-white">
            {place.name} <span className="text-white/80 font-medium">· {place.country}</span>
          </h2>
          <p className="text-sm text-white/90 line-clamp-2">{place.shortDescription}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-50 p-3">
            <div className="text-xs text-zinc-500">Vol AR ({departure} → {flight?.arrivalAirport || place.cityCode})</div>
            <div className="text-sm font-semibold text-zinc-900">{formatPriceRange(flight)}</div>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3">
            <div className="text-xs text-zinc-500">Durée</div>
            <div className="text-sm font-semibold text-zinc-900">{flight?.duration ?? "—"}</div>
          </div>
        </div>

        <div>
          {place.whatToSee && place.whatToSee.length > 0 && (
            <>
              <div className="text-sm font-semibold text-zinc-900">À visiter</div>
              <ul className="mt-2 text-sm text-zinc-700 list-disc pl-5 space-y-1">
                {place.whatToSee.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          {place.bestMonths && place.bestMonths.length > 0 && (
            <>
              <div className="text-sm font-semibold text-zinc-900">Meilleurs moments</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {place.bestMonths.map((m) => (
                  <span key={m} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                    {m}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onDelete(place.id)}
            className="flex-1 rounded-xl border border-red-200 bg-red-50 text-red-600 px-4 py-2.5 text-sm font-medium hover:bg-red-100"
          >
            Supprimer
          </button>
        </div>

        {flight && (
          <p className="text-xs text-zinc-400 mt-2">
            *Atterrissage prévu à {flight.arrivalAirport}. Prix est. via Amadeus.
          </p>
        )}
      </div>
    </div>
  );
}

export default function VoyagePage() {
  const [viewMode, setViewMode] = useState("map");
  const [departure, setDeparture] = useState("PAR");
  const [places, setPlaces] = useState([]); // Initialement vide
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // État temporaire pour l'ajout
  const [tempMarker, setTempMarker] = useState(null);

  const selectedPlace = useMemo(
    () => {
      if (tempMarker && selectedId === "temp") return tempMarker;
      return places.find((p) => p.id === selectedId) ?? null;
    },
    [places, selectedId, tempMarker]
  );

  // 1. Initialisation : Charger les voyages depuis Supabase
  useEffect(() => {
    const loadVoyages = async () => {
      setLoading(true);
      const data = await fetchVoyages();
      setPlaces(data);
      setLoading(false);
    };
    loadVoyages();
  }, []);

  // 2. Enrichissement API (Flight, Images)
  useEffect(() => {
    if (loading) return;

    const fetchData = async () => {
      const updatedPlaces = await Promise.all(
        places.map(async (place) => {
          if (place.flightPrices && place.flightPrices[departure] && place.isDynamicImage) {
            return place;
          }

          let newImageUrl = place.imageUrl;
          if (!newImageUrl || !place.isDynamicImage) {
            const fetchedUrl = await getDestinationImage(`${place.name} landmark`);
            if (fetchedUrl) newImageUrl = fetchedUrl + "&fit=crop&w=1200&q=80";
          }

          let newPois = place.whatToSee;
          if (!place.hasDynamicPois) {
            const pois = await getPointsOfInterest(place.lat, place.lng);
            if (pois.length > 0) newPois = pois.slice(0, 5);
          }

          let flightPrices = place.flightPrices || {};
          if (!flightPrices[departure]) {
            // On passe le nom de la ville si on n'a pas de code fiable, le service se chargera de trouver le code IATA
            const flightData = await getFlightEstimates(departure, place.cityCode || place.name);
            flightPrices = { ...flightPrices, [departure]: flightData };
          }

          return {
            ...place,
            imageUrl: newImageUrl,
            isDynamicImage: true,
            whatToSee: newPois,
            hasDynamicPois: true,
            flightPrices
          };
        })
      );

      const hasChanged = JSON.stringify(updatedPlaces) !== JSON.stringify(places);
      if (hasChanged) {
        setPlaces(updatedPlaces);
      }
    };

    if (places.length > 0) {
      fetchData();
    }
  }, [places.length, departure, loading]);

  const handleMapClick = async (latlng) => {
    const cityData = await getCityFromCoordinates(latlng.lat, latlng.lng);
    if (cityData && cityData.name) {
      const newTemp = {
        id: "temp",
        name: cityData.name,
        country: cityData.country,
        lat: latlng.lat,
        lng: latlng.lng,
        shortDescription: "Nouvelle destination trouvée...",
        whatToSee: [],
        bestMonths: [],
        imageUrl: "",
        cityCode: cityData.name.substring(0, 3).toUpperCase(),
      };
      setTempMarker(newTemp);
      setSelectedId("temp");
    }
  };

  const confirmAddPlace = async () => {
    if (!tempMarker) return;

    // Sauvegarde en DB
    const savedPlace = await addVoyage(tempMarker);
    if (savedPlace) {
      setPlaces((prev) => [...prev, savedPlace]);
      setTempMarker(null);
      setSelectedId(savedPlace.id);
    } else {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette destination ?")) {
      const success = await deleteVoyage(id);
      if (success) {
        setPlaces(prev => prev.filter(p => p.id !== id));
        if (selectedId === id) setSelectedId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">Voyages</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Clique sur la carte pour ajouter des voyages à ta liste.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DepartureSelect value={departure} onChange={setDeparture} />
            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {viewMode === "map" ? (
              <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-white">
                <div className="h-[65vh] min-h-[420px]">
                  <MapContainer center={[46, 2]} zoom={4} className="h-full w-full" style={{ cursor: 'pointer' }}>
                    <TileLayer
                      attribution='&copy; OSM'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapEffects places={places} selectedPlace={selectedPlace} />
                    <MapClickHandler onMapClick={handleMapClick} />

                    {places.map((p) => (
                      <Marker
                        key={p.id}
                        position={[p.lat, p.lng]}
                        eventHandlers={{
                          click: () => setSelectedId(p.id),
                        }}
                      />
                    ))}

                    {tempMarker && (
                      <Marker position={[tempMarker.lat, tempMarker.lng]} opacity={0.7}>
                        <Popup offset={[0, -20]} minWidth={200} closeButton={false}>
                          <div className="text-center">
                            <h3 className="font-bold text-base">{tempMarker.name}</h3>
                            <p className="text-xs text-zinc-500 mb-2">{tempMarker.country}</p>
                            <button
                              onClick={confirmAddPlace}
                              className="w-full bg-zinc-900 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-zinc-700 transition"
                            >
                              Ajouter aux favoris
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                <div className="border-t border-zinc-200 p-3 text-sm text-zinc-600">
                  Clique n'importe où sur la carte pour identifier un lieu et l'ajouter.
                </div>
              </div>
            ) : (
              <>
                {loading ? (
                  <div className="text-center py-10">Chargement...</div>
                ) : (
                  <PlacesList
                    places={places}
                    departure={departure}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onDelete={handleDelete}
                  />
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6">
              <PlaceDetailsPanel place={selectedPlace} departure={departure} onDelete={handleDelete} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
