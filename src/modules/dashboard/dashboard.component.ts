import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DashboardService } from './dashboard.service';
import { ScanDto } from './dashboard.dto';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
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
      { data: [], label: 'Healthy Cacao', borderColor: '#a3e635', tension: 0.4, fill: false, pointBackgroundColor: '#a3e635' },
      { data: [], label: 'Black Pod (Severe)', borderColor: '#166534', tension: 0.4, fill: false, pointBackgroundColor: '#166534' },
      { data: [], label: 'Mealybug (Mild)', borderColor: '#4ade80', tension: 0.4, fill: false, pointBackgroundColor: '#4ade80' },
      { data: [], label: 'Pod Borer (Mild)', borderColor: '#15803d', tension: 0.4, fill: false, pointBackgroundColor: '#15803d' }
    ]
  };


  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  ngOnInit(): void {
    this.loadScans();

  }



  /**
   * Load scans from API and process data for both table and charts
   */
  loadScans(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.dashboardService.getUsersScan().subscribe({
      next: (res) => {
        // Map API response to table data
        this.recentScans = res.data.map(scan => ({
          farmer: scan.user_name || 'Unknown',
          locationName: scan.location_label || 'Unknown Location',
          type: scan.disease_key || 'Unknown Disease',
          confidence: scan.confidence || 0,
          coordinates: `${scan.location_lat},${scan.location_lng}`
        }));

        // Process and aggregate data for charts
        this.processBarChartData(res.data);
        this.processLineChartData(res.data);

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
   * Process API data to generate bar chart labels, datasets, and stats
   * Groups data by date and counts by disease type
   */
  private processBarChartData(scans: ScanDto[]): void {
    // Group scans by date (scanned_at)
    const dateGroups = this.groupScansByDate(scans);

    // Extract labels (dates) and sort them
    const sortedDates = Object.keys(dateGroups).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Update bar chart labels
    this.barChartData.labels = sortedDates.map(date => this.formatDate(date));

    // Initialize disease count arrays for each date
    const blackPodCounts: number[] = [];
    const mealybugCounts: number[] = [];
    const podBorerCounts: number[] = [];

    // Counter for stats
    let totalBlackPod = 0;
    let totalMealybug = 0;
    let totalPodBorer = 0;

    // Process each date group
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
    }); sortedDates.forEach(date => {
      const scansForDate = dateGroups[date];

      // Count diseases for this date
      const blackPodCount = scansForDate.filter(
        s => this.normalizeDisease(s.disease_key) === 'black pod'
      ).length;
      const mealybugCount = scansForDate.filter(
        s => this.normalizeDisease(s.disease_key) === 'mealybug'
      ).length;
      const podBorerCount = scansForDate.filter(
        s => this.normalizeDisease(s.disease_key) === 'pod borer'
      ).length;

      blackPodCounts.push(blackPodCount);
      mealybugCounts.push(mealybugCount);
      podBorerCounts.push(podBorerCount);

      totalBlackPod += blackPodCount;
      totalMealybug += mealybugCount;
      totalPodBorer += podBorerCount;
    });

    // Update bar chart datasets
    if (this.barChartData.datasets) {
      this.barChartData.datasets[0].data = blackPodCounts;
      this.barChartData.datasets[1].data = mealybugCounts;
      this.barChartData.datasets[2].data = podBorerCounts;
    }

    // Update stats
    this.stats = {
      blackPod: totalBlackPod,
      mealybug: totalMealybug,
      podBorer: totalPodBorer
    };

    console.log('Bar chart data updated:', {
      labels: this.barChartData.labels,
      blackPod: blackPodCounts,
      mealybug: mealybugCounts,
      podBorer: podBorerCounts,
      stats: this.stats
    });
  }

  /**
   * Process API data to generate line chart
   * Groups data by month and counts healthy vs diseased plants
   */
  private processLineChartData(scans: ScanDto[]): void {
    console.log('[LINE CHART] Raw scan sample (first 3):', scans.slice(0, 3).map(s => ({
      disease_key: s.disease_key,
      severity_key: s.severity_key,
      scanned_at: s.scanned_at
    })));

    // Group scans by month (YYYY-MM format)
    const monthGroups = this.groupScansByMonth(scans);

    // Extract months and sort them
    const sortedMonths = Object.keys(monthGroups).sort();

    // Update line chart labels (formatted as "Jan", "Feb", etc.)
    this.lineChartData.labels = sortedMonths.map(month => this.formatMonth(month));

    // Initialize data arrays for each disease type
    const healthyCounts: number[] = [];
    const blackPodSevereCounts: number[] = [];
    const mealybugMildCounts: number[] = [];
    const podBorerMildCounts: number[] = [];

    // Process each month group
    sortedMonths.forEach(month => {
      const scansForMonth = monthGroups[month];

      // Count by disease type and severity
      const healthyCount = scansForMonth.filter(s =>
        !s.disease_key || this.normalizeDisease(s.disease_key) === 'healthy'
      ).length;

      const blackPodCount = scansForMonth.filter(s =>
        this.normalizeDisease(s.disease_key) === 'black pod' &&
        s.severity_key?.toLowerCase() === 'severe'
      ).length;

      const mealybugCount = scansForMonth.filter(s =>
        this.normalizeDisease(s.disease_key) === 'mealybug' &&
        s.severity_key?.toLowerCase() === 'mild'
      ).length;

      const podBorerCount = scansForMonth.filter(s =>
        this.normalizeDisease(s.disease_key) === 'pod borer' &&
        s.severity_key?.toLowerCase() === 'mild'
      ).length;

      healthyCounts.push(healthyCount);
      blackPodSevereCounts.push(blackPodCount);
      mealybugMildCounts.push(mealybugCount);
      podBorerMildCounts.push(podBorerCount);
    });

    console.log('[LINE CHART] Computed counts before assignment:', {
      labels: sortedMonths.map(m => this.formatMonth(m)),
      healthy: healthyCounts,
      blackPodSevere: blackPodSevereCounts,
      mealybugMild: mealybugMildCounts,
      podBorerMild: podBorerMildCounts,
      allZero: [...healthyCounts, ...blackPodSevereCounts, ...mealybugMildCounts, ...podBorerMildCounts].every(v => v === 0)
    });

    // Reassign entire object so ng2-charts detects the change (mutation alone won't trigger re-render)
    this.lineChartData = {
      labels: sortedMonths.map(m => this.formatMonth(m)),
      datasets: [
        { ...this.lineChartData.datasets[0], data: healthyCounts },
        { ...this.lineChartData.datasets[1], data: blackPodSevereCounts },
        { ...this.lineChartData.datasets[2], data: mealybugMildCounts },
        { ...this.lineChartData.datasets[3], data: podBorerMildCounts }
      ]
    };

    console.log('[LINE CHART] lineChartData after reassignment:', this.lineChartData);
    console.log('[LINE CHART] NOTE: if allZero=true above, check severity_key values in raw scan data');
  }

  /**
   * Normalize disease key to standard format
   * Handles different formats: "black_pod", "Black Pod", "BLACK POD", etc.
   */
  private normalizeDisease(diseaseKey: string | null | undefined): string {
    if (!diseaseKey) return 'healthy';

    return diseaseKey
      .toLowerCase()
      .replace(/_/g, ' ')  // Replace underscores with spaces
      .trim();
  }

  /**
   * Group scans by date
   * Returns object with dates as keys and arrays of scans as values
   */
  private groupScansByDate(scans: ScanDto[]): { [date: string]: ScanDto[] } {
    const groups: { [date: string]: ScanDto[] } = {};

    scans.forEach(scan => {
      // Extract date part only (YYYY-MM-DD format)
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
   * Returns object with months (YYYY-MM) as keys and arrays of scans as values
   */
  private groupScansByMonth(scans: ScanDto[]): { [month: string]: ScanDto[] } {
    const groups: { [month: string]: ScanDto[] } = {};

    scans.forEach(scan => {
      // Extract month part only (YYYY-MM format)
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
   * Converts YYYY-MM-DD to short format (e.g., "Jan 15")
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
   * Converts YYYY-MM to short format (e.g., "Jan")
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
  navigateToMap(coords: string) {
    this.router.navigate(['/dashboard/heatmap'], { queryParams: { loc: coords } });
  }
}
