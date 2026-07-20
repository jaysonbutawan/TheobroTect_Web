import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root' // Makes the service available everywhere
})
export class MapService {
  private map!: L.Map;

  // Default center coordinates for Tagum City [Lat, Lng]
  private readonly DEFAULT_CENTER: L.LatLngTuple = [7.4478, 125.8094]; // Tagum City

  constructor() {}

  /**
   * Initializes the map on a specific HTML element ID
   */
  initMap(elementId: string, center = this.DEFAULT_CENTER, zoom = 13): L.Map {
    // Initialize Leaflet map
    this.map = L.map(elementId, {
      center: center,
      zoom: zoom,
      zoomControl: true
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    return this.map;
  }

  /**
   * Adds a standardized "Hotspot" marker to the map
   */
  addHotspot(lat: number, lng: number, color: 'red' | 'orange' | 'purple' = 'red'): L.Marker {
    const colorMap = {
      red: '#ef4444',
      orange: '#f97316',
      purple: '#a855f7'
    };

    const markerColor = colorMap[color];

    // Create custom div icon with pulsing animation
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-4 h-4 rounded-full animate-ping opacity-75" style="background-color: ${markerColor}"></div>
          <div class="relative w-3 h-3 rounded-full border-2 border-white" style="background-color: ${markerColor}"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    // Create and add marker to map
    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);

    return marker;
  }

  /**
   * Add a standard marker at specified coordinates
   */
  addMarker(lat: number, lng: number, options?: L.MarkerOptions): L.Marker {
    const marker = L.marker([lat, lng], options).addTo(this.map);
    return marker;
  }

  /**
   * Set map view to specific coordinates
   */
  setView(lat: number, lng: number, zoom?: number): void {
    if (this.map) {
      this.map.setView([lat, lng], zoom || this.map.getZoom());
    }
  }

  /**
   * Fly to specific coordinates with animation
   */
  flyTo(lat: number, lng: number, zoom?: number): void {
    if (this.map) {
      this.map.flyTo([lat, lng], zoom || this.map.getZoom(), {
        animate: true,
        duration: 2.0
      });
    }
  }

  /**
   * Get the map instance
   */
  getMap(): L.Map | undefined {
    return this.map;
  }

  /**
   * Destroy the map instance
   */
  destroyMap(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
