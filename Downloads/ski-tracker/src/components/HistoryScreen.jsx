import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gauge, MapPin, TrendingDown, Clock, ChevronDown, Calendar, Trash2 } from 'lucide-react';
import { useTracking } from '../App';
import { formatDuration } from '../utils/geoMath';

/* ── Group sessions by day ── */
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

/* ── Personal Best ── */
function BestStat({ icon: Icon, label, value, unit, color }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <Icon size={13} color={color} style={{ margin: '0 auto 5px', opacity: 0.7 }} />
            <p className="font-digital" style={{ fontSize: 7, color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</p>
            <p className="font-digital" style={{ fontSize: 20, fontWeight: 900, color, marginTop: 4, textShadow: `0 0 14px ${color}44` }}>
                {value}<span style={{ fontSize: 8, marginLeft: 3, color: '#475569', fontWeight: 500 }}>{unit}</span>
            </p>
        </div>
    );
}

/* ── Delete confirm dialog ── */
function ConfirmDelete({ message, onConfirm, onCancel }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 24,
            }}
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                onClick={e => e.stopPropagation()}
                className="glass-card"
                style={{ padding: 24, maxWidth: 320, width: '100%', textAlign: 'center' }}
            >
                <Trash2 size={28} color="#ef4444" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
                <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Supprimer ?</p>
                <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.4, marginBottom: 20 }}>{message}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '12px 0', borderRadius: 14,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>Annuler</button>
                    <button onClick={onConfirm} style={{
                        flex: 1, padding: '12px 0', borderRadius: 14,
                        background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}>Supprimer</button>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ── Day Accordion ── */
function DayAccordion({ dayLabel, sessions, defaultOpen, onDeleteDay, onDeleteSession }) {
    const [open, setOpen] = useState(defaultOpen);
    const dayMaxSpeed = Math.max(...sessions.map(s => s.maxSpeed));
    const dayTotalDist = sessions.reduce((sum, s) => sum + s.distance, 0);
    const dayTotalDescent = sessions.reduce((sum, s) => sum + s.negativeElevation, 0);

    return (
        <div style={{ marginBottom: 10 }}>
            {/* Day header */}
            <div className="glass-card" style={{
                padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
                border: open ? '1px solid rgba(34,211,238,0.15)' : '1px solid rgba(255,255,255,0.05)',
                background: open ? 'rgba(15,23,42,0.7)' : 'rgba(15,23,42,0.45)',
                transition: 'all 0.3s',
            }}>
                {/* Calendar icon */}
                <div
                    onClick={() => setOpen(o => !o)}
                    style={{
                        flexShrink: 0, width: 40, height: 40, borderRadius: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: open ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.03)',
                        border: open ? '1px solid rgba(34,211,238,0.18)' : '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer', transition: 'all 0.3s',
                    }}
                >
                    <Calendar size={16} color={open ? '#22d3ee' : '#475569'} />
                </div>

                {/* Day info — clickable to toggle */}
                <div onClick={() => setOpen(o => !o)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', textTransform: 'capitalize', lineHeight: 1.2 }}>
                        {dayLabel}
                    </p>
                    <p className="font-digital" style={{ fontSize: 8, color: '#475569', marginTop: 2, letterSpacing: '0.1em' }}>
                        {sessions.length} run{sessions.length > 1 ? 's' : ''} · {dayTotalDist.toFixed(1)} km · D- {Math.round(dayTotalDescent)}m
                    </p>
                </div>

                {/* Max speed badge */}
                <div style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 9px', borderRadius: 16,
                    background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)',
                }}>
                    <Gauge size={9} color="#22d3ee" />
                    <span className="font-digital" style={{ fontSize: 13, fontWeight: 900, color: '#22d3ee' }}>
                        {dayMaxSpeed.toFixed(0)}
                    </span>
                    <span className="font-digital" style={{ fontSize: 6, color: '#475569' }}>km/h</span>
                </div>

                {/* Delete day */}
                <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => { e.stopPropagation(); onDeleteDay(dayLabel); }}
                    style={{
                        flexShrink: 0, width: 34, height: 34, borderRadius: 11,
                        background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', padding: 0,
                    }}
                >
                    <Trash2 size={13} color="#ef4444" style={{ opacity: 0.6 }} />
                </motion.button>

                {/* Chevron */}
                <motion.div
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setOpen(o => !o)}
                    style={{ flexShrink: 0, cursor: 'pointer' }}
                >
                    <ChevronDown size={16} color="#475569" />
                </motion.div>
            </div>

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
                        <div style={{ padding: '8px 0 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {sessions.map((s, i) => (
                                <SessionRow key={s.id} session={s} index={i} onDelete={() => onDeleteSession(s.id)} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── Session Row ── */
function SessionRow({ session, index, onDelete }) {
    const d = new Date(session.id);
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            style={{
                marginLeft: 18, padding: '10px 12px',
                background: 'rgba(2,6,23,0.5)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14,
                borderLeft: '2px solid rgba(34,211,238,0.2)',
                display: 'flex', alignItems: 'center', gap: 10,
            }}
        >
            {/* Time */}
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, minWidth: 48 }}>
                <Clock size={9} color="#475569" />
                <span className="font-digital" style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>{time}</span>
            </div>

            {/* Stats */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                <div>
                    <span className="font-digital" style={{ fontSize: 6, color: '#475569', letterSpacing: '0.1em' }}>MAX</span>
                    <p className="font-digital" style={{ fontSize: 12, fontWeight: 800, color: '#22d3ee', marginTop: 1 }}>
                        {session.maxSpeed.toFixed(0)}<span style={{ fontSize: 6, color: '#475569', marginLeft: 2 }}>km/h</span>
                    </p>
                </div>
                <div>
                    <span className="font-digital" style={{ fontSize: 6, color: '#475569', letterSpacing: '0.1em' }}>DIST</span>
                    <p className="font-digital" style={{ fontSize: 12, fontWeight: 800, color: '#f97316', marginTop: 1 }}>
                        {session.distance.toFixed(2)}<span style={{ fontSize: 6, color: '#475569', marginLeft: 2 }}>km</span>
                    </p>
                </div>
                <div>
                    <span className="font-digital" style={{ fontSize: 6, color: '#475569', letterSpacing: '0.1em' }}>D-</span>
                    <p className="font-digital" style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', marginTop: 1 }}>
                        {Math.round(session.negativeElevation)}<span style={{ fontSize: 6, color: '#475569', marginLeft: 2 }}>m</span>
                    </p>
                </div>
            </div>

            {/* Duration */}
            <span className="font-digital" style={{ fontSize: 9, color: '#334155', flexShrink: 0 }}>
                {formatDuration(session.duration)}
            </span>

            {/* Delete button */}
            <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={onDelete}
                style={{
                    flexShrink: 0, width: 30, height: 30, borderRadius: 10,
                    background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0,
                }}
            >
                <Trash2 size={11} color="#ef4444" style={{ opacity: 0.5 }} />
            </motion.button>
        </motion.div>
    );
}

