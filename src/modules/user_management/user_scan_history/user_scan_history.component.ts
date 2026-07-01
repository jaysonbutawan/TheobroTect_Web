import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScanHistorySkeletonComponent, ScanHistoryProfileSkeletonComponent } from '../../../app/shared/skeletons/disease-guidance/scan-history-skeleton/scan-history-skeleton';


export type Severity = 'Mild' | 'Moderate' | 'Severe';
export type ScanStatus = 'complete' | 'failed';

export interface ScanHistoryEntry {
  date: string;
  disease: string;
  severity: Severity;
}

export interface Scan {
  id: string;
  disease: string;
  pod_id: string;
  severity: Severity;
  confidence: number;          // 0-100
  scanned_at: string;          // ISO date string
  location: string;            // e.g. "Sector A-12"
  description: string;
  actions: string[];
  history: ScanHistoryEntry[];
  scores: Record<string, number>; // disease -> confidence % breakdown
  status: ScanStatus;
}

export interface FarmerProfile {
  name: string;
  avatarUrl: string;
  badgeLabel: string;
  isPremium: boolean;
}

interface ScanFilters {
  search: string;
  disease: string;
  severity: string;
}

@Component({
  selector: 'app-scan-history',
  standalone: true,
  imports: [CommonModule, FormsModule, ScanHistorySkeletonComponent, ScanHistoryProfileSkeletonComponent],
  templateUrl: './user_scan_history.component.html',
})
export class ScanHistoryComponent implements OnInit {

  view: 'list' | 'detail' = 'list';

  isLoading = true;
  errorMsg = '';

  profile: FarmerProfile = {
    name: 'Alex Rivers',
    avatarUrl: 'https://i.pravatar.cc/80?img=12',
    badgeLabel: 'Enterprise Account Verified',
    isPremium: true,
  };

  filters: ScanFilters = { search: '', disease: '', severity: '' };
  filterPanelOpen = false;

  diseaseOptions: string[] = ['Cacao Pod Borer', 'Mealybug', 'Black Pod'];
  severityOptions: Severity[] = ['Mild', 'Moderate', 'Severe'];

  allScans: Scan[] = [];
  filteredScans: Scan[] = [];
  pagedScans: Scan[] = [];

  pageSize = 4;
  currentPage = 1;

  selectedScan: Scan | null = null;

  ngOnInit(): void {
    this.loadScans();
  }

  // ── Data loading ──────────────────────────────────────────
  loadScans(): void {
    this.isLoading = true;
    this.errorMsg = '';

    // Replace with a real API call, e.g.:
    // this.scanService.getScans().subscribe({
    //   next: (scans) => { this.allScans = scans; this.applyFilters(); this.isLoading = false; },
    //   error: () => { this.errorMsg = 'Could not load scan history.'; this.isLoading = false; }
    // });

    setTimeout(() => {
      this.allScans = this.mockScans();
      this.applyFilters();
      this.isLoading = false;
    }, 300);
  }

  private mockScans(): Scan[] {
    return [
      {
        id: '1',
        disease: 'Cacao Pod Borer',
        pod_id: 'POD-2310-1',
        severity: 'Moderate',
        confidence: 87.4,
        scanned_at: '2023-10-24T14:30:00',
        location: 'Sector A-12',
        description: 'Larvae tunnel into the pod husk, feeding on the beans and disrupting normal pod development.',
        actions: [
          'Harvest and isolate affected pods immediately.',
          'Apply approved biological control (e.g. Trichogramma wasps).',
          'Improve canopy spacing to reduce humidity.',
        ],
        history: [
          { date: '2023-10-10', disease: 'Cacao Pod Borer', severity: 'Mild' },
        ],
        scores: { 'Cacao Pod Borer': 87.4, 'Mealybug': 8.1, 'Black Pod': 4.5 },
        status: 'complete',
      },
      {
        id: '2',
        disease: 'Mealybug',
        pod_id: 'POD-2310-2',
        severity: 'Severe',
        confidence: 92.1,
        scanned_at: '2023-10-22T09:15:00',
        location: 'North Grove',
        description: 'Sap-sucking insects that cluster on pods and stems, weakening the plant and promoting sooty mold.',
        actions: [
          'Prune and destroy heavily infested pods.',
          'Introduce natural predators such as ladybird beetles.',
          'Apply horticultural oil to affected areas.',
        ],
        history: [],
        scores: { 'Mealybug': 92.1, 'Cacao Pod Borer': 5.2, 'Black Pod': 2.7 },
        status: 'complete',
      },
      {
        id: '3',
        disease: 'Black Pod',
        pod_id: 'POD-2310-3',
        severity: 'Mild',
        confidence: 76.8,
        scanned_at: '2023-10-20T11:45:00',
        location: 'East Ridge',
        description: 'Fungal disease causing dark, water-soaked lesions that spread rapidly in humid conditions.',
        actions: [],
        history: [],
        scores: { 'Black Pod': 76.8, 'Cacao Pod Borer': 14.0, 'Mealybug': 9.2 },
        status: 'failed',
      },
      {
        id: '4',
        disease: 'Cacao Pod Borer',
        pod_id: 'POD-2310-4',
        severity: 'Mild',
        confidence: 81.3,
        scanned_at: '2023-10-18T16:20:00',
        location: 'Sector B-04',
        description: 'Larvae tunnel into the pod husk, feeding on the beans and disrupting normal pod development.',
        actions: [
          'Monitor weekly for spread to neighboring pods.',
        ],
        history: [],
        scores: { 'Cacao Pod Borer': 81.3, 'Mealybug': 11.4, 'Black Pod': 7.3 },
        status: 'complete',
      },
    ];
  }

