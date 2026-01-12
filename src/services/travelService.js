const AMADEUS_CLIENT_ID = import.meta.env.VITE_AMADEUS_CLIENT_ID;
const AMADEUS_CLIENT_SECRET = import.meta.env.VITE_AMADEUS_CLIENT_SECRET;
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

let amadeusToken = null;
let tokenExpiration = 0;

/**
 * Authentifie auprès d'Amadeus pour obtenir un token d'accès.
 * Note: En prod, cela devrait être fait côté backend pour ne pas exposer le Secret.
 */
async function getAmadeusToken() {
    const now = Date.now();
    if (amadeusToken && now < tokenExpiration) {
        return amadeusToken;
    }

    if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
        console.warn("Clés Amadeus manquantes dans le .env");
        return null;
    }

    try {
        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");
        params.append("client_id", AMADEUS_CLIENT_ID);
        params.append("client_secret", AMADEUS_CLIENT_SECRET);

        const response = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });

        if (!response.ok) throw new Error("Erreur auth Amadeus");

        const data = await response.json();
        amadeusToken = data.access_token;
        // expire_in est en secondes, on enlève 60s de marge
        tokenExpiration = now + (data.expires_in - 60) * 1000;
        return amadeusToken;
    } catch (error) {
        console.error("Erreur récupération token Amadeus:", error);
        return null;
    }
}

/**
 * Récupère des photos depuis Unsplash
 * @param {string} query - Mots clés (ex: "Lisbon landmark")
 */
export async function getDestinationImage(query) {
    if (!UNSPLASH_ACCESS_KEY) {
        // Image placeholder si pas de clé
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80";
    }

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                query
            )}&per_page=1&orientation=landscape`,
            {
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                },
            }
        );

        const data = await response.json();
        return data.results?.[0]?.urls?.regular || null;
    } catch (error) {
        console.error("Erreur Unsplash:", error);
        return null;
    }
}

/**
 * Récupère le code IATA d'une ville (ex: "Paris" -> "PAR")
 * @param {string} keyword 
 */
export async function getCityCode(keyword) {
    const token = await getAmadeusToken();
    if (!token) return null;

    try {
        const url = `https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=${encodeURIComponent(keyword)}&page[limit]=1`;
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return null;

        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0].iataCode;
        }
        return null;
    } catch (error) {
        console.error("Erreur City Code:", error);
        return null;
    }
}

/**
 * Recherche des offres de vols pour avoir une estimation de prix
 * @param {string} originCode - Ex: "PAR"
 * @param {string} destination - Code IATA (LIS) ou Nom de ville (Lisbonne)
 */
export async function getFlightEstimates(originCode, destination) {
    const token = await getAmadeusToken();
    if (!token) return null;

    let destinationCode = destination;

    // Avoid search if origin == destination (ex: PAR -> PAR)
    if (originCode === destination || (destinationCode && originCode === destinationCode)) {
        console.warn("Origin and destination are the same, skipping flight search.");
        return null;
    }

    // Si le code semble être un nom de ville (plus de 3 lettres), on cherche le code IATA
    if (destination.length > 3) {
        const code = await getCityCode(destination);
        if (code) {
            destinationCode = code;
        } else {
            console.warn(`Impossible de trouver le code IATA pour ${destination}`);
            return null;
        }
    }

    try {
        // On cherche un vol pour dans ~1 mois pour avoir une idée de prix
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const dateStr = futureDate.toISOString().split("T")[0];

        // Flight Offers Search (GET)
        // nonStop=false pour avoir plus de chance de trouver des vols (surtout test env)
        const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${originCode}&destinationLocationCode=${destinationCode}&departureDate=${dateStr}&adults=1&nonStop=false&max=5`;

        console.log(`Searching flights: ${originCode} -> ${destinationCode} on ${dateStr}`);

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Amadeus API Error:", response.status, response.statusText, errorBody);
            return null;
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            console.warn("No flight offers found.");
            return null;
        }

        // Calcul des min/max et durée moyenne
        let minPrice = Infinity;
        let maxPrice = 0;
        let totalDurationMinutes = 0;
        let count = 0;
        let arrivalAirport = destinationCode;

        data.data.forEach((offer) => {
            const price = parseFloat(offer.price.total);
            if (price < minPrice) minPrice = price;
            if (price > maxPrice) maxPrice = price;

            const itinerary = offer.itineraries[0];
            if (itinerary) {
                const durationStr = itinerary.duration;
                const duration = parseIsoDuration(durationStr);
                totalDurationMinutes += duration;
                count++;

                const lastSegment = itinerary.segments[itinerary.segments.length - 1];
                if (lastSegment && count === 1) {
                    arrivalAirport = lastSegment.arrival.iataCode;
                }
            }
        });

        const avgDuration = count > 0 ? totalDurationMinutes / count : 0;

        return {
            min: Math.round(minPrice),
            max: Math.round(maxPrice),
            duration: formatDuration(avgDuration),
            arrivalAirport: arrivalAirport
        };
    } catch (error) {
        console.error("Erreur vol:", error);
        return null;
    }
}

/**
 * Récupère les points d'intérêt (POIs)
 * @param {number} lat 
 * @param {number} lng 
 */
export async function getPointsOfInterest(lat, lng) {
    const token = await getAmadeusToken();
    if (!token) return [];

    // Points of Interest API
    // Radius en KM
    // Points of Interest API (deprecated? switch to Tours and Activities)
    // Radius en KM
    const url = `https://test.api.amadeus.com/v1/shopping/activities?latitude=${lat}&longitude=${lng}&radius=10`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return [];

        const data = await response.json();
        return (data.data || []).map(poi => poi.name);
    } catch (error) {
        console.error("Erreur POIs:", error);
        return [];
    }
}

/**
 * Retrouve le nom de la ville via Reverse Geocoding (Nominatim / OSM)
 * Gratuit, pas de clé, mais il faut respecter le User-Agent et le Rate Limit (1/sec pour gros usage).
 */
/**
 * Retrouve le nom de la ville via Reverse Geocoding (BigDataCloud)
 * Cette API est plus permissive sur le CORS que Nominatim pour les appels client-side.
 */
export async function getCityFromCoordinates(lat, lng) {
    try {
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=fr`
        );

        if (!response.ok) return null;

        const data = await response.json();

        // BigDataCloud retourne "locality", "city", "principalSubdivision" etc.
        const city = data.city || data.locality || data.principalSubdivision;
        const country = data.countryName;
        const countryCode = data.countryCode;

        if (!city) return null;

        return {
            name: city,
            country: country || "",
            countryCode: countryCode
        };

    } catch (error) {
        console.error("Erreur Geocoding:", error);
        return null;
    }
}

// Utilitaires

function parseIsoDuration(duration) {
    // Format simple PT1H30M ou PT45M
    // Ceci est une implémentation simplifiée
    let hours = 0;
    let minutes = 0;

    const matchH = duration.match(/(\d+)H/);
    const matchM = duration.match(/(\d+)M/);

    if (matchH) hours = parseInt(matchH[1], 10);
    if (matchM) minutes = parseInt(matchM[1], 10);

    return hours * 60 + minutes;
}

function formatDuration(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    return `${h}h${m.toString().padStart(2, '0')}`;
}
