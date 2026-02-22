import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Signal, SignalLow, SignalZero, Play, Square, Mountain, Gauge, MapPin, TrendingDown, Timer } from 'lucide-react';
import { useTracking } from '../App';
import { formatDuration } from '../utils/geoMath';

/* ── GPS Signal ── */
function GpsIndicator({ status }) {
    const Icon = status === 'ok' ? Signal : status === 'searching' ? SignalLow : SignalZero;
    const color = status === 'ok' ? '#22d3ee' : status === 'error' ? '#f87171' : '#475569';
    const label = status === 'ok' ? 'GPS' : status === 'searching' ? '...' : 'OFF';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Icon size={14} color={color} style={{ filter: status === 'ok' ? `drop-shadow(0 0 4px ${color})` : 'none' }} />
            <span className="font-digital" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color }}>{label}</span>
        </div>
    );
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, unit, color, large }) {
    return (
        <div className="glass-metric" style={{
            display: 'flex', flexDirection: 'column',
            gap: large ? 6 : 3,
            padding: large ? '18px 20px' : '14px 16px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon size={11} color="#475569" />
                <span className="font-digital" style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: '0.2em',
                    color: '#475569', textTransform: 'uppercase',
                }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span className="font-digital" style={{
                    fontSize: large ? 'clamp(2.4rem, 10vw, 3.6rem)' : 'clamp(1.3rem, 5vw, 1.8rem)',
                    fontWeight: 900, lineHeight: 1, color,
                    textShadow: `0 0 14px ${color}44, 0 0 35px ${color}18`,
                }}>{value}</span>
                {unit && (
                    <span className="font-digital" style={{ fontSize: 10, fontWeight: 600, color: '#475569' }}>{unit}</span>
                )}
            </div>
        </div>
    );
}

/* ── CTA Button ── */
function CTAButton({ isTracking, elapsedSeconds, onStart, onStop }) {
    if (isTracking) {
        return (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {[0, 0.5].map(delay => (
                    <motion.div key={delay} style={{
                        position: 'absolute', width: 120, height: 120, borderRadius: '50%',
                        border: `${delay === 0 ? 2 : 1}px solid rgba(249,115,22,${delay === 0 ? 0.3 : 0.15})`,
                        top: '50%', left: '50%', marginTop: -60, marginLeft: -60,
                    }}
                        animate={{ scale: [1, delay === 0 ? 1.5 : 1.8], opacity: [delay === 0 ? 0.5 : 0.3, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay }}
                    />
                ))}
                <motion.button onClick={onStop} whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                        width: 108, height: 108, borderRadius: '50%',
                        background: 'linear-gradient(145deg, #9a3412, #ea580c, #f97316)',
                        boxShadow: '0 0 45px rgba(249,115,22,0.45), 0 0 90px rgba(249,115,22,0.12), inset 0 2px 0 rgba(255,255,255,0.12)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                    }}>
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
                        backgroundSize: '250% 100%', animation: 'shimmer 3s linear infinite',
                    }} />
                    <Square size={20} fill="white" color="white" style={{ position: 'relative', zIndex: 2, marginBottom: 5 }} />
                    <span className="font-digital" style={{ fontSize: 12, fontWeight: 900, color: '#fff', letterSpacing: '0.08em', position: 'relative', zIndex: 2 }}>
                        {formatDuration(elapsedSeconds)}
                    </span>
                    <span className="font-digital" style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', marginTop: 1, position: 'relative', zIndex: 2 }}>
                        STOP & SAVE
                    </span>
                </motion.button>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
                position: 'absolute', width: 145, height: 145, borderRadius: '50%',
                border: '1.5px solid rgba(34,211,238,0.1)',
                top: '50%', left: '50%', marginTop: -72.5, marginLeft: -72.5,
                animation: 'breathe 3s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', width: 170, height: 170, borderRadius: '50%',
                border: '1px solid rgba(34,211,238,0.05)',
                top: '50%', left: '50%', marginTop: -85, marginLeft: -85,
                animation: 'breathe-slow 4.5s ease-in-out infinite',
            }} />
            <motion.button onClick={onStart} whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                style={{
                    width: 108, height: 108, borderRadius: '50%',
                    background: 'linear-gradient(145deg, #0e7490, #0891b2, #22d3ee)',
                    boxShadow: '0 0 45px rgba(34,211,238,0.35), 0 0 90px rgba(34,211,238,0.1), inset 0 2px 0 rgba(255,255,255,0.18)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                }}>
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                    backgroundSize: '250% 100%', animation: 'shimmer 2.5s linear infinite',
                }} />
                <Play size={30} fill="white" color="white" style={{ position: 'relative', zIndex: 2, marginBottom: 3, marginLeft: 3 }} />
                <span className="font-digital" style={{ fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '0.12em', position: 'relative', zIndex: 2 }}>
                    START REC
                </span>
            </motion.button>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   LIVE SCREEN — Real-time metrics, no map
   ══════════════════════════════════════════════════ */
export default function LiveScreen() {
    const {
        isTracking, currentSpeed, maxSpeed, distance, altitude,
        negativeElevation, elapsedSeconds, gpsStatus,
        newRecord, onStart, onStop,
    } = useTracking();

    const speedColor = useMemo(
        () => currentSpeed >= 60 ? '#f97316' : currentSpeed >= 30 ? '#22d3ee' : '#e2e8f0',
        [currentSpeed]
    );

    return (
        <div style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            background: 'radial-gradient(ellipse at 50% 10%, #0c1929 0%, #020617 50%, #000510 100%)',
            overflow: 'hidden',
        }}>
            {/* Record flash */}
            <AnimatePresence>
                {newRecord && (
                    <motion.div style={{
                        position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none',
                        background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.4) 0%, transparent 60%)',
                    }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.6, 0.8, 0.3, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, times: [0, 0.1, 0.3, 0.7, 1] }}
                    />
                )}
            </AnimatePresence>

            {/* ── Top bar ── */}
            <div style={{
                flexShrink: 0,
                padding: 'max(env(safe-area-inset-top, 14px), 14px) 18px 10px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(14,165,233,0.06))',
                        border: '1px solid rgba(34,211,238,0.15)',
                    }}>
                        <span style={{ fontSize: 18 }}>⛷️</span>
                    </div>
                    <div>
                        <h1 className="font-digital" style={{
                            fontSize: 14, fontWeight: 900, letterSpacing: '0.22em',
                            color: '#cffafe', lineHeight: 1,
                            textShadow: '0 0 20px rgba(34,211,238,0.3)',
                        }}>
                            <span style={{ color: '#22d3ee' }}>Ski</span>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>-</span>Track
                        </h1>
                        {isTracking && (
                            <motion.div className="font-digital"
                                style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }} />
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#f97316', letterSpacing: '0.1em' }}>
                                    REC {formatDuration(elapsedSeconds)}
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>
                <GpsIndicator status={gpsStatus} />
            </div>

            {/* ── Real-time metrics ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                padding: '8px 14px 0', gap: 8,
                overflowY: 'auto', overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch',
                minHeight: 0,
            }}>
                {/* Speed — always live */}
                <StatCard icon={Gauge} label="Speed" value={currentSpeed.toFixed(1)} unit="km/h" color={speedColor} large />

                {/* Altitude — always live */}
                <StatCard icon={Mountain} label="Altitude" value={altitude != null ? `${altitude}` : '--'} unit="m" color="#e2e8f0" />

                {/* Row: Max + Distance (only when recording) */}
                <AnimatePresence>
                    {isTracking && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                                <StatCard icon={Gauge} label="Max Speed" value={maxSpeed.toFixed(1)} unit="km/h" color="#22d3ee" />
                                <StatCard icon={MapPin} label="Distance" value={distance.toFixed(2)} unit="km" color="#f97316" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <StatCard icon={TrendingDown} label="D- Descent" value={`${Math.round(negativeElevation)}`} unit="m" color="#a78bfa" />
                                <StatCard icon={Timer} label="Duration" value={formatDuration(elapsedSeconds)} color="#94a3b8" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── CTA Button — pinned at bottom ── */}
            <div style={{
                flexShrink: 0,
                paddingBottom: 28, paddingTop: 20,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                minHeight: 160,
            }}>
                <CTAButton isTracking={isTracking} elapsedSeconds={elapsedSeconds} onStart={onStart} onStop={onStop} />
            </div>
        </div>
    );
}
