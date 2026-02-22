import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Map, Trophy } from 'lucide-react';
import { useTracking } from '../App';

const tabs = [
    { to: '/', label: 'Live', Icon: Zap },
    { to: '/map', label: 'Map', Icon: Map },
    { to: '/history', label: 'History', Icon: Trophy },
];

export default function Layout() {
    const location = useLocation();
    const { isTracking } = useTracking();

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            height: '100dvh', width: '100%',
            background: '#020617',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Page Content */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
                <Outlet />
            </div>

            {/* ── Bottom Navigation ── */}
            <nav
                className="glass-nav"
                style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    paddingTop: 8,
                    paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
                    position: 'relative',
                    zIndex: 50,
                }}
            >
                {tabs.map(({ to, label, Icon }) => {
                    const active = location.pathname === to;

                    return (
                        <NavLink
                            key={to}
                            to={to}
                            style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: 4,
                                padding: '6px 24px',
                                textDecoration: 'none',
                                position: 'relative',
                                WebkitTapHighlightColor: 'transparent',
                            }}
                        >
                            {/* Active glow */}
                            {active && (
                                <motion.div
                                    layoutId="nav-active-glow"
                                    style={{
                                        position: 'absolute', top: 0,
                                        width: 48, height: 48, borderRadius: '50%',
                                        background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                                />
                            )}

                            {/* Icon */}
                            <motion.div
                                animate={{
                                    scale: active ? 1 : 0.9,
                                    y: active ? -2 : 0,
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                style={{ position: 'relative', zIndex: 2 }}
                            >
                                <Icon
                                    size={22}
                                    strokeWidth={active ? 2.5 : 1.8}
                                    color={active ? '#22d3ee' : '#475569'}
                                    style={{
                                        filter: active ? 'drop-shadow(0 0 8px rgba(34,211,238,0.5))' : 'none',
                                        transition: 'color 0.2s, filter 0.2s',
                                    }}
                                />
                            </motion.div>

                            {/* Label */}
                            <span
                                className="font-digital"
                                style={{
                                    fontSize: 9, fontWeight: active ? 700 : 500,
                                    letterSpacing: '0.15em',
                                    color: active ? '#22d3ee' : '#475569',
                                    position: 'relative', zIndex: 2,
                                    transition: 'color 0.2s',
                                    display: 'flex', alignItems: 'center', gap: 5,
                                }}
                            >
                                {label}
                                {to === '/' && isTracking && (
                                    <span style={{
                                        width: 5, height: 5, borderRadius: '50%',
                                        background: '#ef4444',
                                        animation: 'pulse-dot 0.8s infinite',
                                        boxShadow: '0 0 6px rgba(239,68,68,0.6)',
                                    }} />
                                )}
                            </span>

                            {/* Active indicator bar */}
                            {active && (
                                <motion.div
                                    layoutId="nav-active-bar"
                                    style={{
                                        position: 'absolute', bottom: -2,
                                        width: 20, height: 2, borderRadius: 2,
                                        background: '#22d3ee',
                                        boxShadow: '0 0 10px rgba(34,211,238,0.6)',
                                    }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                                />
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}
