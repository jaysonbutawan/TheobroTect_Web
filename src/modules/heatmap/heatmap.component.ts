import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../dashboard/dashboard.service';
import { Scan } from '../../app/shared/models';

// Import Types and the Normalizer from your FilterBar
import { FilterBarComponent, FilterState, normalizeDisease } from './widgets/filter-bar.component';

import { DiseaseCounts, Observation } from './heatmap.models';
import { HeatmapLogicService } from './heatmap-logic.service';
import { HeatmapMapService } from './heatmap-map.service';
import { ToastService } from '../../app/shared/components/toast/toast.service';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, FilterBarComponent],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.css'
})
export class HeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading = false;
  errorMessage = '';
  allScans: Scan[] = [];
  filteredScans: Scan[] = []; // <-- Added this array to store active scans
  selectedScan: Scan | null = null;

  activeFilter: FilterState = { year: new Date().getFullYear(), month: new Date().getMonth(), disease: 'all' };
  diseaseCounts: DiseaseCounts = { healthy: 0, blackPod: 0, mealybug: 0, podBorer: 0, other: 0, total: 0 };

  scanCoverage: number = 83;
  isSyncing = false;
  lastSyncTime = new Date();
  newObservation = '';
  observations: Observation[] = [
    { text: 'Plot C — Unusual pod discoloration on eastern row.', time: new Date(Date.now() - 1000 * 60 * 88) }
  ];

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    public logic: HeatmapLogicService,
    private mapService: HeatmapMapService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  ngAfterViewInit() {
    this.mapService.initMap('map');

    setTimeout(() => this.loadScans(), 0);

    this.route.queryParams.subscribe(params => {
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
      error: (err) => {
        this.errorMessage = 'Failed to load scans data';
        this.toastService.show('error', 'Load Failed', 'Could not load heatmap data from the server.');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onFilterChange(filter: FilterState): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    // 1. Manually filter the raw database data to match the UI filters exactly
    this.filteredScans = this.allScans.filter((scan) => {
      // Normalize what came from DB (scan.disease_key or scan.disease)
      const scanDiseaseKey = normalizeDisease(scan.disease_key || (scan as any).disease);
      const matchesDisease = this.activeFilter.disease === 'all' || scanDiseaseKey === this.activeFilter.disease;

      const scanDate = new Date(scan.scanned_at);
      const matchesYear = scanDate.getFullYear() === this.activeFilter.year;
      const matchesMonth = this.activeFilter.month === null || scanDate.getMonth() === this.activeFilter.month;

      return matchesDisease && matchesYear && matchesMonth;
    });

    // 2. Validate and pass the correct filtered items to map & counters
    const validScans = this.filteredScans.filter(s => s.location_lat && s.location_lng);
    this.diseaseCounts = this.logic.getDiseaseCounts(validScans);

    this.mapService.plotMarkers(this.filteredScans, (scan: Scan) => {
      this.selectedScan = scan;
      this.cdr.markForCheck();
    });
  }

  getCoveragePercent(count: number): number {
    return this.logic.getCoveragePercent(count, this.diseaseCounts.total);
  }

  clearSelectedScan(): void {
    this.selectedScan = null;
    this.cdr.markForCheck();
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
