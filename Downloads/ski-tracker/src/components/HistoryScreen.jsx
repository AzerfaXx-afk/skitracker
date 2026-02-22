import { motion } from 'framer-motion';
import { useTracking } from '../App';
import { formatDuration } from '../utils/geoMath';

function Best({ label, value, unit, color }) {
    return (
        <div>
            <p className="font-digital" style={{ fontSize: 8, color: '#64748b', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</p>
            <p className="font-digital" style={{ fontSize: 20, fontWeight: 900, color, marginTop: 2, textShadow: `0 0 12px ${color}55` }}>
                {value}<span style={{ fontSize: 9, marginLeft: 3, color: '#475569' }}>{unit}</span>
            </p>
        </div>
    );
}

function Session({ session, idx }) {
    const d = new Date(session.id);
    const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            style={{
                background: 'rgba(2,6,23,0.72)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 16,
                display: 'flex', gap: 12,
            }}
        >
            {/* Rank */}
            <div style={{
                flexShrink: 0, width: 42, height: 42, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: idx === 0 ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.03)',
                border: idx === 0 ? '1px solid rgba(34,211,238,0.25)' : '1px solid rgba(255,255,255,0.05)',
            }}>
                <span className="font-digital" style={{ fontSize: 11, fontWeight: 800, color: idx === 0 ? '#22d3ee' : '#475569' }}>
                    #{idx + 1}
                </span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{date}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <span className="font-digital" style={{ fontSize: 10, color: '#475569' }}>{time}</span>
                        <span className="font-digital" style={{ fontSize: 10, color: '#334155' }}>{formatDuration(session.duration)}</span>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                        <p className="font-digital" style={{ fontSize: 8, color: '#475569', letterSpacing: '0.15em' }}>MAX</p>
                        <p className="font-digital" style={{ fontSize: 14, fontWeight: 800, color: '#22d3ee' }}>
                            {session.maxSpeed.toFixed(0)} <span style={{ fontSize: 8, color: '#475569' }}>km/h</span>
                        </p>
                    </div>
                    <div>
                        <p className="font-digital" style={{ fontSize: 8, color: '#475569', letterSpacing: '0.15em' }}>DIST</p>
                        <p className="font-digital" style={{ fontSize: 14, fontWeight: 800, color: '#f97316' }}>
                            {session.distance.toFixed(2)} <span style={{ fontSize: 8, color: '#475569' }}>km</span>
                        </p>
                    </div>
                    <div>
                        <p className="font-digital" style={{ fontSize: 8, color: '#475569', letterSpacing: '0.15em' }}>D-</p>
                        <p className="font-digital" style={{ fontSize: 14, fontWeight: 800, color: '#a78bfa' }}>
                            {Math.round(session.negativeElevation)} <span style={{ fontSize: 8, color: '#475569' }}>m</span>
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function HistoryScreen() {
    const { sessions } = useTracking();

    return (
        <div style={{
            position: 'relative', width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            background: 'radial-gradient(ellipse at 30% 0%, #0d1f3c, #020617 50%, #000510)',
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{ padding: 'max(env(safe-area-inset-top, 12px), 12px) 20px 14px 20px', flexShrink: 0 }}>
                <h2 className="font-digital" style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.2em', color: '#22d3ee' }}>
                    🏆 MY RUNS
                </h2>
                <p className="font-digital" style={{ fontSize: 10, color: '#475569', letterSpacing: '0.1em', marginTop: 3 }}>
                    {sessions.length > 0 ? `${sessions.length} sessions recorded` : 'No sessions yet'}
                </p>
            </div>

            {/* Personal Bests */}
            {sessions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        margin: '0 16px 12px', padding: 16, flexShrink: 0,
                        background: 'rgba(2,6,23,0.72)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16,
                    }}
                >
                    <p className="font-digital" style={{ fontSize: 9, color: '#475569', letterSpacing: '0.2em', marginBottom: 12, textTransform: 'uppercase' }}>
                        Personal Bests
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <Best label="Top Speed" value={Math.max(...sessions.map(s => s.maxSpeed)).toFixed(0)} unit="km/h" color="#22d3ee" />
                        <Best label="Distance" value={Math.max(...sessions.map(s => s.distance)).toFixed(1)} unit="km" color="#f97316" />
                        <Best label="D- Descent" value={Math.max(...sessions.map(s => s.negativeElevation)).toFixed(0)} unit="m" color="#a78bfa" />
                    </div>
                </motion.div>
            )}

            {/* Sessions */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', WebkitOverflowScrolling: 'touch' }}>
                {sessions.length === 0 ? (
                    <div style={{
                        background: 'rgba(2,6,23,0.72)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 16,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '60px 20px', textAlign: 'center',
                    }}>
                        <span style={{ fontSize: 48, marginBottom: 16 }}>⛷️</span>
                        <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: 15 }}>No runs yet</p>
                        <p style={{ color: '#475569', fontSize: 12, marginTop: 6 }}>Go to Live tab and start tracking!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {sessions.map((s, i) => <Session key={s.id} session={s} idx={i} />)}
                    </div>
                )}
            </div>
        </div>
    );
}
