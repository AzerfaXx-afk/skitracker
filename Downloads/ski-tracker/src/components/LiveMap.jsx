import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [45.8326, 6.8652]; // Chamonix

/* ── Auto-center only when user position updates ── */
function MapFollower({ center, follow }) {
    const map = useMap();
    const firstRun = useRef(true);

    useEffect(() => {
        if (!center) return;
        if (firstRun.current) {
            map.setView(center, 15, { animate: false });
            firstRun.current = false;
        } else if (follow) {
            map.setView(center, map.getZoom(), { animate: true, duration: 0.8 });
        }
    }, [center, follow, map]);

    /* Fix map size after mount (critical for mobile) */
    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 300);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

export default function LiveMap({ coordinates = [], userPosition, interactive = true }) {
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
        opacity: 0.15,
        lineCap: 'round',
        lineJoin: 'round',
    }), []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
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
                zoomSnap={0.5}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20}
                />

                {/* Glow trail */}
                {coordinates.length > 1 && <Polyline positions={coordinates} pathOptions={glowOptions} />}
                {/* Trail line */}
                {coordinates.length > 1 && <Polyline positions={coordinates} pathOptions={trailOptions} />}

                {/* User position dot */}
                {userPosition && (
                    <>
                        {/* Outer ring */}
                        <CircleMarker
                            center={userPosition}
                            radius={20}
                            pathOptions={{
                                color: '#22d3ee',
                                fillColor: '#22d3ee',
                                fillOpacity: 0.06,
                                weight: 1.5,
                                opacity: 0.3,
                            }}
                        />
                        {/* Inner dot */}
                        <CircleMarker
                            center={userPosition}
                            radius={7}
                            pathOptions={{
                                color: '#fff',
                                fillColor: '#22d3ee',
                                fillOpacity: 1,
                                weight: 2.5,
                            }}
                        />
                    </>
                )}

                <MapFollower center={center} follow={!interactive} />
            </MapContainer>
        </div>
    );
}
