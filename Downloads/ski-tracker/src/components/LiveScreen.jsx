import { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTracking } from '../App';
import { formatDuration } from '../utils/geoMath';

const LiveMap = lazy(() => import('./LiveMap'));

/* ────── GPS bars ────── */
function GpsBars({ status }) {
    const bars = status === 'ok' ? 3 : status === 'searching' ? 1 : 0;
    const c = status === 'ok' ? '#22d3ee' : status === 'error' ? '#f87171' : '#475569';
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
            {[1, 2, 3].map(i => (
                <div key={i} style={{
                    width: 3, height: 4 + i * 4, borderRadius: 1,
                    background: i <= bars ? c : 'rgba(71,85,105,0.3)',
                    boxShadow: i <= bars ? `0 0 6px ${c}` : 'none',
                    transition: 'all 0.3s',
                }} />
            ))}
        </div>
    );
}

/* ────── Glass metric card ────── */
function MetricCard({ label, value, unit, color, big }) {
    return (
        <div style={{
            background: 'rgba(2,6,23,0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, padding: big ? '14px 16px' : '10px 14px',
            display: 'flex', flexDirection: 'column', gap: 2,
        }}>
            <span className="font-digital" style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
                color: '#475569', textTransform: 'uppercase',
            }}>
                {label}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="font-digital" style={{
                    fontSize: big ? 'clamp(2.4rem, 10vw, 3.5rem)' : 'clamp(1.4rem, 5vw, 1.8rem)',
                    fontWeight: 900, lineHeight: 1, color,
                    textShadow: `0 0 15px ${color}66, 0 0 40px ${color}22`,
                }}>
                    {value}
                </span>
                {unit && (
                    <span className="font-digital" style={{ fontSize: 10, fontWeight: 500, color: '#475569' }}>
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}

/* ────── CTA Button ────── */
function CTAButton({ isTracking, elapsedSeconds, onStart, onStop }) {
    if (isTracking) {
        return (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Pulse rings */}
                <motion.div style={{
                    position: 'absolute', width: 150, height: 150,
                    borderRadius: '50%', border: '2px solid rgba(249,115,22,0.25)',
                    top: '50%', left: '50%', marginTop: -75, marginLeft: -75,
                }}
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.button
                    onClick={onStop}
                    style={{
                        width: 130, height: 130, borderRadius: '50%',
                        background: 'linear-gradient(145deg, #c2410c, #ea580c, #f97316)',
                        boxShadow: '0 0 50px rgba(249,115,22,0.5), 0 0 100px rgba(249,115,22,0.15), inset 0 2px 0 rgba(255,255,255,0.15)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                    }}
                    whileTap={{ scale: 0.92 }}
                >
                    <div style={{ width: 26, height: 26, borderRadius: 5, background: 'rgba(255,255,255,0.9)', marginBottom: 6, position: 'relative', zIndex: 2 }} />
                    <span className="font-digital" style={{ fontSize: 12, fontWeight: 900, color: '#fff', letterSpacing: '0.1em', position: 'relative', zIndex: 2 }}>
                        {formatDuration(elapsedSeconds)}
                    </span>
                    <span className="font-digital" style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.15em', marginTop: 2, position: 'relative', zIndex: 2 }}>
                        STOP & SAVE
                    </span>
                </motion.button>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Breathing rings */}
            <div style={{
                position: 'absolute', width: 165, height: 165, borderRadius: '50%',
                border: '1.5px solid rgba(34,211,238,0.15)',
                top: '50%', left: '50%', marginTop: -82, marginLeft: -82,
                animation: 'breathe 3s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', width: 195, height: 195, borderRadius: '50%',
                border: '1px solid rgba(34,211,238,0.08)',
                top: '50%', left: '50%', marginTop: -97, marginLeft: -97,
                animation: 'breathe-outer 4s ease-in-out infinite',
            }} />
            <motion.button
                onClick={onStart}
                style={{
                    width: 130, height: 130, borderRadius: '50%',
                    background: 'linear-gradient(145deg, #0e7490, #0891b2, #22d3ee)',
                    boxShadow: '0 0 50px rgba(34,211,238,0.4), 0 0 100px rgba(34,211,238,0.1), inset 0 2px 0 rgba(255,255,255,0.2)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                }}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
            >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white" style={{ position: 'relative', zIndex: 2, marginBottom: 4 }}>
                    <polygon points="6,3 20,12 6,21" />
                </svg>
                <span className="font-digital" style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.15em', position: 'relative', zIndex: 2 }}>
                    START RUN
                </span>
            </motion.button>
        </div>
    );
}

/* ────── LIVE SCREEN ────── */
export default function LiveScreen() {
    const {
        isTracking, currentSpeed, maxSpeed, distance, altitude,
        negativeElevation, coordinates, elapsedSeconds, gpsStatus,
        newRecord, userPosition, onStart, onStop,
    } = useTracking();

    const speedColor = currentSpeed >= 60 ? '#f97316' : currentSpeed >= 30 ? '#22d3ee' : '#e2e8f0';

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Background Map */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <Suspense fallback={<div style={{ width: '100%', height: '100%', background: '#020617' }} />}>
                    <LiveMap coordinates={coordinates} userPosition={userPosition} interactive={false} />
                </Suspense>
                {/* Darkening overlay */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: isTracking
                        ? 'linear-gradient(to bottom, rgba(2,6,23,0.55) 0%, rgba(2,6,23,0.15) 35%, rgba(2,6,23,0.25) 60%, rgba(2,6,23,0.9) 100%)'
                        : 'linear-gradient(to bottom, rgba(2,6,23,0.65) 0%, rgba(2,6,23,0.1) 35%, rgba(2,6,23,0.35) 60%, rgba(2,6,23,0.92) 100%)',
                }} />
            </div>

            {/* Record flash */}
            <AnimatePresence>
                {newRecord && (
                    <motion.div
                        style={{
                            position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none',
                            background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.5) 0%, transparent 65%)'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.6, 0.8, 0.3, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2 }}
                    />
                )}
            </AnimatePresence>

            {/* ── Top status bar ── */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
                padding: 'max(env(safe-area-inset-top, 12px), 12px) 20px 12px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.25), rgba(14,165,233,0.15))',
                        border: '1px solid rgba(34,211,238,0.2)',
                    }}>
                        <span style={{ fontSize: 18 }}>⛷️</span>
                    </div>
                    <div>
                        <h1 className="font-digital" style={{
                            fontSize: 14, fontWeight: 900, letterSpacing: '0.2em', color: '#cffafe', lineHeight: 1,
                            textShadow: '0 0 20px rgba(34,211,238,0.4)',
                        }}>SKITRACKER</h1>
                        {isTracking && (
                            <motion.span className="font-digital" style={{ fontSize: 10, fontWeight: 700, color: '#f97316', letterSpacing: '0.15em' }}
                                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                                ● REC {formatDuration(elapsedSeconds)}
                            </motion.span>
                        )}
                    </div>
                </div>
                {/* Right: altitude + GPS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div className="font-digital" style={{ fontSize: 9, color: '#475569', letterSpacing: '0.15em' }}>ALT</div>
                        <div className="font-digital" style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
                            {altitude != null ? `${altitude}m` : '--'}
                        </div>
                    </div>
                    <GpsBars status={gpsStatus} />
                </div>
            </div>

            {/* ── Metrics overlay (when tracking) ── */}
            <AnimatePresence>
                {isTracking && (
                    <motion.div
                        style={{
                            position: 'absolute', top: 80, left: 0, right: 0, zIndex: 20,
                            padding: '0 12px',
                        }}
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                    >
                        {/* Primary: Speed + Max */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                            <MetricCard label="SPEED" value={currentSpeed.toFixed(1)} unit="km/h" color={speedColor} big />
                            <MetricCard label="MAX SPEED" value={maxSpeed.toFixed(1)} unit="km/h" color="#22d3ee" />
                        </div>
                        {/* Secondary: Distance + D- + Duration */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                            <MetricCard label="DISTANCE" value={distance.toFixed(2)} unit="km" color="#f97316" />
                            <MetricCard label="D- DESCENT" value={`${Math.round(negativeElevation)}`} unit="m" color="#a78bfa" />
                            <MetricCard label="DURATION" value={formatDuration(elapsedSeconds)} unit="" color="#e2e8f0" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── "Ready to ride" text (not tracking) ── */}
            {!isTracking && (
                <motion.div
                    style={{ position: 'absolute', bottom: 210, left: 0, right: 0, zIndex: 20, textAlign: 'center' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                    <p className="font-digital" style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.3em' }}>
                        READY TO RIDE
                    </p>
                </motion.div>
            )}

            {/* ── CTA Button ── */}
            <div style={{
                position: 'absolute', bottom: 30, left: 0, right: 0, zIndex: 30,
                display: 'flex', justifyContent: 'center',
            }}>
                <CTAButton isTracking={isTracking} elapsedSeconds={elapsedSeconds} onStart={onStart} onStop={onStop} />
            </div>
        </div>
    );
}
