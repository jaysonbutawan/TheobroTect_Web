import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../dashboard/dashboard.service';
import { ScanDto } from '../dashboard/dashboard.dto';
import { HeatmapSkeletonComponent } from '../../app/shared/skeletons/heatmap-skeleton/heatmap-skeleton';


import * as maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';

interface Observation {
  text: string;
  time: Date;
}

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, HeatmapSkeletonComponent],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.css'
})
export class HeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: maplibregl.Map;
  private deckOverlay!: MapboxOverlay;

  // FIX: Two flags to track readiness independently
  private mapReady = false;
  private scansReady = false;

  isLoading = false;
  errorMessage = '';

  allScans: ScanDto[] = [];
  filters = {
    date: '',
    disease: 'all',
    zone: 'all'
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
    this.loadScans();

    this.route.queryParams.subscribe(params => {
      if (params['loc'] && this.map) {
        const coords = params['loc'].split(',').map(Number);
        this.focusOnLocation(coords[0], coords[1]);
      }
    });
  }

  private initMap(): void {
    this.map = new maplibregl.Map({
      container: 'map',
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
      center: [125.7231, 7.7512],
      zoom: 12,
      pitch: 65,
      bearing: 45
    });

    this.map.on('load', () => {
      this.map.addSource('open-terrain', {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 14
      });

      this.map.setTerrain({ source: 'open-terrain', exaggeration: 1.5 });

      // FIX: Initialize the DeckGL overlay HERE inside the load event,
      // so it is always registered before any layer data is pushed.
      // interleaved: false ensures the deck.gl canvas renders ON TOP of
      // the MapLibre raster tiles and is never occluded.
      this.deckOverlay = new MapboxOverlay({
        interleaved: false,
        layers: []
      });
      this.map.addControl(this.deckOverlay as any);

      // FIX: Mark map as ready, then attempt to render if scans already loaded
      this.mapReady = true;
      this.tryRender();
    });
  }

  loadScans(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.dashboardService.getUsersScan().subscribe({
      next: (res) => {
        if (res.data) {
          this.allScans = res.data;
          // FIX: Mark scans as ready, then attempt to render if map already loaded
          this.scansReady = true;
          this.tryRender();
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

  // FIX: Central gate — only renders when BOTH map and scans are ready
  private tryRender(): void {
    if (this.mapReady && this.scansReady) {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    const filteredData = this.allScans.filter(scan => {
      const matchesDate = !this.filters.date || scan.created_at?.includes(this.filters.date);
      const matchesDisease = this.filters.disease === 'all' ||
        scan.disease_key?.toLowerCase().includes(this.filters.disease.toLowerCase());
      return matchesDate && matchesDisease;
    });

    this.plotMarkers(filteredData);
  }

  resetFilters(): void {
    this.filters = { date: '', disease: 'all', zone: 'all' };
    this.selectedScan = null;
    this.applyFilters();
  }

  private plotMarkers(scans: ScanDto[]): void {
    const data = scans
      .filter(s => s.location_lat && s.location_lng)
      .map(scan => {
        const severity = (scan.severity_key || 'mild').toLowerCase();
        let weight = 1;
        if (severity === 'moderate') weight = 5;
        if (severity === 'severe') weight = 10;

        return {
          position: [Number(scan.location_lng), Number(scan.location_lat)],
          weight: weight,
          scan: scan
        };
      });

    const heatmapLayer = new HeatmapLayer({
      id: 'disease-heatmap-visuals',
      data,
      getPosition: (d: any) => d.position,
      getWeight: (d: any) => d.weight,
      radiusPixels: 45,
      intensity: 1,
      threshold: 0.05,
      colorRange: [
        [144, 238, 144, 50],
        [50, 205, 50, 150],
        [173, 255, 47, 200],
        [255, 255, 0, 255],
        [255, 165, 0, 255],
        [255, 0, 0, 255]
      ],
      aggregation: 'SUM'
    });

    const interactionLayer = new ScatterplotLayer({
      id: 'disease-click-targets',
      data,
      getPosition: (d: any) => d.position,
      radiusMinPixels: 15,
      opacity: 0,
      pickable: true,
      onClick: (info: any) => {
        if (info.object && info.object.scan) {
          this.selectedScan = info.object.scan;
          this.cdr.markForCheck();
        }
        return true;
      }
    });

    // FIX: deckOverlay is guaranteed to exist here because tryRender()
    // only fires after mapReady = true, which is set after overlay is created
    this.deckOverlay.setProps({ layers: [heatmapLayer, interactionLayer] });
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

    this.map.flyTo({
      center: [lng, lat],
      zoom: 16,
      pitch: 60,
      bearing: 0,
      duration: 2000
    });

    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'custom-div-icon relative flex items-center justify-center';
      el.innerHTML = `
        <div class="absolute w-12 h-12 bg-green-500 rounded-full animate-ping opacity-20"></div>
        <div class="w-8 h-8 bg-white border-4 border-green-600 rounded-full shadow-2xl relative z-10"></div>
      `;

      const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML(`<b class="text-slate-800">Target Area</b>`);

      new maplibregl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this.map)
        .togglePopup();
    }, 2000);
  }

  refreshSync(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.scansReady = false; // FIX: Reset so tryRender re-gates properly on refresh
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

  recenterMap() {
    this.map.flyTo({
      center: [125.7231, 7.7512],
      zoom: 12,
      pitch: 65,
      bearing: 45,
      duration: 1500
    });
  }

  goBack() { this.router.navigate(['/dashboard']); }

  ngOnDestroy() {
    if (this.deckOverlay) {
      this.deckOverlay.finalize();
    }
    if (this.map) {
      this.map.remove();
    }
  }
}
