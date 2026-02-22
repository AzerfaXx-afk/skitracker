import { lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Signal, SignalLow, SignalZero, Play, Square, Mountain } from 'lucide-react';
import { useTracking } from '../App';
import { formatDuration } from '../utils/geoMath';

const LiveMap = lazy(() => import('./LiveMap'));

/* ══════════════════════════════════════════════════
   GPS Signal Indicator
   ══════════════════════════════════════════════════ */
function GpsIndicator({ status }) {
    const Icon = status === 'ok' ? Signal : status === 'searching' ? SignalLow : SignalZero;
    const color = status === 'ok' ? '#22d3ee' : status === 'error' ? '#f87171' : '#475569';
    const label = status === 'ok' ? 'GPS' : status === 'searching' ? '...' : 'OFF';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon size={14} color={color} style={{ filter: status === 'ok' ? `drop-shadow(0 0 4px ${color})` : 'none' }} />
            <span className="font-digital" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color }}>
                {label}
            </span>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   Metric Overlay Card
   ══════════════════════════════════════════════════ */
function MetricCard({ label, value, unit, color, large }) {
    return (
        <div className="glass-metric" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span className="font-digital" style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
                color: '#475569', textTransform: 'uppercase',
            }}>
                {label}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span className="font-digital" style={{
                    fontSize: large ? 'clamp(2.2rem, 9vw, 3.2rem)' : 'clamp(1.3rem, 4.5vw, 1.7rem)',
                    fontWeight: 900, lineHeight: 1, color,
                    textShadow: `0 0 12px ${color}55, 0 0 30px ${color}22`,
                }}>
                    {value}
                </span>
                {unit && (
                    <span className="font-digital" style={{ fontSize: 10, fontWeight: 600, color: '#475569' }}>
                        {unit}
                    </span>
                )}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   Main CTA Button (Start / Stop)
   ══════════════════════════════════════════════════ */
function CTAButton({ isTracking, elapsedSeconds, onStart, onStop }) {
    /* ── STOP button ── */
    if (isTracking) {
        return (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Pulse rings */}
                {[0, 0.5].map(delay => (
                    <motion.div
                        key={delay}
                        style={{
                            position: 'absolute', width: 145, height: 145,
                            borderRadius: '50%',
                            border: `${delay === 0 ? 2 : 1}px solid rgba(249,115,22,${delay === 0 ? 0.3 : 0.15})`,
                            top: '50%', left: '50%',
                            marginTop: -72.5, marginLeft: -72.5,
                        }}
                        animate={{ scale: [1, delay === 0 ? 1.5 : 1.8], opacity: [delay === 0 ? 0.5 : 0.3, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay }}
                    />
                ))}

                <motion.button
                    onClick={onStop}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                        width: 130, height: 130, borderRadius: '50%',
                        background: 'linear-gradient(145deg, #9a3412, #ea580c, #f97316)',
                        boxShadow: '0 0 50px rgba(249,115,22,0.5), 0 0 100px rgba(249,115,22,0.15), inset 0 2px 0 rgba(255,255,255,0.12)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                    }}
                >
                    {/* Shimmer overlay */}
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
                        backgroundSize: '250% 100%',
                        animation: 'shimmer 3s linear infinite',
                    }} />
                    <Square size={24} fill="white" color="white" style={{ position: 'relative', zIndex: 2, marginBottom: 6 }} />
                    <span className="font-digital" style={{
                        fontSize: 13, fontWeight: 900, color: '#fff',
                        letterSpacing: '0.1em', position: 'relative', zIndex: 2,
                    }}>
                        {formatDuration(elapsedSeconds)}
                    </span>
                    <span className="font-digital" style={{
                        fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
                        letterSpacing: '0.15em', marginTop: 2, position: 'relative', zIndex: 2,
                    }}>
                        STOP & SAVE
                    </span>
                </motion.button>
            </div>
        );
    }

    /* ── START button ── */
    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Breathing rings */}
            <div style={{
                position: 'absolute', width: 170, height: 170, borderRadius: '50%',
                border: '1.5px solid rgba(34,211,238,0.12)',
                top: '50%', left: '50%', marginTop: -85, marginLeft: -85,
                animation: 'breathe 3s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', width: 200, height: 200, borderRadius: '50%',
                border: '1px solid rgba(34,211,238,0.06)',
                top: '50%', left: '50%', marginTop: -100, marginLeft: -100,
                animation: 'breathe-slow 4.5s ease-in-out infinite',
            }} />

            <motion.button
                onClick={onStart}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                style={{
                    width: 130, height: 130, borderRadius: '50%',
                    background: 'linear-gradient(145deg, #0e7490, #0891b2, #22d3ee)',
                    boxShadow: '0 0 50px rgba(34,211,238,0.4), 0 0 100px rgba(34,211,238,0.1), inset 0 2px 0 rgba(255,255,255,0.18)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                }}
            >
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                    backgroundSize: '250% 100%',
                    animation: 'shimmer 2.5s linear infinite',
                }} />
                <Play size={36} fill="white" color="white" style={{ position: 'relative', zIndex: 2, marginBottom: 4, marginLeft: 4 }} />
                <span className="font-digital" style={{
                    fontSize: 10, fontWeight: 800, color: '#fff',
                    letterSpacing: '0.15em', position: 'relative', zIndex: 2,
                }}>
                    START RUN
                </span>
            </motion.button>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   LIVE SCREEN — Main Dashboard
   ══════════════════════════════════════════════════ */
