import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Signal, SignalLow, SignalZero, Play, Square, Mountain, Gauge, MapPin, TrendingDown, Timer, ArrowUp, ArrowDown } from 'lucide-react';
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
            padding: large ? '16px 18px' : '12px 14px',
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
                    fontSize: large ? 'clamp(2.2rem, 9vw, 3.2rem)' : 'clamp(1.2rem, 4.5vw, 1.6rem)',
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
                        position: 'absolute', width: 110, height: 110, borderRadius: '50%',
                        border: `${delay === 0 ? 2 : 1}px solid rgba(249,115,22,${delay === 0 ? 0.3 : 0.15})`,
                        top: '50%', left: '50%', marginTop: -55, marginLeft: -55,
                    }}
                        animate={{ scale: [1, delay === 0 ? 1.4 : 1.7], opacity: [delay === 0 ? 0.5 : 0.3, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay }}
                    />
                ))}
                <motion.button onClick={onStop} whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    style={{
                        width: 96, height: 96, borderRadius: '50%',
                        background: 'linear-gradient(145deg, #9a3412, #ea580c, #f97316)',
                        boxShadow: '0 0 40px rgba(249,115,22,0.4), 0 0 80px rgba(249,115,22,0.1), inset 0 2px 0 rgba(255,255,255,0.12)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden',
                    }}>
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
                        backgroundSize: '250% 100%', animation: 'shimmer 3s linear infinite',
                    }} />
                    <Square size={18} fill="white" color="white" style={{ position: 'relative', zIndex: 2, marginBottom: 4 }} />
                    <span className="font-digital" style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '0.06em', position: 'relative', zIndex: 2 }}>
                        {formatDuration(elapsedSeconds)}
                    </span>
                    <span className="font-digital" style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', marginTop: 1, position: 'relative', zIndex: 2 }}>
                        ARRÊTER
                    </span>
                </motion.button>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
                position: 'absolute', width: 130, height: 130, borderRadius: '50%',
                border: '1.5px solid rgba(34,211,238,0.1)',
                top: '50%', left: '50%', marginTop: -65, marginLeft: -65,
                animation: 'breathe 3s ease-in-out infinite',
            }} />
            <div style={{
                position: 'absolute', width: 155, height: 155, borderRadius: '50%',
                border: '1px solid rgba(34,211,238,0.05)',
                top: '50%', left: '50%', marginTop: -77.5, marginLeft: -77.5,
                animation: 'breathe-slow 4.5s ease-in-out infinite',
            }} />
            <motion.button onClick={onStart} whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                style={{
                    width: 96, height: 96, borderRadius: '50%',
                    background: 'linear-gradient(145deg, #0e7490, #0891b2, #22d3ee)',
                    boxShadow: '0 0 40px rgba(34,211,238,0.3), 0 0 80px rgba(34,211,238,0.08), inset 0 2px 0 rgba(255,255,255,0.18)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                }}>
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                    backgroundSize: '250% 100%', animation: 'shimmer 2.5s linear infinite',
                }} />
                <Play size={28} fill="white" color="white" style={{ position: 'relative', zIndex: 2, marginBottom: 3, marginLeft: 3 }} />
                <span className="font-digital" style={{ fontSize: 8, fontWeight: 800, color: '#fff', letterSpacing: '0.1em', position: 'relative', zIndex: 2 }}>
                    ENREGISTRER
                </span>
            </motion.button>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   LIVE SCREEN — Métriques temps réel
   ══════════════════════════════════════════════════ */
export default function LiveScreen() {
    const {
        isTracking, currentSpeed, maxSpeed, distance, altitude,
        altitudeMax, altitudeMin,
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
                padding: 'max(env(safe-area-inset-top, 10px), 10px) 16px 6px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 11,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(14,165,233,0.05))',
                        border: '1px solid rgba(34,211,238,0.12)',
                    }}>
                        <span style={{ fontSize: 16 }}>⛷️</span>
                    </div>
                    <div>
                        <h1 className="font-digital" style={{
                            fontSize: 13, fontWeight: 900, letterSpacing: '0.2em',
                            color: '#cffafe', lineHeight: 1,
                            textShadow: '0 0 18px rgba(34,211,238,0.3)',
                        }}>
                            <span style={{ color: '#22d3ee' }}>Ski</span>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>-</span>Track
                        </h1>
                        {isTracking && (
                            <motion.div className="font-digital"
                                style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.6)' }} />
                                <span style={{ fontSize: 8, fontWeight: 700, color: '#f97316', letterSpacing: '0.1em' }}>
                                    REC {formatDuration(elapsedSeconds)}
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>
                <GpsIndicator status={gpsStatus} />
            </div>

            {/* ── Metrics area (scrollable) ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                padding: '4px 12px 0', gap: 6,
                overflowY: 'auto', overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch',
                minHeight: 0,
            }}>
                {/* Speed — always live */}
                <StatCard icon={Gauge} label="Vitesse" value={currentSpeed.toFixed(1)} unit="km/h" color={speedColor} large />

                {/* Altitude — always live */}
                <StatCard icon={Mountain} label="Altitude" value={altitude != null ? `${altitude}` : '--'} unit="m" color="#e2e8f0" />

                {/* Recording stats */}
                <AnimatePresence>
                    {isTracking && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                                <StatCard icon={Gauge} label="Vitesse Max" value={maxSpeed.toFixed(1)} unit="km/h" color="#22d3ee" />
                                <StatCard icon={MapPin} label="Distance" value={distance.toFixed(2)} unit="km" color="#f97316" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                                <StatCard icon={TrendingDown} label="D- Dénivelé" value={`${Math.round(negativeElevation)}`} unit="m" color="#a78bfa" />
                                <StatCard icon={Timer} label="Durée" value={formatDuration(elapsedSeconds)} color="#94a3b8" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                <StatCard icon={ArrowUp} label="Alt. Max" value={altitudeMax != null ? `${altitudeMax}` : '--'} unit="m" color="#4ade80" />
                                <StatCard icon={ArrowDown} label="Alt. Min" value={altitudeMin != null ? `${altitudeMin}` : '--'} unit="m" color="#fb923c" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── CTA Button — centered in bottom zone ── */}
            <div style={{
                flexShrink: 0,
                paddingBottom: 12, paddingTop: 12,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                minHeight: 130,
            }}>
                <CTAButton isTracking={isTracking} elapsedSeconds={elapsedSeconds} onStart={onStart} onStop={onStop} />
            </div>
        </div>
    );
}
