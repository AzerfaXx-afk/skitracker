import { motion } from 'framer-motion';
import { Trophy, Gauge, MapPin, TrendingDown, Clock, Calendar } from 'lucide-react';
import { useTracking } from '../App';
import { formatDuration } from '../utils/geoMath';

/* ── Personal Best Stat ── */
function BestStat({ icon: Icon, label, value, unit, color }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <Icon size={14} color={color} style={{ margin: '0 auto 4px', opacity: 0.7 }} />
            <p className="font-digital" style={{ fontSize: 7, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {label}
            </p>
            <p className="font-digital" style={{
                fontSize: 22, fontWeight: 900, color, marginTop: 3,
                textShadow: `0 0 12px ${color}44`,
            }}>
                {value}
                <span style={{ fontSize: 9, marginLeft: 3, color: '#475569', fontWeight: 500 }}>{unit}</span>
            </p>
        </div>
    );
}

/* ── Session Card ── */
function SessionCard({ session, index }) {
    const d = new Date(session.id);
    const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3, ease: 'easeOut' }}
            className="glass-card"
            style={{ padding: 16, display: 'flex', gap: 14 }}
        >
            {/* Rank */}
            <div style={{
                flexShrink: 0, width: 44, height: 44, borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: index === 0
                    ? 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))'
                    : 'rgba(255,255,255,0.02)',
                border: index === 0
                    ? '1px solid rgba(34,211,238,0.2)'
                    : '1px solid rgba(255,255,255,0.04)',
            }}>
                <span className="font-digital" style={{
                    fontSize: 12, fontWeight: 900,
                    color: index === 0 ? '#22d3ee' : '#475569',
                    textShadow: index === 0 ? '0 0 8px rgba(34,211,238,0.4)' : 'none',
                }}>
                    #{index + 1}
                </span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Date + time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={11} color="#475569" />
                        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>{dateStr}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="font-digital" style={{ fontSize: 10, color: '#475569' }}>{timeStr}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={9} color="#334155" />
                            <span className="font-digital" style={{ fontSize: 10, color: '#334155' }}>
                                {formatDuration(session.duration)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                            <Gauge size={8} color="#475569" />
                            <span className="font-digital" style={{ fontSize: 7, color: '#475569', letterSpacing: '0.15em' }}>MAX</span>
                        </div>
                        <span className="font-digital" style={{ fontSize: 15, fontWeight: 800, color: '#22d3ee' }}>
                            {session.maxSpeed.toFixed(0)}
                            <span style={{ fontSize: 8, color: '#475569', marginLeft: 2 }}>km/h</span>
                        </span>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                            <MapPin size={8} color="#475569" />
                            <span className="font-digital" style={{ fontSize: 7, color: '#475569', letterSpacing: '0.15em' }}>DIST</span>
                        </div>
                        <span className="font-digital" style={{ fontSize: 15, fontWeight: 800, color: '#f97316' }}>
                            {session.distance.toFixed(2)}
                            <span style={{ fontSize: 8, color: '#475569', marginLeft: 2 }}>km</span>
                        </span>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 2 }}>
                            <TrendingDown size={8} color="#475569" />
                            <span className="font-digital" style={{ fontSize: 7, color: '#475569', letterSpacing: '0.15em' }}>D-</span>
                        </div>
                        <span className="font-digital" style={{ fontSize: 15, fontWeight: 800, color: '#a78bfa' }}>
                            {Math.round(session.negativeElevation)}
                            <span style={{ fontSize: 8, color: '#475569', marginLeft: 2 }}>m</span>
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════
   HISTORY SCREEN
   ══════════════════════════════════════════════════ */
export default function HistoryScreen() {
    const { sessions } = useTracking();

    return (
        <div style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            background: 'radial-gradient(ellipse at 25% 0%, #0d1f3c, #020617 55%, #000510)',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: 'max(env(safe-area-inset-top, 14px), 14px) 20px 14px',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Trophy size={18} color="#22d3ee" />
                    <h2 className="font-digital" style={{
                        fontSize: 16, fontWeight: 800, letterSpacing: '0.2em', color: '#22d3ee',
                    }}>
                        MY RUNS
                    </h2>
                </div>
                <p className="font-digital" style={{
                    fontSize: 10, color: '#475569', letterSpacing: '0.1em', marginTop: 4,
                }}>
                    {sessions.length > 0 ? `${sessions.length} session${sessions.length > 1 ? 's' : ''} recorded` : 'No sessions yet'}
                </p>
            </div>

            {/* Personal Bests */}
            {sessions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="glass-card"
                    style={{ margin: '0 16px 14px', padding: 18, flexShrink: 0 }}
                >
                    <p className="font-digital" style={{
                        fontSize: 8, color: '#475569', letterSpacing: '0.25em',
                        textTransform: 'uppercase', marginBottom: 14,
                    }}>
                        ⭐ Personal Bests
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <BestStat
                            icon={Gauge} label="Top Speed"
                            value={Math.max(...sessions.map(s => s.maxSpeed)).toFixed(0)}
                            unit="km/h" color="#22d3ee"
                        />
                        <BestStat
                            icon={MapPin} label="Distance"
                            value={Math.max(...sessions.map(s => s.distance)).toFixed(1)}
                            unit="km" color="#f97316"
                        />
                        <BestStat
                            icon={TrendingDown} label="Descent"
                            value={Math.max(...sessions.map(s => s.negativeElevation)).toFixed(0)}
                            unit="m" color="#a78bfa"
                        />
                    </div>
                </motion.div>
            )}

            {/* Session list */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '0 16px 16px',
                WebkitOverflowScrolling: 'touch',
            }}>
                {sessions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="glass-card"
                        style={{
                            padding: '60px 24px', textAlign: 'center',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                        }}
                    >
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <span style={{ fontSize: 52, display: 'block', marginBottom: 16 }}>⛷️</span>
                        </motion.div>
                        <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: 15 }}>No runs yet</p>
                        <p style={{ color: '#475569', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
                            Go to the Live tab and hit START RUN!
                        </p>
                    </motion.div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {sessions.map((s, i) => <SessionCard key={s.id} session={s} index={i} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
