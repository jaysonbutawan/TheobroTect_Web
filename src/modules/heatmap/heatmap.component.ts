import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import 'leaflet.heat';
import { DashboardService } from '../dashboard/dashboard.service';
import { ScanDto } from '../dashboard/dashboard.dto';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.css'
})
export class HeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;

  // State management
  isLoading = false;
  errorMessage = '';

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService // Inject the service
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  ngAfterViewInit() {
    this.initMap();

    // Fetch real data from the backend AFTER the map is initialized
    this.loadScans();

    // Handle incoming coordinates from the dashboard table click
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

    // High-end minimalist tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB'
    }).addTo(this.map);
  }

  /**
   * Fetch data from the backend
   */
  loadScans(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.dashboardService.getUsersScan().subscribe({
      next: (res) => {
        // Pass the backend data to our drawing method
        if (res.data && res.data.length > 0) {
          this.plotMarkers(res.data);
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load scans:', err);
        this.errorMessage = 'Failed to load scans data';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Draw markers on the map based on backend data
   */
  private plotMarkers(scans: ScanDto[]): void {
    scans.forEach(scan => {
      // Ensure we have valid coordinates
      if (!scan.location_lat || !scan.location_lng) return;

      const lat = Number(scan.location_lat);
      const lng = Number(scan.location_lng);
      const type = (scan.disease_key || 'Healthy').toLowerCase();

      let markerColor = '#10b981'; // Default Green (Healthy)

      if (type.includes('mealybug')) {
        markerColor = '#f97316'; // Orange
      }
      else if (type.includes('black pod') || type.includes('black_pod_disease')) {
        markerColor = '#ef4444'; // Red
      }
      else if (type.includes('healthy')) {
        markerColor = '#10b981'; // Green
      }
      else if (type.includes('pod borer') || type.includes('cacao_pod_borer')) {
        markerColor = '#facc15'; // Yellow
      }

      // Format a nice display name for the popup
      const displayType = scan.disease_key || 'Healthy';
      const farmerName = scan.user_name || 'Unknown Farmer';

      L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: markerColor,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      })
      .addTo(this.map)
      .bindPopup(`
        <div class="text-sm">
          <b class="text-slate-800 block mb-1">${displayType}</b>
          <span class="text-slate-500 text-xs">Farmer: ${farmerName}</span>
        </div>
      `);
    });
  }

  public focusOnLocation(lat: number, lng: number): void {
    if (!this.map) return;

    setTimeout(() => {
      this.map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 2.0,
        easeLinearity: 0.25
      });

      const highlightIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 bg-green-500 rounded-full animate-ping opacity-20"></div>
            <div class="w-8 h-8 bg-white border-4 border-green-600 rounded-full shadow-2xl relative z-10 flex items-center justify-center">
              <div class="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
          </div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      L.marker([lat, lng], { icon: highlightIcon }).addTo(this.map)
        .bindPopup(`<b class="text-slate-800">Target Area</b>`)
        .openPopup();
    }, 300);
  }

  recenterMap() {
    this.map.setView([7.7512, 125.7231], 11);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
