import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DashboardService } from './dashboard.service';
import {
  LOCATION_UNAVAILABLE,
  ReverseGeocodingService,
} from '../../app/core/services/reverse-geocoding.service';
import { Scan } from '../../app/shared/models';
import { catchError, concatMap, from, Observable, of, Subscription, tap } from 'rxjs';
import { FieldLogSkeletonMobileComponent } from '../../app/shared/skeletons/dashboard/field-log-skeleton-mobile/field-log-skeleton-mobile';
import { FieldLogSkeletonDesktopComponent } from '../../app/shared/skeletons/dashboard/field-log-skeleton-desktop/field-log-skeleton-desktop';
import { StatsSkeletonComponent } from '../../app/shared/skeletons/dashboard/stats-skeleton/stats-skeleton';
import { ChartSkeletonComponent } from '../../app/shared/skeletons/dashboard/chart-skeleton/chart-skeleton';
import { LineChartComponent } from './widgets/line-chart.component';
import { SummaryStatCardComponent, TrendIndicator } from './widgets/summary-stat-card.component';
import { DiseaseCardComponent } from './widgets/disease-card.component';
import { getInitialLineChartData } from './widgets/chart-config';
import { generateSummaryCards, generateDiseaseCards } from './widgets/card-config';
import {
  DashboardStats,
  createEmptyStats,
  calculateStats,
  calculatePercentageChange,
  getTrendDirection,
  groupScansByDate,
  groupScansByMonth,
  getMonthsOfYear,
  formatDate,
  formatMonth,
  filterScansByYear,
  getAvailableYears,
  isDiseaseType,
  isHealthy,
} from './widgets/dashboard-helpers';

export type ScanLocationStatus = 'loading' | 'resolved' | 'unavailable' | 'error';

export interface ScanLocationState {
  coordinateKey: string;
  lat: number | null;
  lng: number | null;
  label: string;
  status: ScanLocationStatus;
  loading: boolean;
  error: boolean;
}

interface CoordinateGroup {
  key: string;
  lat: number;
  lng: number;
  scanKeys: string[];
}

