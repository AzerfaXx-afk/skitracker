import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LiveScreen from './components/LiveScreen';
import MapScreen from './components/MapScreen';
import HistoryScreen from './components/HistoryScreen';
import SplashScreen from './components/SplashScreen';
import { haversineDistance, calcNegativeElevation, mpsToKph } from './utils/geoMath';

const SPEED_THRESHOLD = 3;
export const TrackingContext = createContext(null);
export const useTracking = () => useContext(TrackingContext);

function App() {
    const [showSplash, setShowSplash] = useState(true);
    const [isTracking, setIsTracking] = useState(false);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [maxSpeed, setMaxSpeed] = useState(0);
    const [distance, setDistance] = useState(0);
    const [altitude, setAltitude] = useState(null);
    const [altitudeMax, setAltitudeMax] = useState(null);
    const [altitudeMin, setAltitudeMin] = useState(null);
    const [negativeElevation, setNegativeElevation] = useState(0);
    const [coordinates, setCoordinates] = useState([]);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [gpsStatus, setGpsStatus] = useState('idle');
    const [newRecord, setNewRecord] = useState(false);
    const [userPosition, setUserPosition] = useState(null);
    const [sessions, setSessions] = useState(() => {
        try { return JSON.parse(localStorage.getItem('ski_sessions') || '[]'); } catch { return []; }
    });

    const watchIdRef = useRef(null);
    const passiveWatchRef = useRef(null);
    const wakeLockRef = useRef(null);
    const timerRef = useRef(null);
    const prevPosRef = useRef(null);
    const maxSpeedRef = useRef(0);
    const altMaxRef = useRef(null);
    const altMinRef = useRef(null);
    const flashTimer = useRef(null);

    // WakeLock
    const acquireWake = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                wakeLockRef.current.addEventListener('release', () => { wakeLockRef.current = null; });
            } catch (e) { /* silent */ }
        }
    }, []);
    const releaseWake = useCallback(() => {
        if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }
    }, []);

    useEffect(() => {
        const h = async () => {
            if (document.visibilityState === 'visible' && isTracking && !wakeLockRef.current) await acquireWake();
        };
        document.addEventListener('visibilitychange', h);
        return () => document.removeEventListener('visibilitychange', h);
    }, [isTracking, acquireWake]);

    // ── Passive GPS — always on, feeds real-time speed + altitude + position ──
    useEffect(() => {
        if (!navigator.geolocation) return;
        passiveWatchRef.current = navigator.geolocation.watchPosition(
            (p) => {
                const { latitude, longitude, altitude: alt, speed, accuracy } = p.coords;
                // Only use fixes with reasonable accuracy (< 50m)
                if (accuracy > 100) return;
                setUserPosition([latitude, longitude]);
                setGpsStatus('ok');
                if (alt != null) setAltitude(Math.round(alt));
                // Real-time speed from device
                if (speed != null && speed >= 0) {
                    setCurrentSpeed(mpsToKph(speed));
                } else {
                    setCurrentSpeed(0);
                }
            },
            () => { setGpsStatus('error'); },
            { enableHighAccuracy: true, maximumAge: 1500, timeout: 10000 }
        );
        setGpsStatus('searching');
        return () => { if (passiveWatchRef.current != null) navigator.geolocation.clearWatch(passiveWatchRef.current); };
    }, []);

    // ── Active recording handler (only when tracking) ──
    const handlePos = useCallback((p) => {
        setGpsStatus('ok');
        const { latitude: lat, longitude: lon, altitude: alt, speed, accuracy } = p.coords;
        // Skip low-accuracy fixes
        if (accuracy > 50) return;
        const spd = speed != null && speed >= 0 ? mpsToKph(speed) : 0;
        setCurrentSpeed(spd);
        setUserPosition([lat, lon]);

        // Max speed
        if (spd > maxSpeedRef.current) {
            maxSpeedRef.current = spd;
            setMaxSpeed(spd);
            if (spd > 5) {
                setNewRecord(true);
                if (flashTimer.current) clearTimeout(flashTimer.current);
                flashTimer.current = setTimeout(() => setNewRecord(false), 2500);
            }
        }

        // Altitude + min/max
        if (alt != null) {
            const rounded = Math.round(alt);
            setAltitude(rounded);
            if (altMaxRef.current === null || rounded > altMaxRef.current) {
                altMaxRef.current = rounded;
                setAltitudeMax(rounded);
            }
            if (altMinRef.current === null || rounded < altMinRef.current) {
                altMinRef.current = rounded;
                setAltitudeMin(rounded);
            }
        }

        // Distance + elevation
        if (prevPosRef.current) {
            const pp = prevPosRef.current;
            if (spd > SPEED_THRESHOLD) setDistance(d => d + haversineDistance(pp.lat, pp.lon, lat, lon));
            if (pp.alt != null && alt != null) {
                const drop = calcNegativeElevation(pp.alt, alt);
                if (drop > 0) setNegativeElevation(ne => ne + drop);
            }
        }
        setCoordinates(c => [...c, [lat, lon]]);
        prevPosRef.current = { lat, lon, alt: alt ?? prevPosRef.current?.alt ?? null };
    }, []);

    const startTracking = useCallback(async () => {
        if (!navigator.geolocation) return alert('GPS non supporté');
        setMaxSpeed(0); maxSpeedRef.current = 0;
        setDistance(0); setNegativeElevation(0); setCoordinates([]);
        setElapsedSeconds(0); prevPosRef.current = null; setGpsStatus('searching');
        setAltitudeMax(null); setAltitudeMin(null);
        altMaxRef.current = null; altMinRef.current = null;
        await acquireWake();
        watchIdRef.current = navigator.geolocation.watchPosition(handlePos, () => setGpsStatus('error'), {
            enableHighAccuracy: true, maximumAge: 800, timeout: 8000,
        });
        timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        setIsTracking(true);
    }, [acquireWake, handlePos]);

    const stopTracking = useCallback(() => {
        if (watchIdRef.current != null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        releaseWake();
        const s = {
            id: Date.now(), date: new Date().toISOString(),
            maxSpeed: maxSpeedRef.current, distance, negativeElevation,
            duration: elapsedSeconds, coordinates,
            altitudeMax: altMaxRef.current, altitudeMin: altMinRef.current,
        };
        const updated = [s, ...sessions].slice(0, 50);
        setSessions(updated);
        localStorage.setItem('ski_sessions', JSON.stringify(updated));
        setIsTracking(false);
    }, [releaseWake, distance, negativeElevation, elapsedSeconds, coordinates, sessions]);

    // Delete functions
    const deleteSession = useCallback((sessionId) => {
        const updated = sessions.filter(s => s.id !== sessionId);
        setSessions(updated);
        localStorage.setItem('ski_sessions', JSON.stringify(updated));
    }, [sessions]);

    const deleteDaySessions = useCallback((dayKey) => {
        const updated = sessions.filter(s => {
            const d = new Date(s.id);
            const key = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
            return key !== dayKey;
        });
        setSessions(updated);
        localStorage.setItem('ski_sessions', JSON.stringify(updated));
    }, [sessions]);

    useEffect(() => () => {
        if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        releaseWake();
    }, [releaseWake]);

    if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;

    const ctx = {
        isTracking, currentSpeed, maxSpeed, distance, altitude,
        altitudeMax, altitudeMin,
        negativeElevation, coordinates, elapsedSeconds, gpsStatus,
        newRecord, sessions, userPosition,
        onStart: startTracking, onStop: stopTracking,
        deleteSession, deleteDaySessions,
    };

    return (
        <TrackingContext.Provider value={ctx}>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<LiveScreen />} />
                        <Route path="/map" element={<MapScreen />} />
                        <Route path="/history" element={<HistoryScreen />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </TrackingContext.Provider>
    );
}

export default App;
