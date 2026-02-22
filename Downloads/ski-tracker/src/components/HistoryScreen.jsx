import { motion } from 'framer-motion';
import { useTracking } from '../App';
import { formatDuration } from '../utils/geoMath';

export default function HistoryScreen() {
    const { sessions } = useTracking();

    return (
        <div
            className="relative w-full h-full flex flex-col overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at 30% 0%, #0d1f3c 0%, #020617 50%, #000510 100%)' }}
        >
            {/* Header */}
            <div className="safe-top px-5 pt-4 pb-3 flex-shrink-0">
                <h2 className="font-digital font-bold text-[15px] tracking-[0.2em] text-cyan-300">
                    🏆 MY RUNS
                </h2>
                <p className="text-[10px] text-slate-500 font-digital tracking-wider mt-0.5">
                    {sessions.length > 0 ? `${sessions.length} sessions recorded` : 'No sessions yet'}
                </p>
            </div>

            {/* Personal Bests */}
            {sessions.length > 0 && (
                <motion.div
                    className="mx-5 mb-3 flex-shrink-0 glass-strong p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <p className="text-[9px] tracking-[0.2em] text-slate-500 font-digital uppercase mb-3">
                        Personal Bests
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                        <BestStat
                            label="Top Speed"
                            value={Math.max(...sessions.map(s => s.maxSpeed)).toFixed(0)}
                            unit="km/h"
                            color="#22d3ee"
                        />
                        <BestStat
                            label="Distance"
                            value={Math.max(...sessions.map(s => s.distance)).toFixed(1)}
                            unit="km"
                            color="#f97316"
                        />
                        <BestStat
                            label="D- Descent"
                            value={Math.max(...sessions.map(s => s.negativeElevation)).toFixed(0)}
                            unit="m"
                            color="#a78bfa"
                        />
                    </div>
                </motion.div>
            )}

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                {sessions.length === 0 ? (
                    <div className="glass-strong flex flex-col items-center justify-center py-20 text-center">
                        <span className="text-5xl mb-4">⛷️</span>
                        <p className="text-slate-300 font-medium text-sm">No runs yet</p>
                        <p className="text-slate-600 text-xs mt-1">Go to the Live tab and start tracking!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {sessions.map((session, i) => (
                            <SessionCard key={session.id} session={session} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function BestStat({ label, value, unit, color }) {
    return (
        <div>
            <p className="text-[8px] text-slate-600 font-digital uppercase tracking-wider">{label}</p>
            <p className="font-digital font-black text-lg mt-0.5" style={{ color, textShadow: `0 0 12px ${color}55` }}>
                {value}
                <span className="text-[9px] text-slate-500 ml-0.5">{unit}</span>
            </p>
        </div>
    );
}

function SessionCard({ session, index }) {
    const date = new Date(session.id);
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
        <motion.div
            className="glass-strong p-4 flex gap-3"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
        >
            {/* Rank badge */}
            <div
                className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                    background: index === 0 ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.04)',
                    border: index === 0 ? '1px solid rgba(34,211,238,0.25)' : '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <span className="font-digital font-bold text-xs" style={{ color: index === 0 ? '#22d3ee' : '#475569' }}>
                    #{index + 1}
                </span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium text-sm">{dateStr}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px] font-digital">{timeStr}</span>
                        <span className="text-slate-600 text-[10px] font-digital">{formatDuration(session.duration)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <p className="text-[8px] tracking-widest text-slate-600 font-digital uppercase">Max</p>
                        <p className="text-cyan-400 font-digital font-bold text-sm">
                            {session.maxSpeed.toFixed(0)} <span className="text-[8px] text-slate-600">km/h</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-[8px] tracking-widest text-slate-600 font-digital uppercase">Dist</p>
                        <p className="text-orange-400 font-digital font-bold text-sm">
                            {session.distance.toFixed(2)} <span className="text-[8px] text-slate-600">km</span>
                        </p>
                    </div>
                    <div>
                        <p className="text-[8px] tracking-widest text-slate-600 font-digital uppercase">D-</p>
                        <p className="text-purple-400 font-digital font-bold text-sm">
                            {Math.round(session.negativeElevation)} <span className="text-[8px] text-slate-600">m</span>
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
