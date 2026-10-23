import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../dashboard/dashboard.service';
import { ReverseGeocodingService } from '../../app/core/services/reverse-geocoding.service';
import { Scan } from '../../app/shared/models';
import { tap, catchError, of } from 'rxjs';

import { FilterBarComponent, FilterState, normalizeDisease } from './widgets/filter-bar.component';

import { DISEASE_SHADES, DiseaseCounts, Observation } from './heatmap.models';
import { HeatmapLogicService } from './heatmap-logic.service';
import { HeatmapMapService, OverlayKey } from './heatmap-map.service';
import { inBarangay, loadPlaces, nearestPurok, Places } from './heatmap-places';
import { ToastService } from '../../app/shared/components/toast/toast.service';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterBarComponent],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.css',
})
export class HeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading = false;
  errorMessage = '';
  allScans: Scan[] = [];
  filteredScans: Scan[] = [];
  selectedScan: Scan | null = null;
  selectedBarangay = 'Unknown Barangay';

  activeFilter: FilterState = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    disease: 'all',
    barangay: null,
    purok: null,
  };
  diseaseCounts: DiseaseCounts = {
    healthy: 0,
    blackPod: 0,
    mealybug: 0,
    podBorer: 0,
    other: 0,
    total: 0,
  };

  get diseaseStats() {
    const c = this.diseaseCounts;
    return [
      { label: 'Black pod rot', count: c.blackPod, shades: DISEASE_SHADES.blackPod },
      { label: 'Pod borer', count: c.podBorer, shades: DISEASE_SHADES.podBorer },
      { label: 'Mealybug', count: c.mealybug, shades: DISEASE_SHADES.mealybug },
      { label: 'Healthy pods', count: c.healthy, shades: DISEASE_SHADES.healthy },
    ];
  }

  isSyncing = false;
  newObservation = '';
  observations: Observation[] = [
    {
      text: 'Plot C — Unusual pod discoloration on eastern row.',
      time: new Date(Date.now() - 1000 * 60 * 88),
    },
  ];

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private geocoding: ReverseGeocodingService,
    public logic: HeatmapLogicService,
    private mapService: HeatmapMapService,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    loadPlaces().then((places) => (this.places = places));
  }

  ngAfterViewInit() {
    this.mapService.initMap('map').then(() => {
      this.mapService.onDragStart(() => this.closeDetailCard());
      this.mapService.onMapClick(() => this.closeDetailCard());
    });

    setTimeout(() => this.loadScans(), 0);

    this.route.queryParams.subscribe((params) => {
      if (params['loc']) {
        const coords = params['loc'].split(',').map(Number);
        this.mapService.focusOnLocation(coords[0], coords[1]);
      }
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
          this.applyFilters();
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load scans data';
        this.toastService.show(
          'error',
          'Load Failed',
          'Could not load heatmap data from the server.',
        );
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onFilterChange(filter: FilterState): void {
    const placeChanged =
      filter.barangay !== this.activeFilter.barangay || filter.purok !== this.activeFilter.purok;
    this.activeFilter = filter;
    this.applyFilters();
    if (placeChanged) this.mapService.showPlace(filter.barangay, filter.purok);
  }

  applyFilters(): void {
    this.filteredScans = this.allScans.filter((scan) => {
      const scanDiseaseKey = normalizeDisease(scan.disease_key || (scan as any).disease);
      const matchesDisease =
        this.activeFilter.disease === 'all' || scanDiseaseKey === this.activeFilter.disease;

      const scanDate = new Date(scan.scanned_at);
      const matchesYear = scanDate.getFullYear() === this.activeFilter.year;
      const matchesMonth =
        this.activeFilter.month === null || scanDate.getMonth() === this.activeFilter.month;

      return matchesDisease && matchesYear && matchesMonth && this.matchesPlace(scan);
    });

    const validScans = this.filteredScans.filter((s) => s.location_lat && s.location_lng);
    this.diseaseCounts = this.logic.getDiseaseCounts(validScans);

    this.mapService.plotMarkers(this.filteredScans, (scan: Scan) => {
      this.selectedScan = scan;
      this.selectedBarangay = 'Resolving…';
      this.cdr.markForCheck();

      this.geocoding
        .resolve(scan.location_lat, scan.location_lng)
        .pipe(
          tap((barangay) => {
            this.selectedBarangay = barangay;
            this.cdr.markForCheck();
          }),
          catchError(() => {
            this.selectedBarangay = 'Unknown Barangay';
            this.cdr.markForCheck();
            return of(undefined);
          }),
        )
        .subscribe();
    });
  }

  getCoveragePercent(count: number): number {
    return this.logic.getCoveragePercent(count, this.diseaseCounts.total);
  }

  overlays: Record<OverlayKey, boolean> = { barangays: true, puroks: true };
  readonly overlayOptions: { key: OverlayKey; label: string }[] = [
    { key: 'barangays', label: 'Barangays' },
    { key: 'puroks', label: 'Puroks' },
  ];

  toggleOverlay(key: OverlayKey): void {
    this.overlays[key] = !this.overlays[key];
    this.mapService.setOverlay(key, this.overlays[key]);
  }

  private places: Places = { barangays: [], puroks: [] };

  private matchesPlace(scan: Scan): boolean {
    const { barangay, purok } = this.activeFilter;
    if (!barangay) return true;
    const area = this.places.barangays.find((b) => b.name === barangay);
    const lat = Number(scan.location_lat);
    const lng = Number(scan.location_lng);
    if (!area || !inBarangay(lat, lng, area)) return false;
    if (!purok) return true;
    const inArea = this.places.puroks.filter((p) => p.barangay === barangay);
    return nearestPurok(lat, lng, inArea)?.name === purok;
  }

  private closeDetailCard(): void {
    if (this.selectedScan) this.clearSelectedScan();
  }

  clearSelectedScan(): void {
    this.selectedScan = null;
    this.selectedBarangay = 'Unknown Barangay';
    this.cdr.markForCheck();
  }

  refreshSync(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.loadScans();
    setTimeout(() => {
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
    this.mapService.recenter();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy() {
    this.mapService.destroyMap();
  }
}