export default function LiveScreen() {
    const {
        isTracking, currentSpeed, maxSpeed, distance, altitude,
        negativeElevation, coordinates, elapsedSeconds, gpsStatus,
        newRecord, userPosition, onStart, onStop,
    } = useTracking();

    const speedColor = useMemo(
        () => currentSpeed >= 60 ? '#f97316' : currentSpeed >= 30 ? '#22d3ee' : '#e2e8f0',
        [currentSpeed]
    );

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

            {/* ── Background Map ── */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <Suspense fallback={
                    <div style={{
                        width: '100%', height: '100%',
                        background: 'radial-gradient(ellipse at 50% 30%, #0c1929, #020617)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Mountain size={80} strokeWidth={0.5} color="#22d3ee" style={{ opacity: 0.15 }} />
                    </div>
                }>
                    <LiveMap coordinates={coordinates} userPosition={userPosition} interactive={false} />
                </Suspense>
                {/* Dark overlay */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: isTracking
                        ? 'linear-gradient(to bottom, rgba(2,6,23,0.55) 0%, rgba(2,6,23,0.12) 30%, rgba(2,6,23,0.2) 55%, rgba(2,6,23,0.92) 100%)'
                        : 'linear-gradient(to bottom, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.08) 30%, rgba(2,6,23,0.3) 55%, rgba(2,6,23,0.95) 100%)',
                }} />
            </div>

            {/* ── Record flash ── */}
            <AnimatePresence>
                {newRecord && (
                    <motion.div
                        style={{
                            position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none',
                            background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.5) 0%, transparent 60%)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.7, 0.9, 0.4, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, times: [0, 0.1, 0.3, 0.7, 1] }}
                    />
                )}
            </AnimatePresence>

            {/* ── Top Status Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                style={{
                    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
                    padding: 'max(env(safe-area-inset-top, 14px), 14px) 18px 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
            >
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(14,165,233,0.1))',
                        border: '1px solid rgba(34,211,238,0.18)',
                        boxShadow: '0 0 20px rgba(34,211,238,0.08)',
                    }}>
                        <span style={{ fontSize: 20 }}>⛷️</span>
                    </div>
                    <div>
                        <h1 className="font-digital" style={{
                            fontSize: 15, fontWeight: 900, letterSpacing: '0.22em',
                            color: '#cffafe', lineHeight: 1,
                            textShadow: '0 0 20px rgba(34,211,238,0.35)',
                        }}>
                            SKITRACKER
                        </h1>
                        {isTracking && (
                            <motion.div
                                className="font-digital"
                                style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <span style={{
                                    width: 6, height: 6, borderRadius: '50%', background: '#ef4444',
                                    boxShadow: '0 0 6px rgba(239,68,68,0.6)',
                                }} />
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', letterSpacing: '0.15em' }}>
                                    REC {formatDuration(elapsedSeconds)}
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right — Altitude + GPS */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                        <span className="font-digital" style={{
                            display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end',
                        }}>
                            <Mountain size={10} color="#475569" />
                            <span style={{ fontSize: 8, color: '#475569', letterSpacing: '0.1em' }}>ALT</span>
                        </span>
                        <span className="font-digital" style={{
                            fontSize: 16, fontWeight: 800, color: '#e2e8f0',
                            textShadow: '0 0 10px rgba(255,255,255,0.1)',
                        }}>
                            {altitude != null ? `${altitude}` : '--'}
                            <span style={{ fontSize: 9, color: '#475569', marginLeft: 2 }}>m</span>
                        </span>
                    </div>
                    <GpsIndicator status={gpsStatus} />
                </div>
            </motion.div>

            {/* ── Metrics Overlay (when tracking) ── */}
            <AnimatePresence>
                {isTracking && (
                    <motion.div
                        style={{
                            position: 'absolute', top: 88, left: 0, right: 0, zIndex: 20,
                            padding: '0 12px',
                        }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                        {/* Speed + Max in row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                            <MetricCard label="Speed" value={currentSpeed.toFixed(1)} unit="km/h" color={speedColor} large />
                            <MetricCard label="Max Speed" value={maxSpeed.toFixed(1)} unit="km/h" color="#22d3ee" />
                        </div>
                        {/* Distance + D- + Duration */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                            <MetricCard label="Distance" value={distance.toFixed(2)} unit="km" color="#f97316" />
                            <MetricCard label="D- Descent" value={`${Math.round(negativeElevation)}`} unit="m" color="#a78bfa" />
                            <MetricCard label="Duration" value={formatDuration(elapsedSeconds)} color="#e2e8f0" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Passive state message ── */}
            <AnimatePresence>
                {!isTracking && (
                    <motion.div
                        style={{
                            position: 'absolute', bottom: 210, left: 0, right: 0, zIndex: 20,
                            textAlign: 'center',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <p className="font-digital" style={{
                            fontSize: 10, color: '#475569', letterSpacing: '0.35em',
                            textTransform: 'uppercase',
                        }}>
                            Ready to ride
                        </p>
                        <div style={{
                            width: 40, height: 1, margin: '10px auto 0',
                            background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), transparent)',
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── CTA Button ── */}
            <div style={{
                position: 'absolute', bottom: 24, left: 0, right: 0, zIndex: 30,
                display: 'flex', justifyContent: 'center',
            }}>
                <CTAButton isTracking={isTracking} elapsedSeconds={elapsedSeconds} onStart={onStart} onStop={onStop} />
            </div>
        </div>
    );
}
