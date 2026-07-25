import { Component, OnInit, ChangeDetectorRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ScanHistoryProfileSkeletonComponent } from '../../../app/shared/skeletons/disease-guidance/scan-history-skeleton/scan-history-skeleton';
import { ChartComponent } from '../../../app/shared/components/chart/chart.component';
import { ScansApiService } from '../../../app/core/services/api/scans-api.service';
import { Scan as ApiScan } from '../../../app/shared/models/scan.model';
import { ToastService } from '../../../app/shared/components/toast/toast.service';

export type Severity = 'Mild' | 'Moderate' | 'Severe';

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
export interface ChartDatum {
  name: string;
  value: number;
}

@Component({
  selector: 'app-scan-history',
  standalone: true,
  imports: [CommonModule, ScanHistoryProfileSkeletonComponent, ChartComponent],
  templateUrl: './user_scan_history.component.html',
})
export class ScanHistoryComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private scansApi = inject(ScansApiService);
  private toast = inject(ToastService);
  private destroy$ = new Subject<void>();

  view: 'list' | 'detail' = 'list';
  isLoading = true;
  userId = 0;

  allScans: LocalScan[] = [];
  diseaseSummary: DiseaseSummary[] = [];

  kpis: DashboardKpis = {
    totalScans: 0,
    healthy: 0,
    diseased: 0,
    severeCases: 0,
    latestScanDate: null,
  };

  diseaseChartData: ChartDatum[] = [];

  private readonly DISEASE_NAMES: Record<string, string> = {
    'cacao_pod_borer': 'Cacao Pod Borer',
    'mealybug': 'Mealybug',
    'black_pod': 'Black Pod Disease',
  };

  private readonly HEALTHY_KEY = 'healthy';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId = +id;
      this.loadScans();
    } else {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadScans(): void {
    this.scansApi.getUserScans(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.allScans = (res?.data ?? []).map(s => this.mapApiScan(s));
          this.finishLoad();
        },
        error: () => {
          this.toast.show('error', 'Load Failed', 'Could not load scan history.');
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private finishLoad(): void {
    this.computeDiseaseSummary();
    this.computeKpis();
    this.computeChartData();
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
    const healthy = this.allScans.filter(s => s.disease_key === this.HEALTHY_KEY).length;
    const diseased = total - healthy;
    const severeCases = this.allScans.filter(s => s.severity === 'Severe').length;

    const latest = this.allScans.reduce<string | null>((latestSoFar, scan) => {
      if (!latestSoFar || scan.scanned_at > latestSoFar) return scan.scanned_at;
      return latestSoFar;
    }, null);

    this.kpis = {
      totalScans: total,
      healthy,
      diseased,
      severeCases,
      latestScanDate: latest,
    };
  }

  get totalDetections(): number {
    return this.allScans.length;
  }

  private computeChartData(): void {
    this.diseaseChartData = this.diseaseSummary
      .map(d => ({ name: d.diseaseName, value: d.count }))
      .sort((a, b) => b.value - a.value);
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
