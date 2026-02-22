import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 400);
        const t2 = setTimeout(() => setPhase(2), 1200);
        const t3 = setTimeout(() => setPhase(3), 2200);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    return (
        <motion.div
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: 'radial-gradient(ellipse at 50% 30%, #0c1929 0%, #020617 60%, #000 100%)',
                overflow: 'hidden',
            }}
        >
            {/* Background particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        width: 2, height: 2, borderRadius: '50%',
                        background: 'rgba(34,211,238,0.3)',
                        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                    }}
                    animate={{ opacity: [0, 0.8, 0], y: [0, -60] }}
                    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                />
            ))}

            {/* Logo icon */}
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={phase >= 1 ? { scale: 1, rotate: 0 } : {}}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                style={{
                    width: 90, height: 90, borderRadius: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(14,165,233,0.1))',
                    border: '1.5px solid rgba(34,211,238,0.3)',
                    boxShadow: '0 0 60px rgba(34,211,238,0.15)',
                    marginBottom: 24,
                }}
            >
                <span style={{ fontSize: 44 }}>⛷️</span>
            </motion.div>

            {/* Title */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="font-digital"
                style={{
                    fontSize: 28, fontWeight: 900, letterSpacing: '0.25em',
                    color: '#cffafe',
                    textShadow: '0 0 30px rgba(34,211,238,0.5), 0 0 60px rgba(34,211,238,0.2)',
                }}
            >
                SKITRACKER
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 1 } : {}}
                className="font-digital"
                style={{ fontSize: 10, letterSpacing: '0.3em', color: '#64748b', marginTop: 8 }}
            >
                PRO PERFORMANCE TRACKER
            </motion.p>

            {/* Enter button */}
            <AnimatePresence>
                {phase >= 3 && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onClick={onDone}
                        className="font-digital"
                        style={{
                            marginTop: 50, padding: '16px 48px', borderRadius: 50,
                            background: 'linear-gradient(135deg, #0e7490, #22d3ee)',
                            border: 'none',
                            boxShadow: '0 0 40px rgba(34,211,238,0.4), 0 0 80px rgba(34,211,238,0.1)',
                            color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.2em',
                            cursor: 'pointer',
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ENTER
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Version */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={phase >= 2 ? { opacity: 0.3 } : {}}
                style={{ position: 'absolute', bottom: 30, fontSize: 10, color: '#475569', letterSpacing: '0.1em' }}
                className="font-digital"
            >
                v1.0.0
            </motion.p>
        </motion.div>
    );
}
