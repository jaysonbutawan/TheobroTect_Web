import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import 'leaflet.heat';
import { DashboardService } from '../dashboard/dashboard.service';
import { ScanDto } from '../dashboard/dashboard.dto';
import { HeatmapSkeletonComponent } from '../../app/shared/skeletons/heatmap-skeleton/heatmap-skeleton';
// Import the component and its exported interface
import { FilterBarComponent, FilterState } from './widgets/filter-bar.component';

interface Observation {
  text: string;
  time: Date;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, FilterBarComponent],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.css'
})
export class HeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  isLoading = false;
  errorMessage = '';
  allScans: ScanDto[] = [];

  private readonly now = new Date();

  activeFilter: FilterState = {
    year: this.now.getFullYear(),
    month: this.now.getMonth(),
    disease: 'all'
  };
  selectedScan: ScanDto | null = null;

  lastSyncTime: Date = new Date();
  scanCoverage: number = 83;
  isSyncing: boolean = false;

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

    // Push the state changes to the next macro-task cycle
    setTimeout(() => {
      this.loadScans();
    }, 0);

    this.route.queryParams.subscribe(params => {
      if (params['loc'] && this.map) {
        const coords = params['loc'].split(',').map(Number);
        this.focusOnLocation(coords[0], coords[1]);
      }
    });
  }

  private initMap(): void {
    // 1. Define your base styles
    const cleanView = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB'
    });

    const detailedTerrain = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    });

    // 2. Initialize map with the detailed terrain view by default
    this.map = L.map('map', {
      center: [7.7512, 125.7231],
      zoom: 12,
      zoomControl: false,
      layers: [detailedTerrain] // Default layer
    });

    // 3. Create a toggle control menu
    const baseMaps = {
      "Detailed Terrain": detailedTerrain,
      "Clean View": cleanView
    };

    // Adds a tiny control button to the map interface
    L.control.layers(baseMaps, {}, { position: 'bottomleft' }).addTo(this.map);

    // Render your Sawata boundary lines
    this.drawBoundary();
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


  onFilterChange(filter: FilterState): void {
    this.activeFilter = filter;
    this.applyFilters();
  }
  private drawBoundary(): void {
    const boundaryCoords: L.LatLngTuple[] = [
      [7.806560861082189, 125.63986102045375],
      [7.7956762095560865, 125.63196459707926],
      [7.794995909431882, 125.66320696782175],
      [7.741929100320352, 125.64020434320918],
      [7.743630063488939, 125.68655291518975],
      [7.722537635330425, 125.67693987803823],
      [7.68608165649672, 125.68385925522492],
      [7.671187109483628, 125.70077199774289],
      [7.680133924592561, 125.7221384442543],
      [7.66464738677233, 125.72361706165712],
      [7.6526771983407205, 125.74031302153712],
      [7.652043473116281, 125.7484123382937],
      [7.683939805531676, 125.76134282642398],
      [7.682813265212966, 125.77782564636436],
      [7.691332653669563, 125.78493031018593],
      [7.7033721590568724, 125.77945971904207],
      [7.70808359287765, 125.77164314928795],
      [7.727444436605209, 125.76759349090968],
      [7.741435502048624, 125.75246835983998],
      [7.752139988193796, 125.73589958976596],
      [7.763325284000295, 125.72782762483625],
      [7.811671196718009, 125.72624964672997],
      [7.827604881331258, 125.70919534486183],
      [7.823215663004752, 125.70694976062417],
      [7.830551043241702, 125.69462939311539],
      [7.842360795049566, 125.66801254185408],
      [7.823328174293252, 125.63906132053842],
      [7.808920959985727, 125.64199646739989]
    ];

    // 1. Bottom Layer: Solid Red Line
    L.polygon(boundaryCoords, {
      color: '#dc2626',   // Deep red color
      weight: 5,          // Thickness of the line
      fillColor: '#000',  // Optional: darken the inside slightly
      fillOpacity: 0.05,  // Very subtle inner fill
      interactive: false  // Prevent it from blocking clicks on your markers
    }).addTo(this.map);
    L.polygon(boundaryCoords, {
      color: '#ffffff',   // White color
      weight: 5,          // Same thickness
      dashArray: '10, 15', // 10px line, 15px gap
      fill: false,        // No fill on the top layer
      interactive: false
    }).addTo(this.map);
  }

  applyFilters(): void {
    if (!this.map) {
      console.warn('⚠️ [HeatmapFilter] Map is not initialized yet. Skipping filter application.');
      return;
    }

    // 1. Clear previous map layers
    this.map.eachLayer((layer) => {
      if (
        layer instanceof (L as any).HeatLayer ||
        layer instanceof L.CircleMarker
      ) {
        if (!layer.getPopup()?.getContent()?.toString().includes('Target Area')) {
          this.map.removeLayer(layer);
        }
      }
    });

    const monthString = String(this.activeFilter.month + 1).padStart(2, '0');
    const targetYearMonth = `${this.activeFilter.year}-${monthString}`;

    console.log(`%c🔍 [HeatmapFilter] Applying Criteria: ${targetYearMonth} | Disease: "${this.activeFilter.disease}"`, 'color: #0f172a; font-weight: bold; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;');
    console.log(`📊 Total scans available in memory: ${this.allScans.length}`);

    // Counters for logging diagnostics
    let dateMatchesCount = 0;
    const uniqueDiseasesInSelectedPeriod: { [key: string]: number } = {};

    // 3. Execute filtering loop
    const filteredData = this.allScans.filter(scan => {
      // Check if scan string exists and matches YYYY-MM prefix
      const matchesDate = !!scan.created_at?.startsWith(targetYearMonth);

      if (matchesDate) {
        dateMatchesCount++;
        // Keep track of what diseases actually exist inside this month/year window
        const dKey = (scan.disease_key || 'unknown').toLowerCase();
        uniqueDiseasesInSelectedPeriod[dKey] = (uniqueDiseasesInSelectedPeriod[dKey] || 0) + 1;
      }

      const matchesDisease =
        this.activeFilter.disease === 'all' ||
        scan.disease_key?.toLowerCase() === this.activeFilter.disease.toLowerCase();

      return matchesDate && matchesDisease;
    });

    // 4. Print Summary to the Console
    console.group(`📈 Filter Results for ${targetYearMonth}`);
    console.log(`📅 Scans matching the date [${targetYearMonth}]: ${dateMatchesCount}`);
    console.log(`🎯 Scans matching BOTH Date and Disease ["${this.activeFilter.disease}"]: ${filteredData.length}`);

    if (dateMatchesCount > 0) {
      console.log('🦠 Distribution of all diseases found in this specific period:', uniqueDiseasesInSelectedPeriod);
    } else if (this.allScans.length > 0) {
      console.warn(`⚠️ Zero scans matched "${targetYearMonth}". Here is a sample "created_at" value from your API data to check formatting:`, this.allScans[0]?.created_at);
    }
    console.groupEnd();

    // 5. Render to map
    this.plotMarkers(filteredData);
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
        intensity = 0.3;
      } else if (diseaseKey.includes('mealybug')) {
        if (severity === 'severe') intensity = 1.0;
        else if (severity === 'moderate') intensity = 0.65;
        else intensity = 0.3;
      } else if (diseaseKey.includes('black pod') || diseaseKey.includes('blackpod')) {
        if (severity === 'severe') intensity = 1.0;
        else if (severity === 'moderate') intensity = 0.65;
        else intensity = 0.3;
      } else if (diseaseKey.includes('pod borer') || diseaseKey.includes('podborer')) {
        if (severity === 'severe') intensity = 1.0;
        else if (severity === 'moderate') intensity = 0.65;
        else intensity = 0.3;
      } else {
        if (severity === 'severe') intensity = 1.0;
        else if (severity === 'moderate') intensity = 0.65;
        else intensity = 0.3;
      }

      heatPoints.push([lat, lng, intensity, diseaseKey]);
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
          0.2: '#bfdbfe',
          0.5: '#3b82f6',
          0.8: '#1d4ed8',
          1.0: '#1e3a8a'
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
          0.2: '#fecaca',
          0.5: '#f87171',
          0.8: '#dc2626',
          1.0: '#7f1d1d'
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
          0.2: '#FFFBA7',
          0.5: '#FFEA6C',
          0.8: '#eab308',
          1.0: '#FFCC00'
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

  private addClickableMarker(lat: number, lng: number, scan: ScanDto): void {
    const ghostMarker = L.circleMarker([lat, lng], {
      radius: 20,
      stroke: false,
      fillColor: '#000',
      fillOpacity: 0,
    });

    ghostMarker.addTo(this.map);

    ghostMarker.bindTooltip(`
      <div style="font-size:11px;font-weight:700;padding:2px 4px;white-space:nowrap;">
        ${scan.user_name || 'Unknown'} &nbsp;·&nbsp; ${scan.disease_key || '—'}
      </div>
    `, {
      sticky: true,
      direction: 'top',
      className: 'custom-heatmap-tooltip'
    });

    ghostMarker.on('click', () => {
      this.selectedScan = scan;
      this.cdr.markForCheck();
    });

    ghostMarker.on('mouseover', (e) => {
      (e.target as L.CircleMarker).setStyle({ fillOpacity: 0.08, fillColor: '#1e293b' });
    });
    ghostMarker.on('mouseout', (e) => {
      (e.target as L.CircleMarker).setStyle({ fillOpacity: 0 });
    });
  }

  clearSelectedScan(): void {
    this.selectedScan = null;
    this.cdr.markForCheck();
  }

  getSeverityClass(severity: string | undefined): string {
    const s = (severity || '').toLowerCase();
    if (s === 'severe') return 'bg-red-50 text-red-600 border-red-100';
    if (s === 'moderate') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    return 'bg-blue-50 text-blue-600 border-blue-100';
  }

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
