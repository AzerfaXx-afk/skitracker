import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useTracking } from '../App';

const LiveMap = lazy(() => import('./LiveMap'));

function Stat({ label, value, unit, color }) {
    return (
        <div style={{ flex: 1, textAlign: 'center', padding: '10px 4px' }}>
            <p className="font-digital" style={{ fontSize: 8, letterSpacing: '0.15em', color: '#475569', textTransform: 'uppercase' }}>{label}</p>
            <p className="font-digital" style={{ fontSize: 16, fontWeight: 800, color, marginTop: 2 }}>
                {value}
                <span style={{ fontSize: 9, marginLeft: 3, color: '#475569' }}>{unit}</span>
            </p>
        </div>
    );
}

export default function MapScreen() {
    const { coordinates, userPosition, distance, altitude, maxSpeed, negativeElevation } = useTracking();

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Full-screen map */}
            <div style={{ position: 'absolute', inset: 0 }}>
                <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="font-digital" style={{ color: '#475569', fontSize: 12 }}>Loading map…</span>
                </div>}>
                    <LiveMap coordinates={coordinates} userPosition={userPosition} interactive={true} />
                </Suspense>
            </div>

            {/* Top gradient + title */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, pointerEvents: 'none',
                background: 'linear-gradient(to bottom, rgba(2,6,23,0.9) 0%, transparent 100%)',
                padding: 'max(env(safe-area-inset-top, 12px), 12px) 20px 24px 20px',
            }}>
                <h2 className="font-digital" style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.2em', color: '#22d3ee' }}>
                    🗺️ ROUTE MAP
                </h2>
                <p className="font-digital" style={{ fontSize: 10, color: '#475569', letterSpacing: '0.1em', marginTop: 3 }}>
                    {coordinates.length > 0 ? `${coordinates.length} waypoints tracked` : 'Start a run to see your route'}
                </p>
            </div>

            {/* Bottom stats */}
            <motion.div
                style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
                    background: 'linear-gradient(to top, rgba(2,6,23,0.95) 0%, transparent 100%)',
                    padding: '36px 12px 12px 12px',
                }}
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div style={{
                    display: 'flex',
                    background: 'rgba(2,6,23,0.7)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 16, overflow: 'hidden',
                }}>
                    <Stat label="Distance" value={distance.toFixed(2)} unit="km" color="#f97316" />
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
                    <Stat label="Max" value={maxSpeed.toFixed(0)} unit="km/h" color="#22d3ee" />
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
                    <Stat label="D-" value={Math.round(negativeElevation)} unit="m" color="#a78bfa" />
                    <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
                    <Stat label="Alt." value={altitude != null ? altitude : '--'} unit="m" color="#e2e8f0" />
                </div>
            </motion.div>
        </div>
    );
}
