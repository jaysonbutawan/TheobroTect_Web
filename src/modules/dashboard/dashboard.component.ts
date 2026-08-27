import { Component, inject, ChangeDetectorRef, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DashboardService } from './dashboard.service';
import { ReverseGeocodingService } from '../../app/core/services/reverse-geocoding.service';
import { Scan } from '../../app/shared/models';
import { concatMap, delay, from, of, tap, catchError } from 'rxjs';
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
export class DashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private geocoding: ReverseGeocodingService,
  ) {}

  private cdr = inject(ChangeDetectorRef);

  selectedYear = signal<number>(new Date().getFullYear());
  availableYears: number[] = [];
  allScans: Scan[] = [];

  stats: DashboardStats = createEmptyStats();
  previousStats: DashboardStats = createEmptyStats();

  recentScans: Scan[] = [];
  barangayMap = new Map<number, string>();

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

    this.dashboardService.getUsersScan().subscribe({
      next: (res) => {
        this.allScans = res.data;
        this.populateAvailableYears();
        this.filterAndProcessData();

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
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

    this.recentScans = filteredScans.filter((scan) => {
      const createdAt = new Date(scan.scanned_at);
      createdAt.setHours(0, 0, 0, 0);
      return createdAt.getTime() === today.getTime();
    });

    this.resolveBarangays();
  }

  getBarangay(scanId: number): string {
    return this.barangayMap.get(scanId) ?? 'Loading…';
  }

  private resolveBarangays(): void {
    const uniqueCoords = new Map<string, { lat: number; lng: number }>();

    for (const scan of this.recentScans) {
      const key = `${scan.location_lat.toFixed(4)},${scan.location_lng.toFixed(4)}`;
      if (!uniqueCoords.has(key)) {
        uniqueCoords.set(key, { lat: scan.location_lat, lng: scan.location_lng });
      }
    }

    const entries = Array.from(uniqueCoords.values());

    if (entries.length === 0) return;

    from(entries)
      .pipe(
        concatMap((coords, i) =>
          i === 0
            ? of(coords)
            : of(coords).pipe(delay(1100)),
        ),
        concatMap((coords) =>
          this.geocoding.resolve(coords.lat, coords.lng).pipe(
            tap((barangay) => {
              for (const scan of this.recentScans) {
                if (
                  scan.location_lat.toFixed(4) === coords.lat.toFixed(4) &&
                  scan.location_lng.toFixed(4) === coords.lng.toFixed(4)
                ) {
                  this.barangayMap.set(scan.id, barangay);
                }
              }
              this.cdr.markForCheck();
            }),
            catchError(() => {
              for (const scan of this.recentScans) {
                if (
                  scan.location_lat.toFixed(4) === coords.lat.toFixed(4) &&
                  scan.location_lng.toFixed(4) === coords.lng.toFixed(4)
                ) {
                  this.barangayMap.set(scan.id, 'Unknown Barangay');
                }
              }
              this.cdr.markForCheck();
              return of(undefined);
            }),
          ),
        ),
      )
      .subscribe();
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