/* ══════════════════════════════
   HISTORY SCREEN
   ══════════════════════════════ */
export default function HistoryScreen() {
    const { sessions, deleteSession, deleteDaySessions } = useTracking();
    const dayGroups = useMemo(() => groupByDay(sessions), [sessions]);

    // Confirm delete state
    const [confirmDelete, setConfirmDelete] = useState(null);

    const handleDeleteDay = (dayKey) => {
        setConfirmDelete({ type: 'day', key: dayKey, message: `Supprimer toutes les sessions de ce jour ?` });
    };

    const handleDeleteSession = (sessionId) => {
        setConfirmDelete({ type: 'session', key: sessionId, message: `Supprimer cet enregistrement ?` });
    };

    const executeDelete = () => {
        if (!confirmDelete) return;
        if (confirmDelete.type === 'day') deleteDaySessions(confirmDelete.key);
        else deleteSession(confirmDelete.key);
        setConfirmDelete(null);
    };

    return (
        <div style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            background: 'radial-gradient(ellipse at 25% 0%, #0d1f3c, #020617 55%, #000510)',
            overflow: 'hidden',
        }}>
            {/* Confirm dialog */}
            <AnimatePresence>
                {confirmDelete && (
                    <ConfirmDelete
                        message={confirmDelete.message}
                        onConfirm={executeDelete}
                        onCancel={() => setConfirmDelete(null)}
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div style={{ padding: 'max(env(safe-area-inset-top, 14px), 14px) 20px 10px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Trophy size={18} color="#22d3ee" />
                    <h2 className="font-digital" style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.2em', color: '#22d3ee' }}>MY RUNS</h2>
                </div>
                <p className="font-digital" style={{ fontSize: 10, color: '#475569', letterSpacing: '0.1em', marginTop: 4 }}>
                    {sessions.length > 0
                        ? `${sessions.length} session${sessions.length > 1 ? 's' : ''} · ${dayGroups.length} day${dayGroups.length > 1 ? 's' : ''}`
                        : 'No sessions yet'}
                </p>
            </div>

            {/* Personal Bests */}
            {sessions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card" style={{ margin: '4px 16px 14px', padding: 16, flexShrink: 0 }}>
                    <p className="font-digital" style={{ fontSize: 8, color: '#475569', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 14 }}>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px', WebkitOverflowScrolling: 'touch' }}>
                {sessions.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card"
                        style={{ padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                            <span style={{ fontSize: 52, display: 'block', marginBottom: 16 }}>⛷️</span>
                        </motion.div>
                        <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: 15 }}>No runs yet</p>
                        <p style={{ color: '#475569', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>Go to the Live tab and hit START REC!</p>
                    </motion.div>
                ) : (
                    dayGroups.map(([day, daySessions], i) => (
                        <DayAccordion
                            key={day}
                            dayLabel={day}
                            sessions={daySessions}
                            defaultOpen={i === 0}
                            onDeleteDay={handleDeleteDay}
                            onDeleteSession={handleDeleteSession}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
