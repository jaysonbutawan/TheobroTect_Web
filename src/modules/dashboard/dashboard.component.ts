import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DashboardService } from './dashboard.service';
import { ScanDto } from './dashboard.dto';
import { FieldLogSkeletonMobileComponent } from '../../app/shared/skeletons/dashboard/field-log-skeleton-mobile/field-log-skeleton-mobile';
import { FieldLogSkeletonDesktopComponent } from '../../app/shared/skeletons/dashboard/field-log-skeleton-desktop/field-log-skeleton-desktop';
import { StatsSkeletonComponent } from '../../app/shared/skeletons/dashboard/stats-skeleton/stats-skeleton';
import { ChartSkeletonComponent } from '../../app/shared/skeletons/dashboard/chart-skeleton/chart-skeleton';
import { LineChartComponent } from './widgets/line-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    // BaseChartDirective,
    FieldLogSkeletonMobileComponent,
    FieldLogSkeletonDesktopComponent,
    StatsSkeletonComponent,
    ChartSkeletonComponent,
    LineChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) { }

  private cdr = inject(ChangeDetectorRef);

  // State management
  isLoading = false;
  errorMessage = '';

  // Statistics
  stats = {
    blackPod: 0,
    mealybug: 0,
    podBorer: 0
  };

  // Recent scans table data
  recentScans: any[] = [];

  // Bar Chart - Disease counts by date
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Black Pod Disease', backgroundColor: '#166534' },
      { data: [], label: 'Mealybug', backgroundColor: '#15803d' },
      { data: [], label: 'Pod Borer', backgroundColor: '#22c55e' }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true } },
    plugins: { legend: { position: 'bottom' } }
  };

  // Line Chart - Disease trends over time (from API data)
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Healthy Cacao',
        borderColor: '#1976D2', // Blue
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        data: [],
        label: 'Black Pod (Severe)',
        borderColor: '#D32F2F', // Red
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        data: [],
        label: 'Mealybug (Mild)',
        borderColor: '#FBC02D', // Yellow
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        data: [],
        label: 'Pod Borer (Mild)',
        borderColor: '#388E3C', // Green
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.dashboardService.getUsersScan().subscribe({
      next: (res) => {
        console.log('===== RAW API DATA =====');
        console.log(res.data);

        console.table(
          res.data.map(s => ({
            disease: s.disease_key,
            severity: s.severity_key,
            scanned_at: s.scanned_at
          }))
        );
        // charts
        this.processBarChartData(res.data);
        this.processLineChartData(res.data);

        // table
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.recentScans = res.data
          .filter(scan => {
            const createdAt = new Date(scan.scanned_at);
            createdAt.setHours(0, 0, 0, 0);
            return createdAt.getTime() === today.getTime();
          })
          .map(scan => ({
            farmer: scan.user_name || 'Unknown',
            locationName: scan.location_label || 'Unknown Location',
            type: scan.disease_key || 'Unknown Disease',
            severity_key: scan.severity_key || 'Unknown Severity',
            confidence: scan.confidence || 0,
            coordinates: `${scan.location_lat},${scan.location_lng}`
          }));

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.errorMessage = 'Failed to load data';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Process API data to generate bar chart labels, datasets, and stats
   * Groups data by date and counts by disease type
   */
  private processBarChartData(scans: ScanDto[]): void {
    const dateGroups = this.groupScansByDate(scans);
    const sortedDates = Object.keys(dateGroups).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    this.barChartData.labels = sortedDates.map(date => this.formatDate(date));

    const blackPodCounts: number[] = [];
    const mealybugCounts: number[] = [];
    const podBorerCounts: number[] = [];

    let totalBlackPod = 0;
    let totalMealybug = 0;
    let totalPodBorer = 0;

    sortedDates.forEach(date => {
      const scansForDate = dateGroups[date];

      const blackPodCount = scansForDate.filter(s =>
        this.normalizeDisease(s.disease_key).includes('black pod')
      ).length;

      const mealybugCount = scansForDate.filter(s =>
        this.normalizeDisease(s.disease_key).includes('mealybug')
      ).length;

      const podBorerCount = scansForDate.filter(s =>
        this.normalizeDisease(s.disease_key).includes('pod borer')
      ).length;

      blackPodCounts.push(blackPodCount);
      mealybugCounts.push(mealybugCount);
      podBorerCounts.push(podBorerCount);

      totalBlackPod += blackPodCount;
      totalMealybug += mealybugCount;
      totalPodBorer += podBorerCount;
    });

    if (this.barChartData.datasets) {
      this.barChartData.datasets[0].data = blackPodCounts;
      this.barChartData.datasets[1].data = mealybugCounts;
      this.barChartData.datasets[2].data = podBorerCounts;
    }

    this.stats = {
      blackPod: totalBlackPod,
      mealybug: totalMealybug,
      podBorer: totalPodBorer
    };
  }
  private getMonthsOfYear(year: number): string[] {
    return Array.from({ length: 12 }, (_, i) =>
      `${year}-${String(i + 1).padStart(2, '0')}`
    );
  }

  /**
   * Process API data to generate line chart
   * Groups data by month and counts healthy vs diseased plants
   */
  private processLineChartData(scans: ScanDto[]): void {

    const monthGroups = this.groupScansByMonth(scans);
    const currentYear = new Date().getFullYear();
    const sortedMonths = this.getMonthsOfYear(currentYear);

    this.lineChartData.labels = sortedMonths.map(month => this.formatMonth(month));

    const healthyCounts: number[] = [];
    const blackPodSevereCounts: number[] = [];
    const mealybugMildCounts: number[] = [];
    const podBorerMildCounts: number[] = [];

    sortedMonths.forEach(month => {
      const scansForMonth = monthGroups[month] ?? [];
      if (!scansForMonth) {
        healthyCounts.push(null as any);
        blackPodSevereCounts.push(null as any);
        mealybugMildCounts.push(null as any);
        podBorerMildCounts.push(null as any);
        return;
      }

      const healthyCount = scansForMonth.filter(s =>
        !s.disease_key || this.normalizeDisease(s.disease_key).includes('healthy')
      ).length;

      const blackPodCount = scansForMonth.filter(s =>
        this.normalizeDisease(s.disease_key).includes('black pod') &&
        (s.severity_key?.toLowerCase().includes('mild') || s.severity_key?.toLowerCase().includes('moderate') || s.severity_key?.toLowerCase().includes('severe'))
      ).length;

      const mealybugCount = scansForMonth.filter(s =>
        this.normalizeDisease(s.disease_key).includes('mealybug') &&
        (s.severity_key?.toLowerCase().includes('mild') || s.severity_key?.toLowerCase().includes('moderate') || s.severity_key?.toLowerCase().includes('severe'))
      ).length;

      const podBorerCount = scansForMonth.filter(s =>
        this.normalizeDisease(s.disease_key).includes('pod borer') &&
        (s.severity_key?.toLowerCase().includes('mild') || s.severity_key?.toLowerCase().includes('moderate') || s.severity_key?.toLowerCase().includes('severe'))
      ).length;

      healthyCounts.push(healthyCount);
      blackPodSevereCounts.push(blackPodCount);
      mealybugMildCounts.push(mealybugCount);
      podBorerMildCounts.push(podBorerCount);
    });

    this.lineChartData = {
      labels: sortedMonths.map(m => this.formatMonth(m)),
      datasets: [
        { ...this.lineChartData.datasets[0], data: healthyCounts },
        { ...this.lineChartData.datasets[1], data: blackPodSevereCounts },
        { ...this.lineChartData.datasets[2], data: mealybugMildCounts },
        { ...this.lineChartData.datasets[3], data: podBorerMildCounts }
      ]
    };
  }

  /**
   * Normalize disease key to standard format
   */
  private normalizeDisease(diseaseKey: string | null | undefined): string {
    if (!diseaseKey) return 'healthy';

    return diseaseKey
      .toLowerCase()
      .replace(/_/g, ' ')
      .trim();
  }

  /**
   * Group scans by date
   */
  private groupScansByDate(scans: ScanDto[]): { [date: string]: ScanDto[] } {
    const groups: { [date: string]: ScanDto[] } = {};

    scans.forEach(scan => {
      const dateStr = scan.scanned_at?.split(' ')[0] || new Date().toISOString().split('T')[0];

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(scan);
    });

    return groups;
  }

  /**
   * Group scans by month
   */
  private groupScansByMonth(scans: ScanDto[]): { [month: string]: ScanDto[] } {
    const groups: { [month: string]: ScanDto[] } = {};

    scans.forEach(scan => {
      const monthStr = scan.scanned_at?.substring(0, 7) || new Date().toISOString().substring(0, 7);

      if (!groups[monthStr]) {
        groups[monthStr] = [];
      }
      groups[monthStr].push(scan);
    });

    return groups;
  }

  /**
   * Format date for chart display
   */
  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  }

  /**
   * Format month for chart display
   */
  private formatMonth(monthStr: string): string {
    try {
      const date = new Date(monthStr + '-01T00:00:00');
      const options: Intl.DateTimeFormatOptions = {
        month: 'short'
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return monthStr;
    }
  }

  /**
   * Navigate to heatmap with selected coordinates
   */
  navigateToMap(coords?: string) {
    this.router.navigate(['/dashboard/heatmap'], { queryParams: { loc: coords } });
  }
}
