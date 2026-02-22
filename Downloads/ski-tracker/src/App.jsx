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

    // Passive GPS
    useEffect(() => {
        if (!navigator.geolocation) return;
        passiveWatchRef.current = navigator.geolocation.watchPosition(
            (p) => {
                setUserPosition([p.coords.latitude, p.coords.longitude]);
                if (p.coords.altitude != null && !isTracking) setAltitude(Math.round(p.coords.altitude));
                if (!isTracking) setGpsStatus('ok');
            },
            () => { if (!isTracking) setGpsStatus('error'); },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );
        setGpsStatus('searching');
        return () => { if (passiveWatchRef.current != null) navigator.geolocation.clearWatch(passiveWatchRef.current); };
    }, [isTracking]);

    // Active tracking handler
    const handlePos = useCallback((p) => {
        setGpsStatus('ok');
        const { latitude: lat, longitude: lon, altitude: alt, speed } = p.coords;
        const spd = speed != null && speed >= 0 ? mpsToKph(speed) : 0;
        setCurrentSpeed(spd);
        setUserPosition([lat, lon]);
        if (spd > maxSpeedRef.current) {
            maxSpeedRef.current = spd;
            setMaxSpeed(spd);
            if (spd > 5) {
                setNewRecord(true);
                if (flashTimer.current) clearTimeout(flashTimer.current);
                flashTimer.current = setTimeout(() => setNewRecord(false), 2500);
            }
        }
        if (alt != null) setAltitude(Math.round(alt));
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
        if (!navigator.geolocation) return alert('GPS not supported');
        setCurrentSpeed(0); setMaxSpeed(0); maxSpeedRef.current = 0;
        setDistance(0); setNegativeElevation(0); setCoordinates([]);
        setElapsedSeconds(0); prevPosRef.current = null; setGpsStatus('searching');
        await acquireWake();
        watchIdRef.current = navigator.geolocation.watchPosition(handlePos, () => setGpsStatus('error'), {
            enableHighAccuracy: true, maximumAge: 1000, timeout: 10000,
        });
        timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        setIsTracking(true);
    }, [acquireWake, handlePos]);

    const stopTracking = useCallback(() => {
        if (watchIdRef.current != null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        releaseWake();
        const s = { id: Date.now(), date: new Date().toISOString(), maxSpeed: maxSpeedRef.current, distance, negativeElevation, duration: elapsedSeconds, coordinates };
        const updated = [s, ...sessions].slice(0, 30);
        setSessions(updated);
        localStorage.setItem('ski_sessions', JSON.stringify(updated));
        setIsTracking(false); setCurrentSpeed(0);
    }, [releaseWake, distance, negativeElevation, elapsedSeconds, coordinates, sessions]);

    useEffect(() => () => {
        if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        releaseWake();
    }, [releaseWake]);

    if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />;

    const ctx = {
        isTracking, currentSpeed, maxSpeed, distance, altitude, negativeElevation,
        coordinates, elapsedSeconds, gpsStatus, newRecord, sessions, userPosition,
        onStart: startTracking, onStop: stopTracking,
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
