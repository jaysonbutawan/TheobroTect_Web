import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// ─── INTERFACES ───────────────────────────────────────────────────────────────

export type Severity = 'Mild' | 'Moderate' | 'Severe';
export type DiseaseType = 'Black pod rot' | 'Frosty pod rot' | "Witches' broom" | 'Healthy';

export interface DiseaseScore {
  [disease: string]: number;
}

export interface ScanHistoryEntry {
  date:     string;
  disease:  string;
  severity: Severity;
}

export interface CacaoScan {
  id:          string;
  pod_id:      string;
  disease:     DiseaseType | string;
  severity:    Severity;
  confidence:  number;
  scanned_at:  string;           // ISO date string e.g. '2024-11-28T10:30:00'
  region:      string;
  image_url?:  string;
  scores:      DiseaseScore;
  description: string;
  actions:     string[];
  history:     ScanHistoryEntry[];
}

export interface ScanFilters {
  search:   string;
  disease:  string;
  severity: string;
  sort:     'date-desc' | 'date-asc' | 'conf-desc' | 'sev-desc';
}

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const DUMMY_SCANS: CacaoScan[] = [
  {
    id: 'SC001', pod_id: 'POD-2024-0041', disease: 'Black pod rot',
    severity: 'Mild', confidence: 94.2, scanned_at: '2024-11-28T10:30:00',
    region: 'Ivory Coast - West',
    scores: { 'Black pod rot': 94.2, 'Frosty pod rot': 3.1, "Witches' broom": 1.8, 'Healthy': 0.9 },
    description: 'Phytophthora-caused fungal infection spreading through pod tissue. Requires urgent intervention.',
    actions: [
      'Remove and destroy all infected pods immediately',
      'Apply copper-based fungicide within 48 hours',
      'Increase canopy pruning to improve airflow',
      'Monitor surrounding trees every 3 days',
    ],
    history: [
      { date: '2024-11-10', disease: 'Black pod rot', severity: 'Moderate' },
      { date: '2024-10-22', disease: 'Healthy',       severity: 'Mild' },
    ],
  },
  {
    id: 'SC002', pod_id: 'POD-2024-0039', disease: 'Healthy',
    severity: 'Mild', confidence: 97.8, scanned_at: '2024-11-27T14:15:00',
    region: 'Ghana - Ashanti',
    scores: { 'Healthy': 97.8, 'Black pod rot': 1.2, 'Frosty pod rot': 0.7, "Witches' broom": 0.3 },
    description: 'No signs of disease detected. Pod exhibits normal development and coloration.',
    actions: ['Continue routine monitoring schedule', 'Maintain current fertilization program'],
    history: [{ date: '2024-10-15', disease: 'Healthy', severity: 'Mild' }],
  },
  {
    id: 'SC003', pod_id: 'POD-2024-0036', disease: 'Frosty pod rot',
    severity: 'Moderate', confidence: 88.5, scanned_at: '2024-11-25T09:45:00',
    region: 'Burkina Faso - South',
    scores: { 'Frosty pod rot': 88.5, 'Black pod rot': 7.3, "Witches' broom": 3.2, 'Healthy': 1.0 },
    description: 'Moniliophthora roreri infection in early stage. White mycelial growth visible on pod surface.',
    actions: [
      'Remove infected pods and bag for disposal',
      'Do not compost infected material',
      'Apply biological control agents',
      'Schedule follow-up scan in 7 days',
    ],
    history: [{ date: '2024-11-01', disease: 'Healthy', severity: 'Mild' }],
  },
];

const PAGE_SIZE = 6;

@Component({
  selector:    'app-user-scan-history',
  standalone:  true,
  imports:     [CommonModule, FormsModule],
  templateUrl: './user_scan_history.component.html',
})
export class UserScanHistoryComponent implements OnInit, OnDestroy {

  // ── State ──────────────────────────────────────────────────────────────────
  allScans:      CacaoScan[] = [];
  filteredScans: CacaoScan[] = [];
  pagedScans:    CacaoScan[] = [];
  selectedScan:  CacaoScan | null = null;

  isLoading = false;
  errorMsg  = '';
  view: 'list' | 'detail' = 'list';

  filters: ScanFilters = {
    search:   '',
    disease:  '',
    severity: '',
    sort:     'date-desc',
  };

  currentPage = 1;
  totalPages  = 1;
  totalScans  = 0;

  // ── Stats (original 4) ─────────────────────────────────────────────────────
  statTotal   = 0;
  statAvgConf = 0;
  statHigh    = 0;
  statHealthy = 0;

  // ── Stats (new profile card) ───────────────────────────────────────────────
  /** Distinct regions/farms across all scans */
  statLocations = 0;
  /** Display date of the most recent scan e.g. "28 Nov 2024" */
  latestScanDate = '—';
  /** Display time of the most recent scan e.g. "10:30 AM" */
  latestScanTime = '—';

  // ── Filter options ─────────────────────────────────────────────────────────
  diseaseOptions  = ['Black pod rot', 'Frosty pod rot', "Witches' broom", 'Healthy'];
  severityOptions: Severity[] = ['Mild', 'Moderate', 'Severe'];

