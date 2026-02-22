import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LiveScreen from './components/LiveScreen';
import MapScreen from './components/MapScreen';
import HistoryScreen from './components/HistoryScreen';
import { haversineDistance, calcNegativeElevation, mpsToKph } from './utils/geoMath';

const SPEED_THRESHOLD_KMH = 3;

// ── Context ──────────────────────────────────────────────────────
export const TrackingContext = createContext(null);
export const useTracking = () => useContext(TrackingContext);

function App() {
    // ── State ───────────────────────────────────────────────────────
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
        try { return JSON.parse(localStorage.getItem('ski_sessions') || '[]'); }
        catch { return []; }
    });

    // ── Refs ────────────────────────────────────────────────────────
    const watchIdRef = useRef(null);
    const passiveWatchRef = useRef(null);
    const wakeLockRef = useRef(null);
    const timerRef = useRef(null);
    const prevPositionRef = useRef(null);
    const maxSpeedRef = useRef(0);
    const recordFlashTimeout = useRef(null);

    // ── WakeLock ───────────────────────────────────────────────────
    const acquireWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await navigator.wakeLock.request('screen');
                wakeLockRef.current.addEventListener('release', () => { wakeLockRef.current = null; });
            } catch (e) { console.warn('WakeLock denied:', e); }
        }
    }, []);

    const releaseWakeLock = useCallback(() => {
        if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }
    }, []);

    useEffect(() => {
        const h = async () => {
            if (document.visibilityState === 'visible' && isTracking && !wakeLockRef.current) await acquireWakeLock();
        };
        document.addEventListener('visibilitychange', h);
        return () => document.removeEventListener('visibilitychange', h);
    }, [isTracking, acquireWakeLock]);

    // ── Passive GPS (always on, for background map + altitude) ────
    useEffect(() => {
        if (!navigator.geolocation) return;
        passiveWatchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, altitude: alt } = pos.coords;
                setUserPosition([latitude, longitude]);
                if (alt != null && !isTracking) setAltitude(Math.round(alt));
                if (!isTracking) setGpsStatus('ok');
            },
            () => { if (!isTracking) setGpsStatus('error'); },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );
        setGpsStatus('searching');
        return () => {
            if (passiveWatchRef.current != null) navigator.geolocation.clearWatch(passiveWatchRef.current);
        };
    }, [isTracking]);

    // ── Tracking position handler ─────────────────────────────────
    const handlePosition = useCallback((pos) => {
        setGpsStatus('ok');
        const { latitude, longitude, altitude: alt, speed } = pos.coords;
        const speedKph = speed != null && speed >= 0 ? mpsToKph(speed) : 0;
        setCurrentSpeed(speedKph);
        setUserPosition([latitude, longitude]);

        if (speedKph > maxSpeedRef.current) {
            maxSpeedRef.current = speedKph;
            setMaxSpeed(speedKph);
            if (speedKph > 5) {
                setNewRecord(true);
                if (recordFlashTimeout.current) clearTimeout(recordFlashTimeout.current);
                recordFlashTimeout.current = setTimeout(() => setNewRecord(false), 2500);
            }
        }

        if (alt != null) setAltitude(Math.round(alt));

        if (prevPositionRef.current) {
            const { lat: pLat, lon: pLon, alt: pAlt } = prevPositionRef.current;
            if (speedKph > SPEED_THRESHOLD_KMH) {
                setDistance(prev => prev + haversineDistance(pLat, pLon, latitude, longitude));
            }
            if (pAlt != null && alt != null) {
                const drop = calcNegativeElevation(pAlt, alt);
                if (drop > 0) setNegativeElevation(prev => prev + drop);
            }
        }

        setCoordinates(prev => [...prev, [latitude, longitude]]);
        prevPositionRef.current = { lat: latitude, lon: longitude, alt: alt ?? prevPositionRef.current?.alt ?? null };
    }, []);

    const handleGeoError = useCallback(() => setGpsStatus('error'), []);

    // ── Start / Stop ──────────────────────────────────────────────
    const startTracking = useCallback(async () => {
        if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
        setCurrentSpeed(0); setMaxSpeed(0); maxSpeedRef.current = 0;
        setDistance(0); setNegativeElevation(0); setCoordinates([]);
        setElapsedSeconds(0); prevPositionRef.current = null;
        setGpsStatus('searching');
        await acquireWakeLock();

        watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleGeoError, {
            enableHighAccuracy: true, maximumAge: 1000, timeout: 10000,
        });
        timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        setIsTracking(true);
    }, [acquireWakeLock, handlePosition, handleGeoError]);

    const stopTracking = useCallback(() => {
        if (watchIdRef.current != null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        releaseWakeLock();

        const session = {
            id: Date.now(), date: new Date().toISOString(),
            maxSpeed: maxSpeedRef.current, distance, negativeElevation,
            duration: elapsedSeconds, coordinates,
        };
        const updated = [session, ...sessions].slice(0, 30);
        setSessions(updated);
        localStorage.setItem('ski_sessions', JSON.stringify(updated));

        setIsTracking(false); setCurrentSpeed(0);
    }, [releaseWakeLock, distance, negativeElevation, elapsedSeconds, coordinates, sessions]);

    useEffect(() => {
        return () => {
            if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            releaseWakeLock();
        };
    }, [releaseWakeLock]);

    // ── Context value ──────────────────────────────────────────────
    const ctx = {
        isTracking, currentSpeed, maxSpeed, distance, altitude,
        negativeElevation, coordinates, elapsedSeconds, gpsStatus,
        newRecord, sessions, userPosition,
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
