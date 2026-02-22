import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, ChevronRight } from 'lucide-react';

export default function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const t = [
            setTimeout(() => setPhase(1), 200),
            setTimeout(() => setPhase(2), 700),
            setTimeout(() => setPhase(3), 1500),
        ];
        return () => t.forEach(clearTimeout);
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#020617',
            overflow: 'hidden',
        }}>
            {/* Gradient aurora */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={phase >= 1 ? { opacity: 1 } : {}}
                transition={{ duration: 2 }}
                style={{
                    position: 'absolute', top: '-30%', left: '-20%',
                    width: '140%', height: '80%',
                    background: 'radial-gradient(ellipse at 50% 80%, rgba(34,211,238,0.08) 0%, transparent 60%), radial-gradient(ellipse at 30% 60%, rgba(14,165,233,0.06) 0%, transparent 50%)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                }}
            />

            {/* Snow particles */}
            {Array.from({ length: 25 }).map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: i % 4 === 0 ? 3 : 1.5,
                        height: i % 4 === 0 ? 3 : 1.5,
                        borderRadius: '50%',
                        background: i % 6 === 0 ? 'rgba(34,211,238,0.35)' : 'rgba(255,255,255,0.12)',
                        left: `${(i * 41 + 11) % 100}%`,
                        top: `${(i * 29 + 5) % 100}%`,
                    }}
                    animate={{
                        y: [0, -(20 + (i % 5) * 12)],
                        opacity: [0, 0.6, 0],
                    }}
                    transition={{
                        duration: 3.5 + (i % 3),
                        repeat: Infinity,
                        delay: (i * 0.25) % 3,
                        ease: 'easeOut',
                    }}
                />
            ))}

            {/* Mountain silhouette */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 1 ? { opacity: 0.06, y: 0 } : {}}
                transition={{ duration: 1.5 }}
                style={{ position: 'absolute', bottom: '12%', pointerEvents: 'none' }}
            >
                <Mountain size={280} strokeWidth={0.4} color="#22d3ee" />
            </motion.div>

            {/* Logo container */}
            <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={phase >= 1 ? { scale: 1, rotate: 0 } : {}}
                transition={{ type: 'spring', stiffness: 140, damping: 14 }}
                style={{
                    width: 96, height: 96, borderRadius: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(145deg, rgba(34,211,238,0.14), rgba(14,165,233,0.06))',
                    border: '1px solid rgba(34,211,238,0.18)',
                    boxShadow: '0 0 80px rgba(34,211,238,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
                    marginBottom: 32, position: 'relative',
                }}
            >
                <span style={{ fontSize: 46 }}>⛷️</span>
                <motion.div
                    style={{
                        position: 'absolute', inset: -10, borderRadius: 40,
                        border: '1px solid rgba(34,211,238,0.1)',
                    }}
                    animate={{ scale: [1, 1.12, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                />
            </motion.div>

            {/* Brand Name */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1, duration: 0.6 }}
                style={{ textAlign: 'center' }}
            >
                <h1 className="font-digital" style={{
                    fontSize: 'clamp(30px, 9vw, 42px)',
                    fontWeight: 900, letterSpacing: '0.15em',
                    color: '#fff', lineHeight: 1,
                }}>
                    <span style={{ color: '#22d3ee', textShadow: '0 0 25px rgba(34,211,238,0.5), 0 0 60px rgba(34,211,238,0.2)' }}>Ski</span>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300, margin: '0 2px' }}>-</span>
                    <span style={{ textShadow: '0 0 20px rgba(255,255,255,0.15)' }}>Track</span>
                </h1>
            </motion.div>

            {/* Tagline */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 1 } : {}}
                transition={{ duration: 0.5 }}
                className="font-digital"
                style={{
                    fontSize: 9, letterSpacing: '0.4em', color: '#475569',
                    marginTop: 14, textTransform: 'uppercase',
                }}
            >
                Track · Analyze · Perform
            </motion.p>

            {/* Decorative line */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={phase >= 2 ? { scaleX: 1 } : {}}
                transition={{ duration: 0.7 }}
                style={{
                    width: 50, height: 1, marginTop: 24,
                    background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)',
                }}
            />

            {/* Enter Button */}
            <AnimatePresence>
                {phase >= 3 && (
                    <motion.button
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                        onClick={onDone}
                        className="font-digital"
                        style={{
                            marginTop: 48,
                            padding: '16px 44px',
                            borderRadius: 60,
                            background: 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(34,211,238,0.04))',
                            border: '1px solid rgba(34,211,238,0.25)',
                            color: '#22d3ee',
                            fontWeight: 700, fontSize: 12, letterSpacing: '0.2em',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8,
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            boxShadow: '0 0 30px rgba(34,211,238,0.08)',
                        }}
                        whileTap={{ scale: 0.94 }}
                    >
                        GET STARTED
                        <ChevronRight size={16} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
