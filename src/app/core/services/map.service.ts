import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root' // Makes the service available everywhere
})
export class MapService {
  private map!: L.Map;

  // Configuration Constants
  private readonly DEFAULT_CENTER: L.LatLngExpression = [7.4478, 125.8094]; // Tagum City
  private readonly OSM_TILE_LAYER = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  constructor() {}

  /**
   * Initializes the map on a specific HTML element ID
   */
  initMap(elementId: string, center = this.DEFAULT_CENTER, zoom = 13): L.Map {
    this.map = L.map(elementId, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      attributionControl: false // Cleaner for Dashboards
    });

    L.tileLayer(this.OSM_TILE_LAYER, {
      maxZoom: 19,
    }).addTo(this.map);

    return this.map;
  }

  /**
   * Adds a standardized "Hotspot" marker to the map
   */
  addHotspot(lat: number, lng: number, color: 'red' | 'orange' | 'purple' = 'red'): void {
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-4 h-4 bg-${color}-500 rounded-full animate-ping opacity-75"></div>
          <div class="relative w-3 h-3 bg-${color}-600 rounded-full border-2 border-white"></div>
        </div>`,
      iconSize: [20, 20]
    });

    L.marker([lat, lng], { icon }).addTo(this.map);
  }
}