  private search$  = new Subject<string>();
  private destroy$ = new Subject<void>();
  private cdr      = inject(ChangeDetectorRef);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => { this.currentPage = 1; this.applyFilters(); });

    this.loadScans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data loading ───────────────────────────────────────────────────────────
  loadScans(): void {
    this.isLoading = true;
    this.errorMsg  = '';
    this.cdr.markForCheck();
    setTimeout(() => {
      this.allScans  = DUMMY_SCANS;
      this.isLoading = false;
      this.cdr.markForCheck();
      this.updateStats();
      this.applyFilters();
    }, 400);
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  updateStats(): void {
    this.statTotal   = this.allScans.length;
    this.statAvgConf = this.statTotal
      ? Math.round(this.allScans.reduce((s, x) => s + x.confidence, 0) / this.statTotal)
      : 0;
    this.statHigh    = this.allScans.filter(s => s.severity === 'Severe').length;
    this.statHealthy = this.allScans.filter(s => s.disease  === 'Healthy').length;

    // Distinct regions
    this.statLocations = new Set(this.allScans.map(s => s.region)).size;

    // Latest scan — sort descending by scanned_at and take first
    if (this.statTotal > 0) {
      const sorted = [...this.allScans].sort((a, b) =>
        b.scanned_at.localeCompare(a.scanned_at)
      );
      const latest = sorted[0];
      this.latestScanDate = this.formatDate(latest.scanned_at);
      this.latestScanTime = this.formatTime(latest.scanned_at);
    }
  }

  // ── Filtering & sorting ────────────────────────────────────────────────────
  onSearchChange(): void { this.search$.next(this.filters.search); }

  onFilterChange(): void { this.currentPage = 1; this.applyFilters(); }

  applyFilters(): void {
    const q = this.filters.search.trim().toLowerCase();
    const sevOrder: Record<Severity, number> = { Mild: 1, Moderate: 2, Severe: 3 };

    this.filteredScans = this.allScans.filter(s => {
      const mq = !q || s.disease.toLowerCase().includes(q)
                    || s.pod_id.toLowerCase().includes(q)
                    || s.region.toLowerCase().includes(q);
      const md = !this.filters.disease  || s.disease  === this.filters.disease;
      const ms = !this.filters.severity || s.severity === this.filters.severity;
      return mq && md && ms;
    });

    switch (this.filters.sort) {
      case 'date-asc':  this.filteredScans.sort((a, b) => a.scanned_at.localeCompare(b.scanned_at)); break;
      case 'date-desc': this.filteredScans.sort((a, b) => b.scanned_at.localeCompare(a.scanned_at)); break;
      case 'conf-desc': this.filteredScans.sort((a, b) => b.confidence - a.confidence); break;
      case 'sev-desc':  this.filteredScans.sort((a, b) => sevOrder[b.severity] - sevOrder[a.severity]); break;
    }

    this.totalScans = this.filteredScans.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalScans / PAGE_SIZE));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    this.updatePage();
  }

  // ── Pagination ─────────────────────────────────────────────────────────────
  updatePage(): void {
    const start     = (this.currentPage - 1) * PAGE_SIZE;
    this.pagedScans = this.filteredScans.slice(start, start + PAGE_SIZE);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }

  /** Page numbers array used by @for (p of pages) in the template */
  get pages(): number[] {
    const result: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 1)
        result.push(i);
    }
    return result;
  }

  /** Kept for backwards compatibility — same as pages */
  get pageNumbers(): number[] { return this.pages; }

  showEllipsisBefore(page: number, idx: number): boolean {
    return idx > 0 && page - this.pages[idx - 1] > 1;
  }

  // ── Detail view ────────────────────────────────────────────────────────────
  openDetail(scan: CacaoScan): void {
    this.selectedScan = scan;
    this.view = 'detail';
  }

  /** Called by (click)="viewScan(scan)" in the new table design */
  viewScan(scan: CacaoScan): void {
    this.openDetail(scan);
  }

  closeDetail(): void {
    this.selectedScan = null;
    this.view = 'list';
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  get sortedScores(): [string, number][] {
    if (!this.selectedScan) return [];
    return Object.entries(this.selectedScan.scores).sort((a, b) => b[1] - a[1]);
  }

  severityClass(sev: Severity | string): string {
    return { Severe: 'sev-high', Moderate: 'sev-mod', Mild: 'sev-low' }[sev as Severity] ?? 'sev-low';
  }

  severityDotClass(sev: Severity | string): string {
    return { Severe: 'dot-high', Moderate: 'dot-mod', Mild: 'dot-low' }[sev as Severity] ?? 'dot-low';
  }

  diseaseBarColor(disease: string): string {
    const map: Record<string, string> = {
      'Black pod rot':  '#E24B4A',
      'Frosty pod rot': '#BA7517',
      "Witches' broom": '#7F77DD',
      'Healthy':        '#639922',
    };
    return map[disease] ?? '#888780';
  }

  /**
   * Formats the date portion of an ISO string.
   * Accepts both date-only ('2024-11-28') and full ISO ('2024-11-28T10:30:00').
   */
  formatDate(iso: string): string {
    // Ensure we always have a valid datetime by appending time if missing
    const normalized = iso.includes('T') ? iso : iso + 'T00:00:00';
    return new Date(normalized).toLocaleDateString('en-GB', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    });
  }

  /**
   * Formats the time portion of a full ISO string e.g. '2024-11-28T10:30:00' → '10:30 AM'.
   * Returns '—' if the string has no time component.
   */
  formatTime(iso: string): string {
    if (!iso.includes('T')) return '—';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  formatConf(c: number): string {
    return Math.round(c).toString();
  }

  get rangeStart(): number { return (this.currentPage - 1) * PAGE_SIZE + 1; }
  get rangeEnd():   number { return Math.min(this.currentPage * PAGE_SIZE, this.totalScans); }

  getDefaultImage(disease: string): string {
    if (!disease) return 'assets/images/mb.png';
    const d = disease.toLowerCase();
    if (d.includes('monilia') || d.includes('mb'))        return 'assets/images/mb.png';
    if (d.includes('phytophthora') || d.includes('pb'))   return 'assets/images/pb.png';
    if (d.includes('black pod') || d.includes('bp'))      return 'assets/images/bp.png';
    return 'assets/images/mb.png';
  }
}