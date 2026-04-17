import { Component, OnInit ,inject, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DashboardService } from './dashboard.service';

interface ScanData {
  farmer: string;
  locationName: string;
  type: string;
  confidence: number;
  coordinates: string;
}

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
  ) {}
  private cdr = inject(ChangeDetectorRef);

  recentScans: ScanData[] = [];
  isLoading = true;
  errorMessage = '';

  // Green-themed Chart Data - will be populated from API
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Black Pod', backgroundColor: '#166534' }, // Dark Green
      { data: [], label: 'Mealybug', backgroundColor: '#15803d' },  // Mid Green
      { data: [], label: 'Pod Borer', backgroundColor: '#22c55e' }  // Light Green
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true } },
    plugins: { legend: { position: 'bottom' } }
  };

  stats = {
    blackPod: 0,
    mealybug: 0,
    podBorer: 0
  };

  ngOnInit(): void {
    this.loadScans();
  }

  /**
   * Load scans from API and process data for both table and chart
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

        // Process and aggregate data for chart
        this.processChartData(res.data);

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
   * Process API data to generate chart labels, datasets, and stats
   * Groups data by week/date and counts by disease type
   */
  private processChartData(scans: any[]): void {
    // Group scans by date (scanned_at)
    const dateGroups = this.groupScansByDate(scans);

    // Extract labels (dates) and sort them
    const sortedDates = Object.keys(dateGroups).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Update chart labels
    this.barChartData.labels = sortedDates.map(date => this.formatDate(date));

    // Initialize disease count maps for each date
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

      // Count diseases for this date
      const blackPodCount = scansForDate.filter(
        s => s.disease_key?.toLowerCase() === 'black pod'
      ).length;
      const mealybugCount = scansForDate.filter(
        s => s.disease_key?.toLowerCase() === 'mealybug'
      ).length;
      const podBorerCount = scansForDate.filter(
        s => s.disease_key?.toLowerCase() === 'pod borer'
      ).length;

      blackPodCounts.push(blackPodCount);
      mealybugCounts.push(mealybugCount);
      podBorerCounts.push(podBorerCount);

      totalBlackPod += blackPodCount;
      totalMealybug += mealybugCount;
      totalPodBorer += podBorerCount;
    });

    // Update chart datasets
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

    console.log('Chart data updated:', {
      labels: this.barChartData.labels,
      blackPod: blackPodCounts,
      mealybug: mealybugCounts,
      podBorer: podBorerCounts,
      stats: this.stats
    });
  }

  /**
   * Group scans by date
   * Returns object with dates as keys and arrays of scans as values
   */
  private groupScansByDate(scans: any[]): { [date: string]: any[] } {
    const groups: { [date: string]: any[] } = {};

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
   * Navigate to heatmap with selected coordinates
   */
  navigateToMap(coords: string) {
    this.router.navigate(['/dashboard/heatmap'], { queryParams: { loc: coords } });
  }
}
