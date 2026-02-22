import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useTracking } from '../App';

const LiveMap = lazy(() => import('./LiveMap'));

export default function MapScreen() {
    const { coordinates, userPosition } = useTracking();

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#000' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
                <Suspense fallback={
                    <div style={{
                        width: '100%', height: '100%', background: '#000',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <MapPin size={32} color="#22d3ee" style={{ opacity: 0.4 }} />
                        </motion.div>
                    </div>
                }>
                    <LiveMap coordinates={coordinates} userPosition={userPosition} interactive={true} />
                </Suspense>
            </div>
        </div>
    );
}
