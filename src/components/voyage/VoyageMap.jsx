import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Popup } from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";

// Fix deafult icon issues in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

/* --- Sub-components (Effect & Events) --- */

function MapEffects({ places, selectedPlace }) {
    const map = useMap();

    useEffect(() => {
        if (!selectedPlace) return;
        map.flyTo([selectedPlace.lat, selectedPlace.lng], map.getZoom(), {
            duration: 0.8,
        });
    }, [map, selectedPlace?.id, selectedPlace?.lat, selectedPlace?.lng]);

    return null;
}

function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
}

/* --- Main Map Component --- */

export function VoyageMap({ places, selectedPlace, onMapClick, onSelect, tempMarker, confirmAddPlace }) {
    return (
        <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-900 shadow-xl h-full w-full relative group">
            <MapContainer
                center={[46, 2]}
                zoom={4}
                className="h-full w-full z-0"
                style={{ cursor: "crosshair", background: "#1a1a1a" }}
            >
                {/* Dark Matter Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapEffects places={places} selectedPlace={selectedPlace} />
                <MapClickHandler onMapClick={onMapClick} />

                {places.map((p) => (
                    <Marker
                        key={p.id}
                        position={[p.lat, p.lng]}
                        eventHandlers={{
                            click: () => onSelect(p.id),
                        }}
                    />
                ))}

                {tempMarker && (
                    <Marker position={[tempMarker.lat, tempMarker.lng]} opacity={0.8}>
                        <Popup offset={[0, -20]} minWidth={200} closeButton={false} className="custom-popup-dark">
                            <div className="text-center p-1">
                                <h3 className="font-bold text-base text-gray-900">{tempMarker.name}</h3>
                                <p className="text-xs text-gray-600 mb-3">{tempMarker.country}</p>
                                <button
                                    onClick={confirmAddPlace}
                                    className="w-full bg-[#7f00ff] text-white text-xs font-bold py-2 px-3 rounded hover:bg-[#6800d2] transition shadow-md"
                                >
                                    Ajouter aux favoris
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {/* Overlay instruction */}
            <div className="absolute inset-x-0 bottom-4 pointer-events-none flex justify-center z-[500]">
                <span className="bg-gray-900/80 backdrop-blur text-gray-300 text-xs px-4 py-2 rounded-full border border-gray-700 shadow-sm opacity-60 group-hover:opacity-100 transition duration-500">
                    Clique n'importe où pour ajouter une destination
                </span>
            </div>
        </div>
    );
}