export interface RecentScan extends Scan {
  locationKey: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FieldLogSkeletonMobileComponent,
    FieldLogSkeletonDesktopComponent,
    StatsSkeletonComponent,
    ChartSkeletonComponent,
    LineChartComponent,
    SummaryStatCardComponent,
    DiseaseCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private geocoding: ReverseGeocodingService,
  ) {}

  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private barangayResolution?: Subscription;

  selectedYear = signal<number>(new Date().getFullYear());
  availableYears: number[] = [];
  allScans: Scan[] = [];

  stats: DashboardStats = createEmptyStats();
  previousStats: DashboardStats = createEmptyStats();

  recentScans: RecentScan[] = [];
  scanLocations = new Map<string, ScanLocationState>();

  get summaryCards() {
    return generateSummaryCards(this.stats, this.selectedYear());
  }

  get diseaseCards() {
    return generateDiseaseCards(this.stats);
  }

  Math = Math;
  calculatePercentageChange = calculatePercentageChange;
  getTrendDirection = getTrendDirection;

  isLoading = false;
  errorMessage = '';

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Black Pod Disease', backgroundColor: '#166534' },
      { data: [], label: 'Mealybug', backgroundColor: '#15803d' },
      { data: [], label: 'Pod Borer', backgroundColor: '#22c55e' },
    ],
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true } },
    plugins: { legend: { position: 'bottom' } },
  };

  public lineChartData: ChartConfiguration<'line'>['data'] = getInitialLineChartData();

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.dashboardService
      .getUsersScan()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.allScans = res.data;
          this.populateAvailableYears();
          this.filterAndProcessData();

          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Failed to load data';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.barangayResolution?.unsubscribe();
  }

  private populateAvailableYears(): void {
    this.availableYears = getAvailableYears(this.allScans);

    if (this.availableYears.length > 0 && !this.availableYears.includes(this.selectedYear())) {
      this.selectedYear.set(this.availableYears[0]);
    }
  }
  onYearChange(year: number): void {
    this.selectedYear.set(year);
    this.filterAndProcessData();
    this.cdr.markForCheck();
  }
  private filterAndProcessData(): void {
    const year = this.selectedYear();
    const filteredScans = filterScansByYear(this.allScans, year);
    const previousYearScans = filterScansByYear(this.allScans, year - 1);

    this.processBarChartData(filteredScans);
    this.processPreviousYearStats(previousYearScans);
    this.processLineChartData(filteredScans, year);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.recentScans = filteredScans
      .filter((scan) => {
        const createdAt = new Date(scan.scanned_at);
        createdAt.setHours(0, 0, 0, 0);
        return createdAt.getTime() === today.getTime();
      })
      .map((scan, index) => ({
        ...scan,
        locationKey: this.createLocationKey(scan, index),
      }));

    this.resolveBarangays();
  }

  getScanLocation(locationKey: string): ScanLocationState {
    return (
      this.scanLocations.get(locationKey) ?? {
        coordinateKey: '',
        lat: null,
        lng: null,
        label: LOCATION_UNAVAILABLE,
        status: 'unavailable',
        loading: false,
        error: false,
      }
    );
  }

  private resolveBarangays(): void {
    this.barangayResolution?.unsubscribe();
    this.scanLocations.clear();

    const coordinateGroups = new Map<string, CoordinateGroup>();

    for (const scan of this.recentScans) {
      let key: string;

      try {
        key = this.geocoding.coordinateKey(scan.location_lat, scan.location_lng);
      } catch {
        this.scanLocations.set(scan.locationKey, {
          coordinateKey: '',
          lat: null,
          lng: null,
          label: LOCATION_UNAVAILABLE,
          status: 'unavailable',
          loading: false,
          error: false,
        });
        continue;
      }

      this.scanLocations.set(scan.locationKey, {
        coordinateKey: key,
        lat: scan.location_lat,
        lng: scan.location_lng,
        label: 'Loading…',
        status: 'loading',
        loading: true,
        error: false,
      });

      const group = coordinateGroups.get(key);
      if (group) {
        group.scanKeys.push(scan.locationKey);
      } else {
        coordinateGroups.set(key, {
          key,
          lat: scan.location_lat,
          lng: scan.location_lng,
          scanKeys: [scan.locationKey],
        });
      }
    }

    const groups = Array.from(coordinateGroups.values());
    if (groups.length === 0) {
      this.cdr.markForCheck();
      return;
    }

    this.barangayResolution = from(groups)
      .pipe(
        concatMap((group) => this.resolveLocationGroup(group)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private resolveLocationGroup(group: CoordinateGroup): Observable<string | undefined> {
    return this.geocoding.resolve(group.lat, group.lng).pipe(
      tap((barangay) => {
        this.updateLocationGroup(
          group,
          barangay,
          barangay === LOCATION_UNAVAILABLE ? 'unavailable' : 'resolved',
        );
        this.cdr.markForCheck();
      }),
      catchError(() => {
        this.updateLocationGroup(group, 'Unable to load location', 'error');
        this.cdr.markForCheck();
        return of(undefined);
      }),
    );
  }

  private updateLocationGroup(
    group: CoordinateGroup,
    label: string,
    status: Exclude<ScanLocationStatus, 'loading'>,
  ): void {
    for (const scanKey of group.scanKeys) {
      const current = this.scanLocations.get(scanKey);
      if (!current || current.coordinateKey !== group.key) continue;

      // Each scan receives its own state object, even when a coordinate lookup is shared.
      this.scanLocations.set(scanKey, {
        coordinateKey: current.coordinateKey,
        lat: current.lat,
        lng: current.lng,
        label,
        status,
        loading: false,
        error: status === 'error',
      });
    }
  }

  private createLocationKey(scan: Scan, index: number): string {
    return [
      scan.id,
      scan.local_id,
      scan.scanned_at,
      String(scan.location_lat),
      String(scan.location_lng),
      index,
    ].join('|');
  }
  private processBarChartData(scans: Scan[]): void {
    const dateGroups = groupScansByDate(scans);
    const sortedDates = Object.keys(dateGroups).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );

    this.barChartData.labels = sortedDates.map((date) => formatDate(date));

    const blackPodCounts: number[] = [];
    const mealybugCounts: number[] = [];
    const podBorerCounts: number[] = [];

    sortedDates.forEach((date) => {
      const scansForDate = dateGroups[date];
      blackPodCounts.push(scansForDate.filter((s) => isDiseaseType(s, 'black pod')).length);
      mealybugCounts.push(scansForDate.filter((s) => isDiseaseType(s, 'mealybug')).length);
      podBorerCounts.push(scansForDate.filter((s) => isDiseaseType(s, 'pod borer')).length);
    });

    if (this.barChartData.datasets) {
      this.barChartData.datasets[0].data = blackPodCounts;
      this.barChartData.datasets[1].data = mealybugCounts;
      this.barChartData.datasets[2].data = podBorerCounts;
    }

    this.stats = calculateStats(scans);
  }
  private processPreviousYearStats(scans: Scan[]): void {
    this.previousStats = calculateStats(scans);
  }

  getTrendForMetric(current: number, previous: number): TrendIndicator | undefined {
    if (previous === 0 && current === 0) return undefined;

    const change = calculatePercentageChange(current, previous);
    return {
      direction: getTrendDirection(current, previous),
      value: `${Math.abs(change).toFixed(0)}%`,
    };
  }

  getHealthRateTrend(): TrendIndicator | undefined {
    const currentRate =
      this.stats.totalScans > 0 ? (this.stats.healthy / this.stats.totalScans) * 100 : 0;
    const previousRate =
      this.previousStats.totalScans > 0
        ? (this.previousStats.healthy / this.previousStats.totalScans) * 100
        : 0;

    if (this.previousStats.totalScans === 0) return undefined;

    const direction = getTrendDirection(currentRate, previousRate);
    return {
      direction,
      label: direction === 'up' ? 'Better' : direction === 'down' ? 'Lower' : 'Stable',
    };
  }

  getHealthRateInfo(): string {
    if (this.previousStats.totalScans === 0) {
      return 'No previous data';
    }
    const prevRate = ((this.previousStats.healthy / this.previousStats.totalScans) * 100).toFixed(
      1,
    );
    return `vs ${prevRate}% last year`;
  }

  getPercentageInfo(value: number): string {
    return this.stats.totalScans > 0
      ? `${((value / this.stats.totalScans) * 100).toFixed(1)}% of total`
      : '0% of total';
  }

  private processLineChartData(scans: Scan[], year: number): void {
    const monthGroups = groupScansByMonth(scans);
    const sortedMonths = getMonthsOfYear(year);

    const healthyCounts: number[] = [];
    const blackPodCounts: number[] = [];
    const mealybugCounts: number[] = [];
    const podBorerCounts: number[] = [];

    sortedMonths.forEach((month) => {
      const scansForMonth = monthGroups[month] ?? [];

      healthyCounts.push(scansForMonth.filter((s) => isHealthy(s)).length);
      blackPodCounts.push(scansForMonth.filter((s) => isDiseaseType(s, 'black pod')).length);
      mealybugCounts.push(scansForMonth.filter((s) => isDiseaseType(s, 'mealybug')).length);
      podBorerCounts.push(scansForMonth.filter((s) => isDiseaseType(s, 'pod borer')).length);
    });

    this.lineChartData = {
      labels: sortedMonths.map((m) => formatMonth(m)),
      datasets: [
        { ...this.lineChartData.datasets[0], data: healthyCounts },
        { ...this.lineChartData.datasets[1], data: blackPodCounts },
        { ...this.lineChartData.datasets[2], data: mealybugCounts },
        { ...this.lineChartData.datasets[3], data: podBorerCounts },
      ],
    };
  }

  navigateToMap(coords?: string) {
    this.router.navigate(['/dashboard/heatmap'], { queryParams: { loc: coords } });
  }
}
