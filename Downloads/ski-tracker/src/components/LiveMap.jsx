import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [45.8326, 6.8652];

/* ── Map auto-follow + resize fix ── */
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

    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 300);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

/* ── Recenter button (used by MapScreen) ── */
function RecenterButton({ map, target }) {
    if (!target) return null;
    return (
        <button
            onClick={() => map.setView(target, 16, { animate: true, duration: 0.6 })}
            style={{
                position: 'absolute', bottom: 90, right: 16, zIndex: 30,
                width: 48, height: 48, borderRadius: 16,
                background: 'rgba(2,6,23,0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(34,211,238,0.2)',
                boxShadow: '0 0 20px rgba(34,211,238,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#22d3ee',
                fontSize: 22,
            }}>
            📍
        </button>
    );
}

/* ── RecenterControl (inside MapContainer) ── */
function RecenterControl({ target }) {
    const map = useMap();
    return <RecenterButton map={map} target={target} />;
}

export default function LiveMap({ coordinates = [], userPosition, interactive = true }) {
    const center = userPosition || (coordinates.length > 0 ? coordinates[coordinates.length - 1] : DEFAULT_CENTER);

    const trailOptions = useMemo(() => ({
        color: '#22d3ee', weight: 3.5, opacity: 0.9, lineCap: 'round', lineJoin: 'round',
    }), []);

    const glowOptions = useMemo(() => ({
        color: '#67e8f9', weight: 14, opacity: 0.15, lineCap: 'round', lineJoin: 'round',
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
                {coordinates.length > 1 && <Polyline positions={coordinates} pathOptions={glowOptions} />}
                {coordinates.length > 1 && <Polyline positions={coordinates} pathOptions={trailOptions} />}

                {userPosition && (
                    <>
                        <CircleMarker center={userPosition} radius={20}
                            pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.06, weight: 1.5, opacity: 0.3 }} />
                        <CircleMarker center={userPosition} radius={7}
                            pathOptions={{ color: '#fff', fillColor: '#22d3ee', fillOpacity: 1, weight: 2.5 }} />
                    </>
                )}

                <MapFollower center={center} follow={!interactive} />
                {interactive && <RecenterControl target={userPosition} />}
            </MapContainer>
        </div>
    );
}