  // ── Filtering / search ────────────────────────────────────
  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
  }

  private applyFilters(): void {
    const term = this.filters.search.trim().toLowerCase();

    this.filteredScans = this.allScans.filter((scan) => {
      const matchesSearch =
        !term ||
        scan.disease.toLowerCase().includes(term) ||
        scan.pod_id.toLowerCase().includes(term) ||
        scan.location.toLowerCase().includes(term);

      const matchesDisease = !this.filters.disease || scan.disease === this.filters.disease;
      const matchesSeverity = !this.filters.severity || scan.severity === this.filters.severity;

      return matchesSearch && matchesDisease && matchesSeverity;
    });

    this.updatePagedScans();
  }

  // ── Pagination ─────────────────────────────────────────────
  private updatePagedScans(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedScans = this.filteredScans.slice(start, start + this.pageSize);
  }

  get totalScans(): number {
    return this.filteredScans.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalScans / this.pageSize));
  }

  get pageStart(): number {
    return this.totalScans === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalScans);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number): void {
    this.currentPage = p;
    this.updatePagedScans();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.updatePagedScans();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.updatePagedScans();
    }
  }

  // ── Detail modal ───────────────────────────────────────────
  viewScan(scan: Scan): void {
    this.selectedScan = scan;
  }

  closeDetail(): void {
    this.selectedScan = null;
  }

  retryScan(scan: Scan): void {
    // Replace with a real retry / re-upload call.
    scan.status = 'complete';
  }

  get sortedScores(): [string, number][] {
    if (!this.selectedScan) return [];
    return Object.entries(this.selectedScan.scores).sort((a, b) => b[1] - a[1]);
  }

  monitoringChecklist(severity: Severity): string[] {
    switch (severity) {
      case 'Mild':
        return [
          'Check if the dark lesions / damage stopped spreading.',
          'Check for new symptoms on the same tree.',
          'Ensure fallen or infected pods were removed from the area.',
        ];
      case 'Moderate':
        return [
          'Check nearby trees for new lesions or damage.',
          'Confirm sanitation and tool cleaning were completed.',
          'Check drainage and water pooling after rain.',
        ];
      case 'Severe':
      default:
        return [
          'Check if new pods are getting infected quickly.',
          'Confirm infected material was removed and destroyed/buried.',
          'Check humidity/shade; prune if canopy is too dense.',
        ];
    }
  }

  // ── Export ─────────────────────────────────────────────────
  exportScans(): void {
    const header = ['Date', 'Time', 'Disease', 'Severity', 'Confidence', 'Location', 'Pod ID'];
    const rows = this.filteredScans.map((s) => [
      this.formatDate(s.scanned_at),
      this.formatTime(s.scanned_at),
      s.disease,
      s.severity,
      `${this.formatConf(s.confidence)}%`,
      s.location,
      s.pod_id,
    ]);

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scan-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Formatters ─────────────────────────────────────────────
  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatConf(value: number): string {
    return value.toFixed(1);
  }
}