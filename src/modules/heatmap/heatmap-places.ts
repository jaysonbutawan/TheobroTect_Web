export type LatLon = [number, number];

export interface Barangay {
  name: string;
  rings: LatLon[][];
}

export interface Purok {
  name: string;
  lat: number;
  lon: number;
  /** Barangay whose outline contains the purok; null when OpenStreetMap has no outline for it. */
  barangay: string | null;
}

export interface Places {
  barangays: Barangay[];
  puroks: Purok[];
}

const EMPTY: Places = { barangays: [], puroks: [] };
let cached: Promise<Places> | undefined;

/**
 * Snapshot of OpenStreetMap barangay outlines and purok names, already limited to the area inside
 * the red boundary (public/map/places.json). Bundled because the public Overpass API is too slow
 * and rate-limited to call on every page load; re-export it when the community maps new places.
 */
export function loadPlaces(): Promise<Places> {
  cached ??= fetch('map/places.json')
    .then((res) => (res.ok ? (res.json() as Promise<Places>) : EMPTY))
    .catch(() => EMPTY);
  return cached;
}

export function inRing(lat: number, lng: number, ring: LatLon[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [aLat, aLng] = ring[i];
    const [bLat, bLng] = ring[j];
    if (aLng > lng !== bLng > lng && lat < ((bLat - aLat) * (lng - aLng)) / (bLng - aLng) + aLat) {
      inside = !inside;
    }
  }
  return inside;
}

export function inBarangay(lat: number, lng: number, barangay: Barangay): boolean {
  return barangay.rings.some((ring) => inRing(lat, lng, ring));
}

/** Puroks are single points in OpenStreetMap, so a scan belongs to the closest one. */
export function nearestPurok(lat: number, lng: number, puroks: Purok[]): Purok | undefined {
  let best: Purok | undefined;
  let bestDist = Infinity;
  for (const p of puroks) {
    const dist = (p.lat - lat) ** 2 + ((p.lon - lng) * Math.cos((lat * Math.PI) / 180)) ** 2;
    if (dist < bestDist) {
      best = p;
      bestDist = dist;
    }
  }
  return best;
}
