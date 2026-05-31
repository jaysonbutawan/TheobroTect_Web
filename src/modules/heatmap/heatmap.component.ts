import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet.heat';
import { DashboardService } from '../dashboard/dashboard.service';
import { ScanDto } from '../dashboard/dashboard.dto';
import { HeatmapSkeletonComponent } from '../../app/shared/skeletons/heatmap-skeleton/heatmap-skeleton';


interface Observation {
  text: string;
  time: Date;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
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
    disease: 'all',
    zone: 'all'
  };

  // --- NEW: Selected farmer scan for right panel ---
  selectedScan: ScanDto | null = null;

  // --- Sync bar state ---
  lastSyncTime: Date = new Date();
  scanCoverage: number = 83;
  isSyncing: boolean = false;

  // --- Field observation log state ---
  newObservation: string = '';
  observations: Observation[] = [
    {
      text: 'Plot C — Unusual pod discoloration on eastern row.',
      time: new Date(Date.now() - 1000 * 60 * 88),
    }
  ];

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
          this.applyFilters();
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
      if (layer instanceof (L as any).HeatLayer || layer instanceof L.CircleMarker) {
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
    this.filters = { date: '', disease: 'all', zone: 'all' };
    this.selectedScan = null; // also clear right panel
    this.applyFilters();
  }

