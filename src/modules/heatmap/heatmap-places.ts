export type LatLon = [number, number];

export interface Barangay {
  name: string;
  rings: LatLon[][];
}

export interface Purok {
  name: string;
  lat: number;
  lon: number;
  barangay: string | null;
}

export interface Places {
  barangays: Barangay[];
  puroks: Purok[];
}

const EMPTY: Places = { barangays: [], puroks: [] };
let cached: Promise<Places> | undefined;

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
