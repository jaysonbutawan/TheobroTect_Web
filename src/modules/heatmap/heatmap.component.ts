import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet.heat';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.css'
})
export class HeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  private heatmapLayer: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initMap();
    
    this.route.queryParams.subscribe(params => {
      if (params['loc'] && this.map) {
        const coords = params['loc'].split(',').map(Number);
        this.focusOnLocation(coords[0], coords[1]);
      }
    });
  }

  private initMap(): void {
  this.map = L.map('map', {
    center: [7.7512, 125.7231],
    zoom: 12,
    zoomControl: false 
  });

  // High-end minimalist tiles for that "Pro" dashboard look
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; CartoDB'
  }).addTo(this.map);

  // Mock data with a 'type' property
  const diseaseData = [
    { lat: 7.7512, lng: 125.7231, type: 'Mealybug' },
    { lat: 7.7530, lng: 125.7250, type: 'Mealybug' },
    { lat: 7.7550, lng: 125.7100, type: 'Black Pod' },
    { lat: 7.7400, lng: 125.7400, type: 'Healthy' },
    { lat: 7.7600, lng: 125.7600, type: 'Black Pod' },
  ];

  diseaseData.forEach(point => {
    // Select color based on disease type
    let markerColor = '#10b981'; // Default Green (Healthy)
    
    if (point.type === 'Mealybug') {
      markerColor = '#ef4444'; // Red
    } else if (point.type === 'Black Pod') {
      markerColor = '#facc15'; // Yellow/Gold like your reference
    }

    // Create the "Solid Dot" look
    L.circleMarker([point.lat, point.lng], {
      radius: 8,               // Size of the dot
      fillColor: markerColor,
      color: '#fff',           // White border for "pop"
      weight: 2,               // Border thickness
      opacity: 1,
      fillOpacity: 0.9         // Solid look
    })
    .addTo(this.map)
    .bindPopup(`<b class="text-slate-800">${point.type}</b>`);
  });
}

  public focusOnLocation(lat: number, lng: number): void {
  if (!this.map) return;

  // Small delay ensures the map container is ready for animation
  setTimeout(() => {
    this.map.flyTo([lat, lng], 16, { // 16 is a good "tree-level" zoom
      animate: true,
      duration: 2.0,        // Slightly longer duration makes it smoother
      easeLinearity: 0.25   // Lower value = smoother start/end
    });

    // Add the pulse marker to highlight the target
    const highlightIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-red-500 rounded-full animate-ping opacity-20"></div>
          <div class="w-8 h-8 bg-white border-4 border-red-600 rounded-full shadow-2xl relative z-10 flex items-center justify-center">
            <div class="w-3 h-3 bg-red-600 rounded-full"></div>
          </div>
        </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    L.marker([lat, lng], { icon: highlightIcon }).addTo(this.map)
      .bindPopup(`<b class="text-slate-800">Target Area</b>`)
      .openPopup();
  }, 300); // 300ms is the sweet spot for UI transitions
}

  // Recenter helper if you want to call it from a button
  recenterMap() {
    this.map.setView([7.7512, 125.7231], 11);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}