import { Injectable } from '@angular/core';
import * as maplibregl from 'maplibre-gl';

@Injectable({
  providedIn: 'root' // Makes the service available everywhere
})
export class MapService {
  private map!: maplibregl.Map;

  // ⚠️ CRITICAL CHANGE: Flipped from [Lat, Lng] to [Lng, Lat] for WebGL compliance
  private readonly DEFAULT_CENTER: [number, number] = [125.8094, 7.4478]; // Tagum City

  constructor() {}

  /**
   * Initializes the map on a specific HTML element ID
   */
  initMap(elementId: string, center = this.DEFAULT_CENTER, zoom = 13): maplibregl.Map {
    this.map = new maplibregl.Map({
      container: elementId,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: center,
      zoom: zoom,
      pitch: 45, // Gives global maps a subtle 3D tilt out of the box
      bearing: 0
    });

    return this.map;
  }

  /**
   * Adds a standardized "Hotspot" marker to the map using HTML elements
   */
  addHotspot(lat: number, lng: number, color: 'red' | 'orange' | 'purple' = 'red'): void {
    // 1. Create a native DOM element for MapLibre to use as the marker icon
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-4 h-4 bg-${color}-500 rounded-full animate-ping opacity-75"></div>
        <div class="relative w-3 h-3 bg-${color}-600 rounded-full border-2 border-white"></div>
      </div>
    `;

    // 2. Instantiate the MapLibre Marker and pair it with [Lng, Lat] coordinates
    new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat]) // Passed as [Lng, Lat]
      .addTo(this.map);
  }
}
