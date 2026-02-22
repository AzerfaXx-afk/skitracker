import { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracking } from '../App';
import { formatDuration } from '../utils/geoMath';

const LiveMap = lazy(() => import('./LiveMap'));

// ── GPS Signal Strength ──────────────────────────────────────────
function GpsSignal({ status }) {
    const bars = status === 'ok' ? 3 : status === 'searching' ? 1 : 0;
    const color = status === 'ok' ? '#22d3ee' : status === 'error' ? '#f87171' : '#475569';
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-end gap-[2px]">
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className="rounded-sm transition-colors duration-300"
                        style={{
                            width: 3,
                            height: 4 + i * 3,
                            background: i <= bars ? color : 'rgba(71,85,105,0.3)',
                            boxShadow: i <= bars ? `0 0 6px ${color}` : 'none',
                        }}
                    />
                ))}
            </div>
            <span className="text-[9px] font-digital font-semibold tracking-widest" style={{ color }}>
                {status === 'ok' ? 'GPS' : status === 'searching' ? '...' : status === 'error' ? 'ERR' : 'OFF'}
            </span>
        </div>
    );
}

// ── Metric Glass Card ────────────────────────────────────────────
function MetricOverlay({ label, value, unit, color = '#22d3ee', big = false }) {
    return (
        <div className="glass-strong px-4 py-3 flex flex-col">
            <span className="text-[9px] font-digital font-bold tracking-[0.2em] uppercase" style={{ color: '#64748b' }}>
                {label}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
                <span
                    className="font-digital font-black leading-none"
                    style={{
                        fontSize: big ? 'clamp(2.8rem, 12vw, 4rem)' : 'clamp(1.6rem, 6vw, 2.2rem)',
                        color,
                        textShadow: `0 0 15px ${color}66, 0 0 40px ${color}33`,
                    }}
                >
                    {value}
                </span>
                <span className="text-xs font-digital font-medium" style={{ color: '#64748b' }}>{unit}</span>
            </div>
        </div>
    );
}

