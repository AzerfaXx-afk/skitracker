import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTracking } from '../App';

const navItems = [
    {
        to: '/',
        label: 'Live',
        icon: (active) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#22d3ee' : '#475569'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
    },
    {
        to: '/map',
        label: 'Map',
        icon: (active) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#22d3ee' : '#475569'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
        ),
    },
    {
        to: '/history',
        label: 'History',
        icon: (active) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#22d3ee' : '#475569'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18" />
                <path d="M6 9v10c0 .6.4 1 1 1h10c.6 0 1-.4 1-1V9" />
                <path d="M12 7v13" />
                <path d="M9 21h6" />
            </svg>
        ),
    },
];

export default function Layout() {
    const location = useLocation();
    const { isTracking } = useTracking();

    return (
        <div className="relative flex flex-col" style={{ height: '100dvh', background: '#020617' }}>
            {/* ── Page content ── */}
            <div className="flex-1 relative overflow-hidden">
                <Outlet />
            </div>

            {/* ── Bottom Navigation ── */}
            <nav className="glass-nav safe-bottom relative z-40 flex items-center justify-around px-2" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className="flex flex-col items-center gap-1 py-3 px-5 min-w-[64px] relative"
                        >
                            {/* Glow dot behind active icon */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute top-2 w-10 h-10 rounded-full"
                                    style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <div className="relative z-10">
                                {item.icon(isActive)}
                            </div>
                            <span
                                className="relative z-10 text-[10px] font-semibold tracking-wider font-digital"
                                style={{ color: isActive ? '#22d3ee' : '#475569' }}
                            >
                                {item.label}
                                {item.to === '/' && isTracking && (
                                    <motion.span
                                        className="inline-block ml-1 w-1.5 h-1.5 rounded-full bg-red-500"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                    />
                                )}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}
