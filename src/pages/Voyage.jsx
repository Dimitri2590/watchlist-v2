import { useEffect, useMemo, useRef, useState } from "react";
import { getFlightEstimates, getDestinationImage, getPointsOfInterest, getCityFromCoordinates } from "../services/travelService";
import { fetchVoyages, addVoyage, deleteVoyage } from "../services/voyageDbService";

// New specialized components
import { VoyageFilters } from "../components/voyage/VoyageFilters";
import { VoyageList } from "../components/voyage/VoyageList";
import { PlaceDetails } from "../components/voyage/PlaceDetails";
import { VoyageMap } from "../components/voyage/VoyageMap";

export default function VoyagePage() {
  const [viewMode, setViewMode] = useState("map");
  const [departure, setDeparture] = useState("PAR");
  const [places, setPlaces] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // État temporaire pour l'ajout
  const [tempMarker, setTempMarker] = useState(null);

  const selectedPlace = useMemo(() => {
    if (tempMarker && selectedId === "temp") return tempMarker;
    return places.find((p) => p.id === selectedId) ?? null;
  }, [places, selectedId, tempMarker]);

  // caches pour éviter de retaper les APIs en boucle (mémoire uniquement)
  const imageCacheRef = useRef(new Map()); // key: placeId -> url
  const poisCacheRef = useRef(new Map());  // key: lat,lng -> [pois]
  const flightCacheRef = useRef(new Map()); // key: departure->destinationKey -> flightData
  const flightAttemptsRef = useRef(new Map()); // key: departure->destinationKey -> attempts
  const inFlightRef = useRef(new Set()); // anti double-call (placeId + departure)

  // 1) Initialisation : Charger les voyages depuis Supabase
  useEffect(() => {
    const loadVoyages = async () => {
      setLoading(true);
      const data = await fetchVoyages();
      setPlaces(data);
      setLoading(false);

      // auto-select le premier si rien n'est sélectionné
      if (data?.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    };
    loadVoyages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Enrichissement API : uniquement la destination sélectionnée (anti 429)
  useEffect(() => {
    if (loading) return;
    if (!selectedPlace) return;
    if (selectedPlace.id === "temp") return; // jamais d'enrichissement pour le marqueur temporaire

    const placeId = selectedPlace.id;
    const lockKey = `${placeId}::${departure}`;
    if (inFlightRef.current.has(lockKey)) return;

    let cancelled = false;
    inFlightRef.current.add(lockKey);

    const enrichSelected = async () => {
      try {
        const p = selectedPlace;

        // 1) Image (Unsplash) — cache par placeId
        let newImageUrl = p.imageUrl;
        if (!newImageUrl || !p.isDynamicImage) {
          const cached = imageCacheRef.current.get(placeId);
          if (cached) {
            newImageUrl = cached;
          } else {
            // Note: Optimisation possible -> stocker en DB pour ne pas rappeler
            const fetchedUrl = await getDestinationImage(`${p.name} landmark`);
            if (fetchedUrl) {
              newImageUrl = fetchedUrl + "&fit=crop&w=1200&q=80";
              imageCacheRef.current.set(placeId, newImageUrl);
            }
          }
        }

        // 2) POIs (Amadeus) — cache par lat,lng arrondi
        let newPois = p.whatToSee;
        const poiKey = `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;
        if (!p.hasDynamicPois) {
          const cachedPois = poisCacheRef.current.get(poiKey);
          if (cachedPois) {
            newPois = cachedPois;
          } else {
            const pois = await getPointsOfInterest(p.lat, p.lng);
            const sliced = (pois || []).slice(0, 5);
            poisCacheRef.current.set(poiKey, sliced);
            newPois = sliced;
          }
        }

        // 3) Vols (Amadeus) — cache par departure + destinationKey
        let flightPrices = p.flightPrices || {};
        const destinationKey = (p.cityCode || p.name || "").toString().trim();
        const flightKey = `${departure}->${destinationKey}`;
        let shouldUpdateFlights = false;

        if (!flightPrices?.[departure]) {
          const cachedFlight = flightCacheRef.current.get(flightKey);
          if (cachedFlight) {
            flightPrices = { ...flightPrices, [departure]: cachedFlight };
            shouldUpdateFlights = true;
          } else {
            const attempts = flightAttemptsRef.current.get(flightKey) || 0;
            // Retry logic: try at most 2 times
            if (attempts < 2) {
              const flightData = await getFlightEstimates(departure, destinationKey);
              if (flightData) {
                flightCacheRef.current.set(flightKey, flightData);
                flightPrices = { ...flightPrices, [departure]: flightData };
                shouldUpdateFlights = true;
              } else {
                // Failed -> count it
                const newCount = attempts + 1;
                flightAttemptsRef.current.set(flightKey, newCount);

                if (newCount >= 2) {
                  // Mark unavailable
                  const unavailableData = { unavailable: true };
                  flightCacheRef.current.set(flightKey, unavailableData);
                  flightPrices = { ...flightPrices, [departure]: unavailableData };
                  shouldUpdateFlights = true;
                }
              }
            } else {
              // Already failed 2+ times
              const unavailableData = { unavailable: true };
              flightCacheRef.current.set(flightKey, unavailableData);
              flightPrices = { ...flightPrices, [departure]: unavailableData };
              shouldUpdateFlights = true;
            }
          }
        }

        if (cancelled) return;

        // Verify if we actually have changes
        const imageChanged = newImageUrl !== p.imageUrl;
        const poisChanged = newPois !== p.whatToSee; // Reference comparison should work if we reused p.whatToSee
        // Note: For pois, if we fetched and it's same content but new array, it might loop? 
        // But the logic above says: if (!p.hasDynamicPois) { fetch } else { newPois = p.whatToSee }
        // So if p.hasDynamicPois is true, newPois === p.whatToSee (exact ref).
        // If not, we fetched, so we definitely want to update.

        if (!imageChanged && !poisChanged && !shouldUpdateFlights) {
          return;
        }

        // Met à jour uniquement cette place dans le state
        setPlaces((prev) =>
          prev.map((x) =>
            x.id === placeId
              ? {
                ...x,
                imageUrl: newImageUrl,
                isDynamicImage: true,
                whatToSee: newPois,
                hasDynamicPois: true,
                flightPrices: shouldUpdateFlights ? flightPrices : x.flightPrices,
              }
              : x
          )
        );
      } finally {
        inFlightRef.current.delete(lockKey);
      }
    };

    enrichSelected();

    return () => {
      cancelled = true;
      inFlightRef.current.delete(lockKey);
    };
  }, [selectedId, departure, loading, selectedPlace]);

  const handleMapClick = async (latlng) => {
    // Si on clique, on reset la sélection précédente pour passer en mode ajout
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
        setPlaces((prev) => prev.filter((p) => p.id !== id));
        if (selectedId === id) setSelectedId(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]"> {/* Dark Theme Background */}
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              ✈️ Voyages <span className="text-sm font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded-full">{places.length}</span>
            </h1>
            <p className="mt-2 text-gray-400">
              Explore le monde et planifie tes prochaines aventures.
            </p>
          </div>

          <VoyageFilters
            viewMode={viewMode}
            setViewMode={setViewMode}
            departure={departure}
            setDeparture={setDeparture}
          />
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Main Area (Map or List) */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            {viewMode === "map" ? (
              <div className="h-[70vh] min-h-[500px] w-full">
                <VoyageMap
                  places={places}
                  selectedPlace={selectedPlace}
                  onMapClick={handleMapClick}
                  onSelect={setSelectedId}
                  tempMarker={tempMarker}
                  confirmAddPlace={confirmAddPlace}
                />
              </div>
            ) : (
              // List View
              <>
                {loading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-400">Chargement de tes voyages...</p>
                  </div>
                ) : (
                  <VoyageList
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

          {/* Sidebar Area (Details) */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <PlaceDetails
              place={selectedPlace}
              departure={departure}
              onDelete={handleDelete}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