private plotMarkers(scans: ScanDto[]): void {
  const heatPoints: any[] = [];

  scans.forEach(scan => {
    if (!scan.location_lat || !scan.location_lng) return;

    const lat = Number(scan.location_lat);
    const lng = Number(scan.location_lng);

    const diseaseKey = (scan.disease_key || '').toLowerCase();
    const severity = (scan.severity_key || 'mild').toLowerCase();

    let intensity = 0.4;

    if (diseaseKey.includes('healthy')) {
      // Healthy: always low intensity, green gradient
      intensity = 0.3;
    } else if (diseaseKey.includes('mealybug')) {
      // Mealybug: dark blue (severe/moderate) → fade blue (mild)
      if (severity === 'severe') intensity = 1.0;
      else if (severity === 'moderate') intensity = 0.65;
      else intensity = 0.3; // mild = faded
    } else if (diseaseKey.includes('black pod') || diseaseKey.includes('blackpod')) {
      // Black pod: dark red (severe) → medium red (moderate) → light red (mild)
      if (severity === 'severe') intensity = 1.0;
      else if (severity === 'moderate') intensity = 0.65;
      else intensity = 0.3;
    } else if (diseaseKey.includes('pod borer') || diseaseKey.includes('podborer')) {
      // Pod borer: yellow
      if (severity === 'severe') intensity = 1.0;
      else if (severity === 'moderate') intensity = 0.65;
      else intensity = 0.3;
    } else {
      // Other diseases: same mealybug-style blue logic
      if (severity === 'severe') intensity = 1.0;
      else if (severity === 'moderate') intensity = 0.65;
      else intensity = 0.3;
    }

    heatPoints.push([lat, lng, intensity, diseaseKey]); // carry diseaseKey for per-layer logic
  });

  // --- Healthy layer (green) ---
  const healthyPoints = heatPoints
    .filter(p => p[2] !== undefined && (p[3] as string).includes('healthy'))
    .map(p => [p[0], p[1], p[2]]);

  if (healthyPoints.length) {
    (L as any).heatLayer(healthyPoints, {
      radius: 50,
      blur: 25,
      max: 1.0,
      minOpacity: 0.45,
      gradient: {
        0.2: '#bbf7d0',
        0.5: '#4ade80',
        0.8: '#16a34a',
        1.0: '#14532d'
      }
    }).addTo(this.map);
  }

  // --- Mealybug layer (dark blue → faded blue) ---
  const mealybugPoints = heatPoints
    .filter(p => (p[3] as string).includes('mealybug'))
    .map(p => [p[0], p[1], p[2]]);

  if (mealybugPoints.length) {
    (L as any).heatLayer(mealybugPoints, {
      radius: 50,
      blur: 25,
      max: 1.0,
      minOpacity: 0.45,
      gradient: {
        0.2: '#bfdbfe', // light blue (mild)
        0.5: '#3b82f6', // mid blue (moderate)
        0.8: '#1d4ed8', // dark blue
        1.0: '#1e3a8a'  // very dark blue (severe)
      }
    }).addTo(this.map);
  }

  // --- Black Pod layer (dark red → light red) ---
  const blackPodPoints = heatPoints
    .filter(p => (p[3] as string).includes('black pod') || (p[3] as string).includes('blackpod'))
    .map(p => [p[0], p[1], p[2]]);

  if (blackPodPoints.length) {
    (L as any).heatLayer(blackPodPoints, {
      radius: 50,
      blur: 25,
      max: 1.0,
      minOpacity: 0.45,
      gradient: {
        0.2: '#fecaca', // light red (mild)
        0.5: '#f87171', // medium red (moderate)
        0.8: '#dc2626', // red
        1.0: '#7f1d1d'  // very dark red (severe)
      }
    }).addTo(this.map);
  }

  // --- Pod Borer layer (yellow) ---
  const podBorerPoints = heatPoints
    .filter(p => (p[3] as string).includes('pod borer') || (p[3] as string).includes('podborer'))
    .map(p => [p[0], p[1], p[2]]);

  if (podBorerPoints.length) {
    (L as any).heatLayer(podBorerPoints, {
      radius: 50,
      blur: 25,
      max: 1.0,
      minOpacity: 0.45,
      gradient: {
        0.2: '#FFFBA7', // pale yellow (mild)
        0.5: '#FFEA6C', // yellow (moderate)
        0.8: '#eab308', // amber-yellow
        1.0: '#FFCC00'  // dark amber (severe)
      }
    }).addTo(this.map);
  }

  // --- Other / fallback diseases (blue, same as mealybug) ---
  const otherPoints = heatPoints
    .filter(p => {
      const d = p[3] as string;
      return !d.includes('healthy')
        && !d.includes('mealybug')
        && !d.includes('black pod')
        && !d.includes('blackpod')
        && !d.includes('pod borer')
        && !d.includes('podborer');
    })
    .map(p => [p[0], p[1], p[2]]);

  if (otherPoints.length) {
    (L as any).heatLayer(otherPoints, {
      radius: 50,
      blur: 25,
      max: 1.0,
      minOpacity: 0.45,
      gradient: {
        0.2: '#bfdbfe',
        0.5: '#3b82f6',
        0.8: '#1d4ed8',
        1.0: '#1e3a8a'
      }
    }).addTo(this.map);
  }

  // --- Plot clickable ghost markers on top of all heat layers ---
  scans.forEach(scan => {
    if (!scan.location_lat || !scan.location_lng) return;
    this.addClickableMarker(
      Number(scan.location_lat),
      Number(scan.location_lng),
      scan
    );
  });
}

  // UPDATED: replaced addInvisibleInteractionLayer — now clickable, drives right panel
  private addClickableMarker(lat: number, lng: number, scan: ScanDto): void {
    const ghostMarker = L.circleMarker([lat, lng], {
      radius: 20,
      stroke: false,
      fillColor: '#000',
      fillOpacity: 0,
    });

    ghostMarker.addTo(this.map);

    // Lightweight hover tooltip (name + disease only)
    ghostMarker.bindTooltip(`
      <div style="font-size:11px;font-weight:700;padding:2px 4px;white-space:nowrap;">
        ${scan.user_name || 'Unknown'} &nbsp;·&nbsp; ${scan.disease_key || '—'}
      </div>
    `, {
      sticky: true,
      direction: 'top',
      className: 'custom-heatmap-tooltip'
    });

    // Click: push scan to right panel via Angular state
    ghostMarker.on('click', () => {
      this.selectedScan = scan;
      this.cdr.markForCheck();
    });

    // Visual cursor hint on hover
    ghostMarker.on('mouseover', (e) => {
      (e.target as L.CircleMarker).setStyle({ fillOpacity: 0.08, fillColor: '#1e293b' });
    });
    ghostMarker.on('mouseout', (e) => {
      (e.target as L.CircleMarker).setStyle({ fillOpacity: 0 });
    });
  }

  // --- NEW: Dismiss farmer panel, return to detection legend ---
  clearSelectedScan(): void {
    this.selectedScan = null;
    this.cdr.markForCheck();
  }

  // --- Helper: severity badge Tailwind classes ---
  getSeverityClass(severity: string | undefined): string {
    const s = (severity || '').toLowerCase();
    if (s === 'severe') return 'bg-red-50 text-red-600 border-red-100';
    if (s === 'moderate') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    return 'bg-blue-50 text-blue-600 border-blue-100';
  }

  // --- Helper: generate initials from name ---
  getInitials(name: string | undefined): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }

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

  refreshSync(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.loadScans();
    setTimeout(() => {
      this.lastSyncTime = new Date();
      this.isSyncing = false;
      this.cdr.markForCheck();
    }, 1200);
  }

  addObservation(): void {
    const text = this.newObservation.trim();
    if (!text) return;
    this.observations.unshift({ text, time: new Date() });
    this.newObservation = '';
  }

  recenterMap() { this.map.setView([7.7512, 125.7231], 12); }
  goBack() { this.router.navigate(['/dashboard']); }
  ngOnDestroy() { if (this.map) this.map.remove(); }
}
