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

  ngOnInit() {
    // Initialization logic here
  }

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
      center: [7.4477, 125.8093],
      zoom: 12,
      zoomControl: false 
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const points: [number, number, number][] = [
      [7.4477, 125.8093, 0.9],
      [7.3077, 125.6839, 0.6],
      [7.2833, 125.8500, 0.7],
      [7.4200, 125.7900, 0.8]
    ];

    this.heatmapLayer = (L as any).heatLayer(points, {
      radius: 35,
      blur: 20,
      maxZoom: 17,
      gradient: { 0.4: '#3b82f6', 0.6: '#a3e635', 1: '#ef4444' }
    }).addTo(this.map);
  }

  private focusOnLocation(lat: number, lng: number): void {
    if (!this.map) return;
    this.map.flyTo([lat, lng], 15, { animate: true, duration: 2.5 });

    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="relative flex items-center justify-center">
               <div class="absolute w-8 h-8 bg-green-500 rounded-full animate-ping opacity-25"></div>
               <div class="w-6 h-6 bg-green-600 border-4 border-white rounded-full shadow-lg relative z-10"></div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(this.map)
      .bindPopup(`<div class="p-1"><b class="text-slate-800">Detection Zone</b></div>`)
      .openPopup();
  }

  // THIS IS THE MISSING METHOD CAUSING THE ERROR
  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}