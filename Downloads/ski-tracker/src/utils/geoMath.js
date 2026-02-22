/**
 * geoMath.js — Geospatial calculation helpers for SkiTracker
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Convert degrees to radians.
 */
function toRad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Haversine formula — great-circle distance between two GPS points.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c; // km
}

/**
 * Calculate negative elevation gained between two altitude readings.
 * Only accumulates when going downhill.
 * @param {number} prevAlt  previous altitude in meters
 * @param {number} currAlt  current altitude in meters
 * @returns {number} additional negative elevation in meters (always >= 0)
 */
export function calcNegativeElevation(prevAlt, currAlt) {
    const diff = prevAlt - currAlt;
    return diff > 0 ? diff : 0;
}

/**
 * Convert speed in m/s to km/h.
 * @param {number} mps
 * @returns {number}
 */
export function mpsToKph(mps) {
    return mps * 3.6;
}

/**
 * Format seconds as MM:SS or HH:MM:SS string.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');

    if (h > 0) {
        return `${h}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
}
