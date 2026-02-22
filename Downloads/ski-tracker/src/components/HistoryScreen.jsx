import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gauge, MapPin, TrendingDown, Clock, ChevronDown, Calendar } from 'lucide-react';
import { useTracking } from '../App';
import { formatDuration } from '../utils/geoMath';

/* ══════════════════════════════════════════════════
   Group sessions by day
   ══════════════════════════════════════════════════ */
function groupByDay(sessions) {
    const groups = {};
    sessions.forEach(s => {
        const d = new Date(s.id);
        const key = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        if (!groups[key]) groups[key] = [];
        groups[key].push(s);
    });
    return Object.entries(groups);
}

/* ══════════════════════════════════════════════════
   Personal Best Stat
   ══════════════════════════════════════════════════ */
function BestStat({ icon: Icon, label, value, unit, color }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <Icon size={13} color={color} style={{ margin: '0 auto 5px', opacity: 0.7 }} />
            <p className="font-digital" style={{ fontSize: 7, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {label}
            </p>
            <p className="font-digital" style={{
                fontSize: 20, fontWeight: 900, color, marginTop: 4,
                textShadow: `0 0 14px ${color}44`,
            }}>
                {value}
                <span style={{ fontSize: 8, marginLeft: 3, color: '#475569', fontWeight: 500 }}>{unit}</span>
            </p>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   Day Accordion
   ══════════════════════════════════════════════════ */
function DayAccordion({ dayLabel, sessions, defaultOpen }) {
    const [open, setOpen] = useState(defaultOpen);
    const dayMaxSpeed = Math.max(...sessions.map(s => s.maxSpeed));
    const dayTotalDist = sessions.reduce((sum, s) => sum + s.distance, 0);
    const dayTotalDescent = sessions.reduce((sum, s) => sum + s.negativeElevation, 0);
    const runsCount = sessions.length;

    return (
        <div style={{ marginBottom: 10 }}>
            {/* Day header — always visible */}
            <motion.button
                onClick={() => setOpen(o => !o)}
                whileTap={{ scale: 0.98 }}
                className="glass-card"
                style={{
                    width: '100%', padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', border: open ? '1px solid rgba(34,211,238,0.15)' : '1px solid rgba(255,255,255,0.05)',
                    transition: 'border-color 0.3s',
                    textAlign: 'left',
                    background: open ? 'rgba(15,23,42,0.7)' : 'rgba(15,23,42,0.45)',
                }}
            >
                {/* Date icon */}
                <div style={{
                    flexShrink: 0, width: 42, height: 42, borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: open ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.03)',
                    border: open ? '1px solid rgba(34,211,238,0.18)' : '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.3s',
                }}>
                    <Calendar size={18} color={open ? '#22d3ee' : '#475569'} />
                </div>

                {/* Day info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                        fontSize: 13, fontWeight: 600, color: '#e2e8f0',
                        textTransform: 'capitalize', lineHeight: 1.2,
                    }}>
                        {dayLabel}
                    </p>
                    <p className="font-digital" style={{ fontSize: 9, color: '#475569', marginTop: 3, letterSpacing: '0.1em' }}>
                        {runsCount} run{runsCount > 1 ? 's' : ''} · {dayTotalDist.toFixed(1)} km · D- {Math.round(dayTotalDescent)}m
                    </p>
                </div>

                {/* Max speed badge — always visible */}
                <div style={{
                    flexShrink: 0, textAlign: 'right',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2,
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 20,
                        background: 'rgba(34,211,238,0.08)',
                        border: '1px solid rgba(34,211,238,0.15)',
                    }}>
                        <Gauge size={10} color="#22d3ee" />
                        <span className="font-digital" style={{
                            fontSize: 14, fontWeight: 900, color: '#22d3ee',
                            textShadow: '0 0 10px rgba(34,211,238,0.3)',
                        }}>
                            {dayMaxSpeed.toFixed(0)}
                        </span>
                        <span className="font-digital" style={{ fontSize: 7, color: '#475569' }}>km/h</span>
                    </div>
                </div>

                {/* Chevron */}
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ flexShrink: 0 }}
                >
                    <ChevronDown size={18} color="#475569" />
                </motion.div>
            </motion.button>

            {/* Expanded sessions */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{
                            padding: '8px 0 0 0',
                            display: 'flex', flexDirection: 'column', gap: 6,
                        }}>
                            {sessions.map((s, i) => (
                                <SessionRow key={s.id} session={s} index={i} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   Session Row (inside accordion)
   ══════════════════════════════════════════════════ */
function SessionRow({ session, index }) {
    const d = new Date(session.id);
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            style={{
                marginLeft: 20,
                padding: '12px 14px',
                background: 'rgba(2,6,23,0.5)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 14,
                borderLeft: '2px solid rgba(34,211,238,0.2)',
                display: 'flex', alignItems: 'center', gap: 12,
            }}
        >
            {/* Time */}
            <div style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
                minWidth: 52,
            }}>
                <Clock size={10} color="#475569" />
                <span className="font-digital" style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
                    {time}
                </span>
            </div>

            {/* Stats grid */}
            <div style={{
                flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                gap: 8,
            }}>
                <div>
                    <span className="font-digital" style={{ fontSize: 7, color: '#475569', letterSpacing: '0.1em' }}>MAX</span>
                    <p className="font-digital" style={{ fontSize: 13, fontWeight: 800, color: '#22d3ee', marginTop: 1 }}>
                        {session.maxSpeed.toFixed(0)}
                        <span style={{ fontSize: 7, color: '#475569', marginLeft: 2 }}>km/h</span>
                    </p>
                </div>
                <div>
                    <span className="font-digital" style={{ fontSize: 7, color: '#475569', letterSpacing: '0.1em' }}>DIST</span>
                    <p className="font-digital" style={{ fontSize: 13, fontWeight: 800, color: '#f97316', marginTop: 1 }}>
                        {session.distance.toFixed(2)}
                        <span style={{ fontSize: 7, color: '#475569', marginLeft: 2 }}>km</span>
                    </p>
                </div>
                <div>
                    <span className="font-digital" style={{ fontSize: 7, color: '#475569', letterSpacing: '0.1em' }}>D-</span>
                    <p className="font-digital" style={{ fontSize: 13, fontWeight: 800, color: '#a78bfa', marginTop: 1 }}>
                        {Math.round(session.negativeElevation)}
                        <span style={{ fontSize: 7, color: '#475569', marginLeft: 2 }}>m</span>
                    </p>
                </div>
            </div>

            {/* Duration */}
            <span className="font-digital" style={{
                fontSize: 10, color: '#334155', flexShrink: 0,
            }}>
                {formatDuration(session.duration)}
            </span>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════
   HISTORY SCREEN
   ══════════════════════════════════════════════════ */
export default function HistoryScreen() {
    const { sessions } = useTracking();
    const dayGroups = useMemo(() => groupByDay(sessions), [sessions]);

    return (
        <div style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            background: 'radial-gradient(ellipse at 25% 0%, #0d1f3c, #020617 55%, #000510)',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                padding: 'max(env(safe-area-inset-top, 14px), 14px) 20px 10px',
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
                    {sessions.length > 0
                        ? `${sessions.length} session${sessions.length > 1 ? 's' : ''} · ${dayGroups.length} day${dayGroups.length > 1 ? 's' : ''}`
                        : 'No sessions yet'}
                </p>
            </div>

            {/* Personal Bests */}
            {sessions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="glass-card"
                    style={{ margin: '4px 16px 14px', padding: 16, flexShrink: 0 }}
                >
                    <p className="font-digital" style={{
                        fontSize: 8, color: '#475569', letterSpacing: '0.25em',
                        textTransform: 'uppercase', marginBottom: 14,
                    }}>
                        ⭐ All-time Bests
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <BestStat icon={Gauge} label="Top Speed" value={Math.max(...sessions.map(s => s.maxSpeed)).toFixed(0)} unit="km/h" color="#22d3ee" />
                        <BestStat icon={MapPin} label="Distance" value={Math.max(...sessions.map(s => s.distance)).toFixed(1)} unit="km" color="#f97316" />
                        <BestStat icon={TrendingDown} label="Descent" value={Math.max(...sessions.map(s => s.negativeElevation)).toFixed(0)} unit="m" color="#a78bfa" />
                    </div>
                </motion.div>
            )}

            {/* Day accordions */}
            <div style={{
                flex: 1, overflowY: 'auto', padding: '0 16px 20px',
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
                    dayGroups.map(([day, daySessions], i) => (
                        <DayAccordion
                            key={day}
                            dayLabel={day}
                            sessions={daySessions}
                            defaultOpen={i === 0}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
