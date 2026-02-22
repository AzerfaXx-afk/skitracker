import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useTracking } from '../App';

const LiveMap = lazy(() => import('./LiveMap'));

export default function MapScreen() {
    const { coordinates, userPosition, distance, altitude, maxSpeed, negativeElevation } = useTracking();

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Full map */}
            <div className="absolute inset-0 z-0">
                <Suspense fallback={<div className="w-full h-full bg-slate-950 flex items-center justify-center">
                    <span className="text-slate-500 font-digital text-sm animate-pulse">Loading map…</span>
                </div>}>
                    <LiveMap
                        coordinates={coordinates}
                        userPosition={userPosition}
                        interactive={true}
                    />
                </Suspense>
            </div>

            {/* Top header */}
            <div className="absolute top-0 left-0 right-0 z-20 safe-top pointer-events-none">
                <div
                    className="px-5 pt-3 pb-6"
                    style={{ background: 'linear-gradient(to bottom, rgba(2,6,23,0.85) 0%, transparent 100%)' }}
                >
                    <h2 className="font-digital font-bold text-[13px] tracking-[0.2em] text-cyan-300">
                        🗺️ ROUTE MAP
                    </h2>
                    <p className="text-[10px] text-slate-500 font-digital tracking-wider mt-0.5">
                        {coordinates.length > 0 ? `${coordinates.length} waypoints tracked` : 'No route data yet'}
                    </p>
                </div>
            </div>

            {/* Bottom stats overlay */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 z-20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div
                    className="px-4 pb-4 pt-6"
                    style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.9) 0%, transparent 100%)' }}
                >
                    <div className="glass-strong flex overflow-hidden rounded-2xl">
                        <StatCell label="Distance" value={`${distance.toFixed(2)}`} unit="km" color="#f97316" />
                        <div className="w-px bg-white/5" />
                        <StatCell label="Max" value={`${maxSpeed.toFixed(0)}`} unit="km/h" color="#22d3ee" />
                        <div className="w-px bg-white/5" />
                        <StatCell label="D-" value={`${Math.round(negativeElevation)}`} unit="m" color="#a78bfa" />
                        <div className="w-px bg-white/5" />
                        <StatCell label="Alt." value={altitude != null ? `${altitude}` : '--'} unit="m" color="#e2e8f0" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function StatCell({ label, value, unit, color }) {
    return (
        <div className="flex-1 py-3 text-center">
            <p className="text-[8px] tracking-[0.15em] font-digital uppercase" style={{ color: '#475569' }}>{label}</p>
            <p className="font-digital font-bold text-base mt-0.5" style={{ color }}>
                {value}
                <span className="text-[9px] ml-0.5" style={{ color: '#475569' }}>{unit}</span>
            </p>
        </div>
    );
}
