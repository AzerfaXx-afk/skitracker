import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTracking } from '../App';

const NAV_ITEMS = [
    { to: '/', label: 'Live', emoji: '⚡' },
    { to: '/map', label: 'Map', emoji: '🗺️' },
    { to: '/history', label: 'History', emoji: '🏆' },
];

export default function Layout() {
    const { isTracking } = useTracking();
    const location = useLocation();

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            height: '100dvh', width: '100%',
            background: '#020617',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Page content */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
                <Outlet />
            </div>

            {/* Bottom Nav */}
            <nav style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                background: 'rgba(2, 6, 23, 0.85)',
                backdropFilter: 'blur(30px) saturate(180%)',
                WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: 6,
                paddingBottom: `max(env(safe-area-inset-bottom, 0px), 10px)`,
                position: 'relative', zIndex: 50,
            }}>
                {NAV_ITEMS.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                                padding: '8px 20px', textDecoration: 'none',
                                position: 'relative',
                            }}
                        >
                            {/* Glow behind active */}
                            {active && (
                                <motion.div
                                    layoutId="nav-glow"
                                    style={{
                                        position: 'absolute', top: 2,
                                        width: 44, height: 44, borderRadius: '50%',
                                        background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span style={{ fontSize: 20, position: 'relative', zIndex: 2 }}>{item.emoji}</span>
                            <span className="font-digital" style={{
                                fontSize: 9, fontWeight: 600, letterSpacing: '0.15em',
                                color: active ? '#22d3ee' : '#475569',
                                position: 'relative', zIndex: 2,
                                display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                                {item.label}
                                {item.to === '/' && isTracking && (
                                    <span style={{
                                        width: 5, height: 5, borderRadius: '50%',
                                        background: '#ef4444',
                                        animation: 'pulse-dot 0.8s infinite',
                                    }} />
                                )}
                            </span>
                            {/* Active bar */}
                            {active && (
                                <motion.div
                                    layoutId="nav-bar"
                                    style={{
                                        position: 'absolute', bottom: 0,
                                        width: 24, height: 2, borderRadius: 2,
                                        background: '#22d3ee',
                                        boxShadow: '0 0 8px rgba(34,211,238,0.5)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}
