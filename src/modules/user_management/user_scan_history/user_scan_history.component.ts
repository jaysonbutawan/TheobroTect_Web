import { Component, OnInit, ChangeDetectorRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, forkJoin, of, takeUntil } from 'rxjs';
import { PaginationComponent } from '../../../app/shared/components/pagination/pagination.component';
import { ScansApiService } from '../../../app/core/services/api/scans-api.service';
import { UsersApiService } from '../../../app/core/services/api/users-api.service';
import { Scan as ApiScan } from '../../../app/shared/models/scan.model';
import { User } from '../../../app/shared/models/user.model';
import { Severity } from '../../../app/shared/models/common.model';
import { ToastService } from '../../../app/shared/components/toast/toast.service';
import { DISEASE_COLORS } from '../../dashboard/widgets/chart-config';

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
  lat: number | null;
  lng: number | null;
}

export interface DiseaseSummary {
  diseaseKey: string;
  diseaseName: string;
  count: number;
  mild: number;
  moderate: number;
  severe: number;
  latestDate: string;
  percentage: number;
}

export interface DashboardKpis {
  totalScans: number;
  healthy: number;
  diseased: number;
  severeCases: number;
  latestScanDate: string | null;
}

@Component({
  selector: 'app-scan-history',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
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

  isLoading = true;
  userId = 0;
  user: User | null = null;

  allScans: LocalScan[] = [];
  pagedScans: LocalScan[] = [];
  diseaseSummary: DiseaseSummary[] = [];

  pageSize = 10;
  currentPage = 1;

  kpis: DashboardKpis = {
    totalScans: 0,
    healthy: 0,
    diseased: 0,
    severeCases: 0,
    latestScanDate: null,
  };

  private readonly DISEASE_NAMES: Record<string, string> = {
    cacao_pod_borer: 'Cacao Pod Borer',
    mealybug: 'Mealybug',
    black_pod: 'Black Pod Disease',
  };

  private readonly HEALTHY_KEY = 'healthy';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      this.load();
    } else {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(): void {
    forkJoin({
      users: this.usersApi.getUsers().pipe(catchError(() => of(null))),
      scans: this.scansApi.getUserScans(this.userId),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ users, scans }) => {
          this.user = users?.data?.find((u) => u.id === this.userId) ?? null;

          // The endpoint filters by user, but keep only this user's scans in case it does not.
          this.allScans = (scans?.data ?? [])
            .filter((s) => !s.user_id || s.user_id === this.userId)
            .map((s) => this.mapApiScan(s))
            .sort((a, b) => b.scanned_at.localeCompare(a.scanned_at));

          this.computeDiseaseSummary();
          this.computeKpis();
          this.updatePagedScans();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.toast.show('error', 'Load Failed', 'Could not load scan history.');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private mapApiScan(s: ApiScan): LocalScan {
    const lat = Number(s.location_lat);
    const lng = Number(s.location_lng);
    const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);

    return {
      id: s.id,
      disease: this.diseaseDisplayName(s.disease_key),
      disease_key: s.disease_key,
      pod_id: s.local_id,
      severity: this.capitalizeSeverity(s.severity_key),
      severity_key: s.severity_key,
      confidence: s.confidence,
      scanned_at: s.scanned_at,
      location: s.location_label || s.user_address || 'Not recorded',
      lat: hasCoords ? lat : null,
      lng: hasCoords ? lng : null,
    };
  }

  diseaseDisplayName(key: string): string {
    return (
      this.DISEASE_NAMES[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    );
  }

  diseaseColor(key: string): string {
    const k = (key || '').toLowerCase().replace(/[-_\s]/g, '');
    if (k.includes('healthy')) return DISEASE_COLORS.healthy.primary;
    if (k.includes('blackpod')) return DISEASE_COLORS.blackPod.primary;
    if (k.includes('mealybug')) return DISEASE_COLORS.mealybug.primary;
    if (k.includes('podborer')) return DISEASE_COLORS.podBorer.primary;
    return '#64748b';
  }

  private capitalizeSeverity(key: string): Severity {
    const lower = key?.toLowerCase();
    if (lower === 'severe') return 'Severe';
    if (lower === 'moderate') return 'Moderate';
    return 'Mild';
  }

  private computeDiseaseSummary(): void {
    const map = new Map<string, DiseaseSummary>();
    const total = this.allScans.length;

    for (const scan of this.allScans) {
      const key = scan.disease;
      if (!map.has(key)) {
        map.set(key, {
          diseaseKey: scan.disease_key,
          diseaseName: scan.disease,
          count: 0,
          mild: 0,
          moderate: 0,
          severe: 0,
          latestDate: scan.scanned_at,
          percentage: 0,
        });
      }
      const entry = map.get(key)!;
      entry.count++;

      if (scan.severity === 'Mild') entry.mild++;
      else if (scan.severity === 'Moderate') entry.moderate++;
      else if (scan.severity === 'Severe') entry.severe++;

      if (scan.scanned_at > entry.latestDate) {
        entry.latestDate = scan.scanned_at;
      }
    }

    for (const entry of map.values()) {
      entry.percentage = total === 0 ? 0 : Math.round((entry.count / total) * 1000) / 10;
    }

    this.diseaseSummary = [...map.values()].sort((a, b) => b.count - a.count);
  }

  private computeKpis(): void {
    const total = this.allScans.length;
    const healthy = this.allScans.filter((s) => s.disease_key === this.HEALTHY_KEY).length;

    this.kpis = {
      totalScans: total,
      healthy,
      diseased: total - healthy,
      severeCases: this.allScans.filter((s) => s.severity === 'Severe').length,
      latestScanDate: this.allScans[0]?.scanned_at ?? null,
    };
  }

  private updatePagedScans(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedScans = this.allScans.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.allScans.length / this.pageSize));
  }

  get pageStart(): number {
    return this.allScans.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.allScans.length);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagedScans();
  }

  viewOnMap(scan: LocalScan): void {
    if (scan.lat === null || scan.lng === null) return;
    this.router.navigate(['/dashboard/heatmap'], { queryParams: { loc: `${scan.lat},${scan.lng}` } });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/user-management']);
  }

  formatDate(iso: string): string {
    if (!iso) return 'N/A';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
}
