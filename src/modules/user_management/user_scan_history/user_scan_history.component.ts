import { Component, OnInit, ChangeDetectorRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ScanHistoryProfileSkeletonComponent } from '../../../app/shared/skeletons/disease-guidance/scan-history-skeleton/scan-history-skeleton';
import { PaginationComponent } from '../../../app/shared/components/pagination/pagination.component';
import { ScanDetailModalComponent } from './modal/scan-detail-modal.component';
import { ScansApiService } from '../../../app/core/services/api/scans-api.service';
import { UsersApiService } from '../../../app/core/services/api/users-api.service';
import { Scan as ApiScan } from '../../../app/shared/models/scan.model';
import { ToastService } from '../../../app/shared/components/toast/toast.service';

export type Severity = 'Mild' | 'Moderate' | 'Severe';
export type ScanStatus = 'complete' | 'failed';

export interface LocalScan {
  id: number;
  disease: string;
  disease_key: string;
  pod_id: string;
  severity: Severity;
  severity_key: string;
  confidence: number;
  scanned_at: string;
  location: string;
  status: ScanStatus;
}

export interface FarmerProfile {
  name: string;
  address: string;
  totalScans: number;
}

export interface DiseaseSummary {
  diseaseKey: string;
  diseaseName: string;
  count: number;
  latestDate: string;
  severities: string[];
}

interface ScanFilters {
  search: string;
  disease: string;
  severity: string;
}

@Component({
  selector: 'app-scan-history',
  standalone: true,
  imports: [CommonModule, FormsModule, ScanHistoryProfileSkeletonComponent, PaginationComponent, ScanDetailModalComponent],
  templateUrl: './user_scan_history.component.html',
})
export class ScanHistoryComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scansApi = inject(ScansApiService);
  private usersApi = inject(UsersApiService);
  private toast = inject(ToastService);
  private destroy$ = new Subject<void>();

  view: 'list' | 'detail' = 'list';
  isLoading = true;
  errorMsg = '';

  userId = 0;

  profile: FarmerProfile = {
    name: '',
    address: '',
    totalScans: 0,
  };

  filters: ScanFilters = { search: '', disease: '', severity: '' };
  filterPanelOpen = false;

  diseaseOptions: string[] = [];
  severityOptions: Severity[] = ['Mild', 'Moderate', 'Severe'];

  allScans: LocalScan[] = [];
  filteredScans: LocalScan[] = [];
  pagedScans: LocalScan[] = [];
  diseaseSummary: DiseaseSummary[] = [];

  pageSize = 10;
  currentPage = 1;

  selectedScan: LocalScan | null = null;

  private readonly DISEASE_NAMES: Record<string, string> = {
    'cacao_pod_borer': 'Cacao Pod Borer',
    'mealybug': 'Mealybug',
    'black_pod': 'Black Pod',
    'cocoa_swollen_shoot_virus': 'Cocoa Swollen Shoot Virus',
    'phytophthora': 'Phytophthora',
    'capsid_bug': 'Capsid Bug',
    'mirid': 'Mirid',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      this.loadUserData();
    } else {
      this.errorMsg = 'No user ID provided';
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.usersApi.getUserById(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          if (user) {
            this.profile = {
              name: user.name,
              address: user.address || 'N/A',
              totalScans: user.total_scans ?? 0,
            };
            this.cdr.markForCheck();
          }
          this.loadScans();
        },
        error: () => {
          this.loadScans();
        },
      });
  }

  private loadScans(): void {
    this.scansApi.getUserScans(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.allScans = (res?.data ?? []).map(s => this.mapApiScan(s));
          this.profile.totalScans = res?.count ?? this.allScans.length;
          this.finishLoad();
        },
        error: () => {
          this.errorMsg = 'Failed to load scan data';
          this.toast.show('error', 'Load Failed', 'Could not load scan history.');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private finishLoad(): void {
    this.buildDiseaseOptions();
    this.computeDiseaseSummary();
    this.applyFilters();
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private mapApiScan(s: ApiScan): LocalScan {
    return {
      id: s.id,
      disease: this.diseaseDisplayName(s.disease_key),
      disease_key: s.disease_key,
      pod_id: s.local_id,
      severity: this.capitalizeSeverity(s.severity_key),
      severity_key: s.severity_key,
      confidence: s.confidence,
      scanned_at: s.scanned_at,
      location: s.location_label || s.user_address || 'N/A',
      status: s.status === 1 ? 'complete' : 'failed',
    };
  }

  diseaseDisplayName(key: string): string {
    return this.DISEASE_NAMES[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  private capitalizeSeverity(key: string): Severity {
    const lower = key?.toLowerCase();
    if (lower === 'severe') return 'Severe';
    if (lower === 'moderate') return 'Moderate';
    return 'Mild';
  }

  private buildDiseaseOptions(): void {
    const keys = [...new Set(this.allScans.map(s => s.disease))];
    this.diseaseOptions = keys.sort();
  }

  private computeDiseaseSummary(): void {
    const map = new Map<string, DiseaseSummary>();

    for (const scan of this.allScans) {
      const key = scan.disease;
      if (!map.has(key)) {
        map.set(key, {
          diseaseKey: scan.disease_key,
          diseaseName: scan.disease,
          count: 0,
          latestDate: scan.scanned_at,
          severities: [],
        });
      }
      const entry = map.get(key)!;
      entry.count++;
      entry.severities.push(scan.severity);
      if (scan.scanned_at > entry.latestDate) {
        entry.latestDate = scan.scanned_at;
      }
    }

    this.diseaseSummary = [...map.values()].sort((a, b) => b.count - a.count);
  }

  getDominantSeverity(severities: string[]): string {
    const counts = new Map<string, number>();
    for (const s of severities) {
      counts.set(s, (counts.get(s) || 0) + 1);
    }
    let max = 0;
    let dominant = 'Mild';
    for (const [sev, count] of counts) {
      if (count > max) {
        max = count;
        dominant = sev;
      }
    }
    return dominant;
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
    this.cdr.markForCheck();
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

  goToPage(p: number): void {
    this.currentPage = p;
    this.updatePagedScans();
  }

  // ── Detail Modal Interactions ──────────────────────────────
  viewScan(scan: LocalScan): void {
    this.selectedScan = scan;
  }

  closeDetail(): void {
    this.selectedScan = null;
  }

  get sortedScores(): [string, number][] {
    return [];
  }

  // ── Navigation ─────────────────────────────────────────────
  goBack(): void {
    this.router.navigate(['/dashboard/user-management']);
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
    a.download = `scan-history-${this.profile.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Formatters ─────────────────────────────────────────────
  formatDate(iso: string): string {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatConf(value: number): string {
    return value?.toFixed(1) ?? '0';
  }
}
