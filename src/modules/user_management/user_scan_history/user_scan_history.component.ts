import { Component, OnInit, OnDestroy,ChangeDetectorRef , inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

// ─── INTERFACES (match your API response shape) ───────────────────────────────

export type Severity = 'Low' | 'Moderate' | 'High';
export type DiseaseType = 'Black pod rot' | 'Frosty pod rot' | "Witches' broom" | 'Healthy';

export interface DiseaseScore {
  [disease: string]: number;  // confidence % per disease class
}

export interface ScanHistoryEntry {
  date:    string;
  disease: string;
  severity: Severity;
}

export interface CacaoScan {
  id:          string;
  pod_id:      string;
  disease:     DiseaseType | string;
  severity:    Severity;
  confidence:  number;           // 0–100
  scanned_at:  string;           // ISO date string
  region:      string;
  image_url?:  string;           // optional — from your storage bucket
  scores:      DiseaseScore;     // AI confidence per class
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

// ─── DUMMY DATA (replace loadScans() with real API call) ─────────────────────

const DUMMY_SCANS: CacaoScan[] = [
  {
    id: 'SC001', pod_id: 'POD-2024-0041', disease: 'Black pod rot',
    severity: 'High', confidence: 94.2, scanned_at: '2024-11-28',
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
      { date: '2024-10-22', disease: 'Healthy', severity: 'Low' },
    ],
  },
  {
    id: 'SC002', pod_id: 'POD-2024-0039', disease: 'Healthy',
    severity: 'Low', confidence: 97.8, scanned_at: '2024-11-27',
    region: 'Ghana - Ashanti',
    scores: { 'Healthy': 97.8, 'Black pod rot': 1.2, 'Frosty pod rot': 0.7, "Witches' broom": 0.3 },
    description: 'No signs of disease detected. Pod exhibits normal development and coloration.',
    actions: ['Continue routine monitoring schedule', 'Maintain current fertilization program'],
    history: [{ date: '2024-10-15', disease: 'Healthy', severity: 'Low' }],
  },
  {
    id: 'SC003', pod_id: 'POD-2024-0036', disease: 'Frosty pod rot',
    severity: 'Moderate', confidence: 88.5, scanned_at: '2024-11-25',
    region: 'Burkina Faso - South',
    scores: { 'Frosty pod rot': 88.5, 'Black pod rot': 7.3, "Witches' broom": 3.2, 'Healthy': 1.0 },
    description: 'Moniliophthora roreri infection in early stage. White mycelial growth visible on pod surface.',
    actions: [
      'Remove infected pods and bag for disposal',
      'Do not compost infected material',
      'Apply biological control agents',
      'Schedule follow-up scan in 7 days',
    ],
    history: [{ date: '2024-11-01', disease: 'Healthy', severity: 'Low' }],
  },
  {
    id: 'SC004', pod_id: 'POD-2024-0034', disease: "Witches' broom",
    severity: 'High', confidence: 91.3, scanned_at: '2024-11-24',
    region: 'Ivory Coast - East',
    scores: { "Witches' broom": 91.3, 'Frosty pod rot': 5.1, 'Black pod rot': 2.4, 'Healthy': 1.2 },
    description: 'Moniliophthora perniciosa infection causing broom-like vegetative growth. Advanced stage.',
    actions: [
      'Prune all infected brooms at least 30cm below infection',
      'Disinfect pruning tools between cuts',
      'Apply systemic fungicide to affected trees',
      'Flag plot for intensive monitoring',
    ],
    history: [
      { date: '2024-11-08', disease: "Witches' broom", severity: 'Moderate' },
      { date: '2024-10-19', disease: "Witches' broom", severity: 'Low' },
    ],
  },
  {
    id: 'SC005', pod_id: 'POD-2024-0031', disease: 'Black pod rot',
    severity: 'Moderate', confidence: 85.7, scanned_at: '2024-11-22',
    region: 'Guinea - Central',
    scores: { 'Black pod rot': 85.7, 'Frosty pod rot': 8.9, "Witches' broom": 3.5, 'Healthy': 1.9 },
    description: 'Early-stage Phytophthora infection. Brown lesions appearing on lower third of pod.',
    actions: [
      'Apply copper fungicide as preventative measure',
      'Improve drainage around affected trees',
      'Remove mulch near base to reduce humidity',
    ],
    history: [{ date: '2024-10-30', disease: 'Healthy', severity: 'Low' }],
  },
  {
    id: 'SC006', pod_id: 'POD-2024-0029', disease: 'Healthy',
    severity: 'Low', confidence: 96.1, scanned_at: '2024-11-20',
    region: 'Ghana - Western',
    scores: { 'Healthy': 96.1, 'Black pod rot': 2.3, 'Frosty pod rot': 1.0, "Witches' broom": 0.6 },
    description: 'Pod is healthy with no detectable pathogen signatures.',
    actions: ['Maintain current management practices', 'Continue bi-weekly scanning routine'],
    history: [{ date: '2024-10-28', disease: 'Healthy', severity: 'Low' }],
  },
  {
    id: 'SC007', pod_id: 'POD-2024-0026', disease: 'Frosty pod rot',
    severity: 'High', confidence: 93.4, scanned_at: '2024-11-19',
    region: 'Sierra Leone - East',
    scores: { 'Frosty pod rot': 93.4, 'Black pod rot': 4.2, "Witches' broom": 1.9, 'Healthy': 0.5 },
    description: 'Advanced Moniliophthora roreri. Extensive sporulation visible. High spread risk.',
    actions: [
      'Immediate removal and safe disposal of pod',
      'Quarantine a 5m radius around affected tree',
      'Apply fungicide to all pods within quarantine zone',
      'Notify field manager and log incident',
    ],
    history: [{ date: '2024-11-05', disease: 'Frosty pod rot', severity: 'Moderate' }],
  },
  {
    id: 'SC008', pod_id: 'POD-2024-0023', disease: "Witches' broom",
    severity: 'Low', confidence: 79.2, scanned_at: '2024-11-18',
    region: 'Senegal - South',
    scores: { "Witches' broom": 79.2, 'Healthy': 12.3, 'Black pod rot': 5.1, 'Frosty pod rot': 3.4 },
    description: 'Possible early indicators of Witches\' broom. Confidence moderate — recommend rescan.',
    actions: ['Schedule rescan in 5 days for confirmation', 'Mark tree for close observation'],
    history: [{ date: '2024-10-25', disease: 'Healthy', severity: 'Low' }],
  },
  {
    id: 'SC009', pod_id: 'POD-2024-0020', disease: 'Healthy',
    severity: 'Low', confidence: 98.3, scanned_at: '2024-11-16',
    region: 'Mali - South',
    scores: { 'Healthy': 98.3, 'Black pod rot': 0.9, 'Frosty pod rot': 0.5, "Witches' broom": 0.3 },
    description: 'Excellent pod condition. No anomalies detected.',
    actions: ['Continue standard monitoring', 'Record as healthy baseline'],
    history: [],
  },
  {
    id: 'SC010', pod_id: 'POD-2024-0017', disease: 'Black pod rot',
    severity: 'High', confidence: 96.8, scanned_at: '2024-11-14',
    region: 'Ivory Coast - North',
    scores: { 'Black pod rot': 96.8, 'Frosty pod rot': 2.1, "Witches' broom": 0.8, 'Healthy': 0.3 },
    description: 'Severe Phytophthora infection. Pod almost entirely necrotic. High contamination risk.',
    actions: [
      'Emergency removal — use gloves and mask',
      'Dispose off-site in sealed bags',
      'Treat entire tree with copper oxychloride',
      'Rescan all pods on this tree within 48 hours',
    ],
    history: [
      { date: '2024-11-01', disease: 'Black pod rot', severity: 'Moderate' },
      { date: '2024-10-18', disease: 'Black pod rot', severity: 'Low' },
    ],
  },
  {
    id: 'SC011', pod_id: 'POD-2024-0014', disease: 'Frosty pod rot',
    severity: 'Moderate', confidence: 82.1, scanned_at: '2024-11-12',
    region: 'Ghana - Volta',
    scores: { 'Frosty pod rot': 82.1, 'Black pod rot': 10.2, "Witches' broom": 4.8, 'Healthy': 2.9 },
    description: 'Moderate M. roreri infection with active sporulation zones.',
    actions: [
      'Remove pod carefully avoiding spore dispersal',
      'Apply systemic fungicide to remaining pods on tree',
      'Increase monitoring frequency to weekly',
    ],
    history: [{ date: '2024-10-20', disease: 'Healthy', severity: 'Low' }],
  },
  {
    id: 'SC012', pod_id: 'POD-2024-0011', disease: 'Healthy',
    severity: 'Low', confidence: 95.5, scanned_at: '2024-11-10',
    region: 'Burkina Faso - South',
    scores: { 'Healthy': 95.5, 'Frosty pod rot': 2.8, 'Black pod rot': 1.1, "Witches' broom": 0.6 },
    description: 'Pod shows healthy development. No treatment required.',
    actions: ['Maintain fertilization schedule', 'Continue standard monitoring'],
    history: [{ date: '2024-09-15', disease: 'Healthy', severity: 'Low' }],
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

  // ── State ─────────────────────────────────────────────────────────────────
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

  // ── Stats ─────────────────────────────────────────────────────────────────
  statTotal   = 0;
  statAvgConf = 0;
  statHigh    = 0;
  statHealthy = 0;

  // ── Filter options ────────────────────────────────────────────────────────
  diseaseOptions = ['Black pod rot', 'Frosty pod rot', "Witches' broom", 'Healthy'];
  severityOptions: Severity[] = ['Low', 'Moderate', 'High'];
  sortOptions = [
    { value: 'date-desc', label: 'Newest first' },
    { value: 'date-asc',  label: 'Oldest first' },
    { value: 'conf-desc', label: 'Confidence ↓' },
    { value: 'sev-desc',  label: 'Severity ↓' },
  ];

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
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

  // ── Data loading ──────────────────────────────────────────────────────────
  // TODO: Replace with real API call:
  // this.scanService.getScans(userId).subscribe({ next: ..., error: ... })
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

  // ── Stats ─────────────────────────────────────────────────────────────────
  updateStats(): void {
    this.statTotal   = this.allScans.length;
    this.statAvgConf = Math.round(
      this.allScans.reduce((s, x) => s + x.confidence, 0) / this.statTotal
    );
    this.statHigh    = this.allScans.filter(s => s.severity === 'High').length;
    this.statHealthy = this.allScans.filter(s => s.disease  === 'Healthy').length;
  }

  // ── Filtering & sorting ───────────────────────────────────────────────────
  onSearchChange(): void { this.search$.next(this.filters.search); }

  onFilterChange(): void { this.currentPage = 1; this.applyFilters(); }

  applyFilters(): void {
    const q   = this.filters.search.trim().toLowerCase();
    const sevOrder: Record<Severity, number> = { Low: 1, Moderate: 2, High: 3 };

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

  // ── Pagination ────────────────────────────────────────────────────────────
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

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || Math.abs(i - this.currentPage) <= 1)
        pages.push(i);
    }
    return pages;
  }

  showEllipsisBefore(page: number, idx: number): boolean {
    return idx > 0 && page - this.pageNumbers[idx - 1] > 1;
  }

  // ── Detail view ───────────────────────────────────────────────────────────
  openDetail(scan: CacaoScan): void {
    this.selectedScan = scan;
    this.view = 'detail';
  }

  closeDetail(): void {
    this.selectedScan = null;
    this.view = 'list';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  get sortedScores(): [string, number][] {
    if (!this.selectedScan) return [];
    return Object.entries(this.selectedScan.scores).sort((a, b) => b[1] - a[1]);
  }

  severityClass(sev: Severity | string): string {
    return { High: 'sev-high', Moderate: 'sev-mod', Low: 'sev-low' }[sev as Severity] ?? 'sev-low';
  }

  severityDotClass(sev: Severity | string): string {
    return { High: 'dot-high', Moderate: 'dot-mod', Low: 'dot-low' }[sev as Severity] ?? 'dot-low';
  }

  diseaseBarColor(disease: string): string {
    const map: Record<string, string> = {
      'Black pod rot': '#E24B4A',
      'Frosty pod rot': '#BA7517',
      "Witches' broom": '#7F77DD',
      'Healthy': '#639922',
    };
    return map[disease] ?? '#888780';
  }

  formatDate(iso: string): string {
    return new Date(iso + 'T00:00').toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  formatConf(c: number): string {
    return Math.round(c) + '%';
  }

  get rangeStart(): number { return (this.currentPage - 1) * PAGE_SIZE + 1; }
  get rangeEnd():   number { return Math.min(this.currentPage * PAGE_SIZE, this.totalScans); }


getDefaultImage(disease: string): string {
  if (!disease) return 'assets/images/mb.png';

  const d = disease.toLowerCase();

  if (d.includes('monilia') || d.includes('mb')) {
    return 'assets/images/mb.png';
  }

  if (d.includes('phytophthora') || d.includes('pb')) {
    return 'assets/images/pb.png';
  }

  if (d.includes('black pod') || d.includes('bp')) {
    return 'assets/images/bp.png';
  }

  return 'assets/images/mb.png'; // fallback default
}


}



