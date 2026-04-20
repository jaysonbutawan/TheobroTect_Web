import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Ensure this is imported for ngModel
import * as L from 'leaflet';
import 'leaflet.heat';
import { DashboardService } from '../dashboard/dashboard.service';
import { ScanDto } from '../dashboard/dashboard.dto';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.css'
})
export class HeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  private heatLayer: any;

  // State management
  isLoading = false;
  errorMessage = '';

  // Filter Management
  allScans: ScanDto[] = []; 
  filters = {
    date: '',
    disease: 'all'
  };

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService 
  ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  ngAfterViewInit() {
    this.initMap();
    this.loadScans();

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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB'
    }).addTo(this.map);
  }

  loadScans(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.dashboardService.getUsersScan().subscribe({
      next: (res) => {
        if (res.data) {
          this.allScans = res.data;
          this.applyFilters(); // Initial plot
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
   * Filter logic - Cleans map and re-plots
   */
  applyFilters(): void {
    // 1. Remove existing layers to prevent stacking
    this.map.eachLayer((layer) => {
      // Remove heat layers and our ghost markers
      if (layer instanceof (L as any).HeatLayer || layer instanceof L.CircleMarker) {
        // Safety check: Don't remove the highlight focus icon if it exists
        if (!layer.getPopup()?.getContent()?.toString().includes('Target Area')) {
          this.map.removeLayer(layer);
        }
      }
    });

    // 2. Filter the local data
    const filteredData = this.allScans.filter(scan => {
      const matchesDate = !this.filters.date || scan.created_at?.includes(this.filters.date);
      const matchesDisease = this.filters.disease === 'all' || 
                             scan.disease_key?.toLowerCase().includes(this.filters.disease.toLowerCase());
      return matchesDate && matchesDisease;
    });

    // 3. Plot the filtered results
    this.plotMarkers(filteredData);
  }

  resetFilters(): void {
    this.filters = { date: '', disease: 'all' };
    this.applyFilters();
  }

  private plotMarkers(scans: ScanDto[]): void {
    const heatPoints: any[] = [];

    scans.forEach(scan => {
      if (!scan.location_lat || !scan.location_lng) return;

      const lat = Number(scan.location_lat);
      const lng = Number(scan.location_lng);

      let intensity = 0.4;
      const severity = (scan.severity_key || 'mild').toLowerCase();

      if (severity === 'severe') intensity = 1.0;
      else if (severity === 'moderate') intensity = 0.7;
      else intensity = 0.4;

      heatPoints.push([lat, lng, intensity]);
      
      // Add hoverable interaction layer
      this.addInvisibleInteractionLayer(lat, lng, scan);
    });

    // Plotting the Heat with increased visibility
    (L as any).heatLayer(heatPoints, {
      radius: 50,      // Larger radius for better visibility
      blur: 25,        // Smooth "cloud" edges
      max: 1.0,        // Force 1.0 intensity to be Red
      minOpacity: 0.5, // Ensure mild cases are visible
      gradient: {
        0.2: '#3b82f6', // Blue
        0.4: '#10b981', // Green
        0.6: '#facc15', // Yellow
        0.8: '#f97316', // Orange
        1.0: '#ef4444'  // Red
      }
    }).addTo(this.map);
  }

  private addInvisibleInteractionLayer(lat: number, lng: number, scan: ScanDto) {
    const ghostMarker = L.circleMarker([lat, lng], {
      radius: 20,
      stroke: false,
      fillOpacity: 0 
    });

    const popupContent = `
      <div class="p-3 min-w-[180px]">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black">
            ${scan.user_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Farmer Profile</p>
            <p class="text-sm font-black text-slate-900 leading-none">${scan.user_name || 'Anonymous'}</p>
          </div>
        </div>
        <div class="space-y-1.5 border-t border-slate-100 pt-3">
          <div class="flex justify-between items-center">
            <span class="text-[11px] text-slate-500 font-medium">Disease:</span>
            <span class="text-[11px] font-bold text-slate-800">${scan.disease_key}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[11px] text-slate-500 font-medium">Severity:</span>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${scan.severity_key === 'Severe' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}">
              ${scan.severity_key || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    `;

    ghostMarker.addTo(this.map).bindPopup(popupContent, {
      className: 'custom-heatmap-popup',
      closeButton: false,
      offset: [0, -10]
    });

    ghostMarker.on('mouseover', (e) => e.target.openPopup());
    ghostMarker.on('mouseout', (e) => e.target.closePopup());
  }

  // ... (recenterMap, goBack, focusOnLocation, ngOnDestroy remain unchanged)

  public focusOnLocation(lat: number, lng: number): void {
    if (!this.map) return;
    setTimeout(() => {
      this.map.flyTo([lat, lng], 16, { animate: true, duration: 2.0 });
      const highlightIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-12 h-12 bg-green-500 rounded-full animate-ping opacity-20"></div>
                 <div class="w-8 h-8 bg-white border-4 border-green-600 rounded-full shadow-2xl relative z-10"></div>
               </div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });
      L.marker([lat, lng], { icon: highlightIcon }).addTo(this.map)
        .bindPopup(`<b class="text-slate-800">Target Area</b>`).openPopup();
    }, 300);
  }

  recenterMap() { this.map.setView([7.7512, 125.7231], 12); }
  goBack() { this.router.navigate(['/dashboard']); }
  ngOnDestroy() { if (this.map) this.map.remove(); }
}