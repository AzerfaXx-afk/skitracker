import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, Zap } from 'lucide-react';

export default function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase(1), 300),
            setTimeout(() => setPhase(2), 900),
            setTimeout(() => setPhase(3), 1800),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 20%, #0c2135 0%, #020617 55%, #000510 100%)',
            overflow: 'hidden',
        }}>
            {/* Floating snow particles */}
            {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: i % 3 === 0 ? 3 : 2,
                        height: i % 3 === 0 ? 3 : 2,
                        borderRadius: '50%',
                        background: i % 5 === 0 ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.15)',
                        left: `${(i * 37 + 13) % 100}%`,
                        top: `${(i * 23 + 7) % 100}%`,
                    }}
                    animate={{
                        y: [0, -(30 + (i % 4) * 15)],
                        x: [0, (i % 2 === 0 ? 10 : -10)],
                        opacity: [0, 0.7, 0],
                    }}
                    transition={{
                        duration: 3 + (i % 3),
                        repeat: Infinity,
                        delay: (i * 0.2) % 3,
                        ease: 'easeOut',
                    }}
                />
            ))}

            {/* Mountain silhouette */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={phase >= 1 ? { opacity: 0.1 } : {}}
                transition={{ duration: 1.5 }}
                style={{ position: 'absolute', bottom: '10%', pointerEvents: 'none' }}
            >
                <Mountain size={300} strokeWidth={0.5} color="#22d3ee" />
            </motion.div>

            {/* Logo icon */}
            <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={phase >= 1 ? { scale: 1, rotate: 0 } : {}}
                transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                style={{
                    width: 100, height: 100, borderRadius: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.18), rgba(14,165,233,0.08))',
                    border: '1.5px solid rgba(34,211,238,0.25)',
                    boxShadow: '0 0 80px rgba(34,211,238,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                    marginBottom: 28,
                    position: 'relative',
                }}
            >
                <span style={{ fontSize: 48 }}>⛷️</span>
                {/* Glow ring */}
                <motion.div
                    style={{
                        position: 'absolute', inset: -8, borderRadius: 36,
                        border: '1px solid rgba(34,211,238,0.15)',
                    }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            </motion.div>

            {/* Title */}
            <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
                className="font-digital glow-text-cyan"
                style={{
                    fontSize: 'clamp(26px, 7vw, 36px)',
                    fontWeight: 900,
                    letterSpacing: '0.25em',
                    color: '#cffafe',
                }}
            >
                SKITRACKER
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 1 } : {}}
                transition={{ duration: 0.6 }}
                className="font-digital"
                style={{
                    fontSize: 10,
                    letterSpacing: '0.35em',
                    color: '#475569',
                    marginTop: 10,
                }}
            >
                PERFORMANCE TRACKING
            </motion.p>

            {/* Decorative line */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={phase >= 2 ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                    width: 60, height: 1, marginTop: 20,
                    background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
                }}
            />

            {/* Enter Button */}
            <AnimatePresence>
                {phase >= 3 && (
                    <motion.button
                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        onClick={onDone}
                        className="font-digital"
                        style={{
                            marginTop: 50,
                            padding: '18px 52px',
                            borderRadius: 60,
                            background: 'linear-gradient(135deg, #0e7490, #22d3ee)',
                            border: 'none',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: 13,
                            letterSpacing: '0.2em',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                        whileTap={{ scale: 0.93 }}
                    >
                        {/* Shimmer */}
                        <motion.div
                            style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                                backgroundSize: '200% 100%',
                            }}
                            animate={{ backgroundPosition: ['200% center', '-200% center'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                        />
                        <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Zap size={16} />
                            ENTER
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Version tag */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 0.25 } : {}}
                className="font-digital"
                style={{
                    position: 'absolute', bottom: 32,
                    fontSize: 9, color: '#475569', letterSpacing: '0.15em',
                }}
            >
                v1.0 — BETA
            </motion.p>
        </div>
    );
}
