import { useEffect, useRef, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';
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
        const timer = setTimeout(() => map.invalidateSize(), 200);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

/* ── Glass Recenter Button ── */
function RecenterControl({ target }) {
    const map = useMap();
    const [isRecentered, setIsRecentered] = useState(true);

    useEffect(() => {
        const onMove = () => {
            if (!target) return;
            const mapCenter = map.getCenter();
            const dist = mapCenter.distanceTo({ lat: target[0], lng: target[1] });
            setIsRecentered(dist < 50);
        };
        map.on('moveend', onMove);
        return () => map.off('moveend', onMove);
    }, [map, target]);

    if (!target) return null;

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: isRecentered ? 0.4 : 1,
                scale: isRecentered ? 0.9 : 1,
            }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={(e) => {
                e.stopPropagation();
                map.setView(target, 16, { animate: true, duration: 0.5 });
            }}
            style={{
                position: 'absolute', bottom: 90, right: 14, zIndex: 1000,
                width: 46, height: 46, borderRadius: 15,
                background: 'rgba(2, 6, 23, 0.75)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: isRecentered
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(34,211,238,0.25)',
                boxShadow: isRecentered
                    ? 'none'
                    : '0 0 20px rgba(34,211,238,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
            }}
        >
            <Crosshair
                size={20}
                color={isRecentered ? '#475569' : '#22d3ee'}
                strokeWidth={2}
                style={{
                    filter: isRecentered ? 'none' : 'drop-shadow(0 0 6px rgba(34,211,238,0.4))',
                    transition: 'color 0.3s, filter 0.3s',
                }}
            />
        </motion.button>
    );
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
                zoomAnimation={true}
                fadeAnimation={true}
                markerZoomAnimation={true}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20}
                    keepBuffer={6}
                    updateWhenZooming={false}
                    updateWhenIdle={true}
                    loading="lazy"
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