// ── Circular CTA Button ──────────────────────────────────────────
function ActionButton({ isTracking, elapsedSeconds, onStart, onStop }) {
    if (isTracking) {
        // ── STOP state ───────────────
        return (
            <div className="relative flex flex-col items-center">
                {/* Outer pulse rings */}
                <motion.div
                    className="absolute rounded-full"
                    style={{ width: 140, height: 140, border: '2px solid rgba(249,115,22,0.3)' }}
                    animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                    className="absolute rounded-full"
                    style={{ width: 140, height: 140, border: '1px solid rgba(249,115,22,0.2)' }}
                    animate={{ scale: [1, 1.7], opacity: [0.3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                />

                <motion.button
                    onClick={onStop}
                    className="relative flex flex-col items-center justify-center overflow-hidden"
                    style={{
                        width: 130,
                        height: 130,
                        borderRadius: '50%',
                        background: 'linear-gradient(145deg, #c2410c, #ea580c, #f97316)',
                        boxShadow: '0 0 50px rgba(249,115,22,0.6), 0 0 100px rgba(249,115,22,0.2), inset 0 2px 0 rgba(255,255,255,0.15)',
                    }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                    {/* Shimmer */}
                    <motion.div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
                            backgroundSize: '200% 100%',
                        }}
                        animate={{ backgroundPosition: ['100% 0', '-100% 0'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    {/* Stop icon */}
                    <div className="relative z-10 w-7 h-7 rounded-md bg-white/90 mb-1.5" />
                    <span className="relative z-10 font-digital font-black text-white text-[11px] tracking-[0.15em]">
                        {formatDuration(elapsedSeconds)}
                    </span>
                    <span className="relative z-10 font-digital font-bold text-white/70 text-[8px] tracking-[0.2em] mt-0.5">
                        STOP & SAVE
                    </span>
                </motion.button>
            </div>
        );
    }

    // ── START state ───────────────
    return (
        <div className="relative flex flex-col items-center">
            {/* Breathing outer glow */}
            <div
                className="absolute rounded-full breathe"
                style={{
                    width: 160,
                    height: 160,
                    border: '1.5px solid rgba(34,211,238,0.15)',
                    boxShadow: '0 0 40px rgba(34,211,238,0.1)',
                }}
            />
            <div
                className="absolute rounded-full breathe-slow"
                style={{
                    width: 190,
                    height: 190,
                    border: '1px solid rgba(34,211,238,0.08)',
                }}
            />

            <motion.button
                onClick={onStart}
                className="relative flex flex-col items-center justify-center overflow-hidden"
                style={{
                    width: 130,
                    height: 130,
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #0e7490, #0891b2, #22d3ee)',
                    boxShadow: '0 0 50px rgba(34,211,238,0.5), 0 0 100px rgba(34,211,238,0.15), inset 0 2px 0 rgba(255,255,255,0.2)',
                }}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
                {/* Shimmer */}
                <motion.div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                        backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['100% 0', '-100% 0'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
                {/* Play triangle */}
                <svg className="relative z-10 mb-1" width="36" height="36" viewBox="0 0 24 24" fill="white">
                    <polygon points="6,3 20,12 6,21" />
                </svg>
                <span className="relative z-10 font-digital font-bold text-white text-[10px] tracking-[0.15em]">
                    START RUN
                </span>
            </motion.button>
        </div>
    );
}

// ── Main Live Screen ─────────────────────────────────────────────
export default function LiveScreen() {
    const {
        isTracking, currentSpeed, maxSpeed, distance, altitude,
        negativeElevation, coordinates, elapsedSeconds, gpsStatus,
        newRecord, userPosition, onStart, onStop,
    } = useTracking();

    const speedColor = currentSpeed >= 60 ? '#f97316' : currentSpeed >= 30 ? '#22d3ee' : '#e2e8f0';

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* ── Background Map ── */}
            <div className="absolute inset-0 z-0">
                <Suspense fallback={<div className="w-full h-full bg-slate-950" />}>
                    <LiveMap
                        coordinates={coordinates}
                        userPosition={userPosition}
                        interactive={false}
                    />
                </Suspense>
                {/* Darken overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: isTracking
                        ? 'linear-gradient(to bottom, rgba(2,6,23,0.5) 0%, rgba(2,6,23,0.2) 40%, rgba(2,6,23,0.3) 60%, rgba(2,6,23,0.85) 100%)'
                        : 'linear-gradient(to bottom, rgba(2,6,23,0.6) 0%, rgba(2,6,23,0.15) 40%, rgba(2,6,23,0.4) 60%, rgba(2,6,23,0.9) 100%)',
                }} />
            </div>

            {/* ── Record flash ── */}
            <AnimatePresence>
                {newRecord && (
                    <motion.div
                        className="pointer-events-none absolute inset-0 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.5, 0.8, 0.3, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, times: [0, 0.1, 0.3, 0.7, 1] }}
                        style={{ background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.5) 0%, transparent 65%)' }}
                    />
                )}
            </AnimatePresence>

            {/* ── Top Status Bar ── */}
            <motion.div
                className="absolute top-0 left-0 right-0 z-30 safe-top px-5 pt-3 pb-3 flex items-center justify-between"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {/* Left: brand */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(14,165,233,0.2))', border: '1px solid rgba(34,211,238,0.2)' }}>
                        <span className="text-sm">⛷️</span>
                    </div>
                    <div>
                        <h1 className="font-digital font-black text-[13px] tracking-[0.2em] leading-none" style={{ color: '#cffafe' }}>
                            SKITRACKER
                        </h1>
                    </div>
                </div>

                {/* Right: GPS + Altitude */}
                <div className="flex items-center gap-3">
                    {altitude != null && (
                        <div className="flex items-baseline gap-1">
                            <span className="font-digital font-bold text-sm text-slate-300">{altitude}</span>
                            <span className="text-[9px] text-slate-500 font-digital">m</span>
                        </div>
                    )}
                    <GpsSignal status={gpsStatus} />
                </div>
            </motion.div>

            {/* ── Metrics Overlay (when tracking) ── */}
            <AnimatePresence>
                {isTracking && (
                    <motion.div
                        className="absolute top-0 left-0 right-0 z-20 pt-20 px-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Speed + Distance — primary row */}
                        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                            <MetricOverlay
                                label="Speed"
                                value={currentSpeed.toFixed(1)}
                                unit="km/h"
                                color={speedColor}
                                big
                            />
                            <MetricOverlay
                                label="Max Speed"
                                value={maxSpeed.toFixed(1)}
                                unit="km/h"
                                color="#22d3ee"
                            />
                        </div>

                        {/* Secondary row */}
                        <div className="grid grid-cols-3 gap-2">
                            <MetricOverlay
                                label="Distance"
                                value={distance.toFixed(2)}
                                unit="km"
                                color="#f97316"
                            />
                            <MetricOverlay
                                label="D- Descent"
                                value={Math.round(negativeElevation).toString()}
                                unit="m"
                                color="#a78bfa"
                            />
                            <MetricOverlay
                                label="Duration"
                                value={formatDuration(elapsedSeconds)}
                                unit=""
                                color="#e2e8f0"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Passive mode text (not tracking) ── */}
            <AnimatePresence>
                {!isTracking && (
                    <motion.div
                        className="absolute bottom-52 left-0 right-0 z-20 flex flex-col items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <p className="font-digital text-[11px] text-slate-400 tracking-[0.3em] uppercase">
                            Ready to ride
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Action Button ── */}
            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center">
                <ActionButton
                    isTracking={isTracking}
                    elapsedSeconds={elapsedSeconds}
                    onStart={onStart}
                    onStop={onStop}
                />
            </div>
        </div>
    );
}
