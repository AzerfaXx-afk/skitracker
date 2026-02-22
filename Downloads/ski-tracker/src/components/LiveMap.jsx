import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapController({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, zoom ?? map.getZoom(), { animate: true, duration: 0.6 });
    }, [center, zoom, map]);
    return null;
}

const DEFAULT_CENTER = [45.8326, 6.8652]; // Chamonix

export default function LiveMap({ coordinates = [], userPosition, interactive = true, className = '' }) {
    const center = userPosition || (coordinates.length > 0 ? coordinates[coordinates.length - 1] : DEFAULT_CENTER);

    const trailOptions = useMemo(() => ({
        color: '#22d3ee',
        weight: 3.5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
    }), []);

    const glowOptions = useMemo(() => ({
        color: '#67e8f9',
        weight: 14,
        opacity: 0.12,
        lineCap: 'round',
        lineJoin: 'round',
    }), []);

    return (
        <div className={`w-full h-full ${className}`}>
            <MapContainer
                center={center}
                zoom={15}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
                attributionControl={false}
                dragging={interactive}
                scrollWheelZoom={interactive}
                touchZoom={interactive}
                doubleClickZoom={interactive}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20}
                />

                {/* Glow trail */}
                {coordinates.length > 1 && <Polyline positions={coordinates} pathOptions={glowOptions} />}
                {/* Trail */}
                {coordinates.length > 1 && <Polyline positions={coordinates} pathOptions={trailOptions} />}

                {/* User position marker */}
                {userPosition && (
                    <>
                        {/* Outer pulse */}
                        <CircleMarker
                            center={userPosition}
                            radius={18}
                            pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.08, weight: 1, opacity: 0.3 }}
                        />
                        {/* Inner dot */}
                        <CircleMarker
                            center={userPosition}
                            radius={6}
                            pathOptions={{ color: '#fff', fillColor: '#22d3ee', fillOpacity: 1, weight: 2 }}
                        />
                    </>
                )}

                <MapController center={center} />
            </MapContainer>
        </div>
    );
}
