import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FieldReportsApiService } from '../../app/core/services/api/field-reports-api.service';
import { FieldReport, ReportStatus } from '../../app/shared/models';

@Component({
  selector: 'app-field-report-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto flex flex-col gap-6 font-['DM_Sans',sans-serif] text-slate-900">
      <div>
        <button
          (click)="goBack()"
          class="text-sm text-slate-500 hover:text-slate-900 hover:underline focus-visible:outline-2 focus-visible:outline-green-700"
        >
          Back to field reports
        </button>
      </div>

      @if (isLoading) {
        <div class="flex flex-col gap-6 animate-pulse" role="status" aria-label="Loading report">
          <div class="h-24 rounded-2xl border border-slate-200 bg-white"></div>
          <div class="h-64 rounded-2xl border border-slate-200 bg-white"></div>
        </div>
      } @else if (errorMsg) {
        <div class="rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
          <p class="m-0 text-sm font-medium text-red-700">{{ errorMsg }}</p>
          <button
            (click)="goBack()"
            class="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
          >
            Back to field reports
          </button>
        </div>
      } @else if (report) {
        <header class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight m-0">
                {{ getDisplayDisease() }}
              </h1>
              <p class="text-sm text-slate-500 m-0 mt-1">
                Scanned {{ report.scanned_at | date: 'MMMM d, y' }} at
                {{ report.scanned_at | date: 'h:mm a' }}
              </p>
            </div>
            @if (!isHealthyReport()) {
              <span
                class="px-2.5 py-1 text-sm font-medium border rounded-md"
                [ngClass]="{
                  'bg-red-50 text-red-700 border-red-100': report.severity_key === 'Severe',
                  'bg-amber-50 text-amber-700 border-amber-100': report.severity_key === 'Moderate',
                  'bg-green-50 text-green-700 border-green-100': report.severity_key === 'Mild',
                }"
              >
                {{ report.severity_key }} severity
              </span>
            } @else {
              <span
                class="px-2.5 py-1 text-sm font-medium border rounded-md bg-green-50 text-green-700 border-green-100"
              >
                No disease found
              </span>
            }
          </div>
        </header>

        <section class="bg-white rounded-2xl border border-slate-200">
          <div class="px-5 sm:px-6 py-4 border-b border-slate-200">
            <h2 class="text-lg font-semibold m-0">Scan details</h2>
          </div>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 m-0 px-5 sm:px-6 py-5 text-sm">
            @if (report.user_name) {
              <div>
                <dt class="text-slate-500">Farmer</dt>
                <dd class="m-0 mt-0.5 font-medium">{{ report.user_name }}</dd>
              </div>
            }
            <div>
              <dt class="text-slate-500">Barangay</dt>
              <dd class="m-0 mt-0.5 font-medium">{{ report.user_address || 'Not recorded' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">Confidence</dt>
              <dd class="m-0 mt-0.5 font-medium">{{ report.confidence * 100 | number: '1.0-1' }}%</dd>
            </div>
            <div>
              <dt class="text-slate-500">Status</dt>
              <dd class="m-0 mt-0.5 font-medium">{{ statusLabel() }}</dd>
            </div>
            @if (hasCoordinates()) {
              <div>
                <dt class="text-slate-500">Coordinates</dt>
                <dd class="m-0 mt-0.5 font-medium">
                  {{ report.location_lat | number: '1.5-5' }}, {{ report.location_lng | number: '1.5-5' }}
                </dd>
              </div>
            }
            @if (report.location_label) {
              <div>
                <dt class="text-slate-500">Location note</dt>
                <dd class="m-0 mt-0.5 font-medium">{{ report.location_label }}</dd>
              </div>
            }
          </dl>
        </section>

        <div class="flex flex-wrap gap-3">
          @if (hasCoordinates()) {
            <button
              (click)="viewOnMap()"
              class="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-green-700"
            >
              View on map
            </button>
          }
          <button
            (click)="goBack()"
            class="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-green-700"
          >
            Back to list
          </button>
        </div>
      }
    </div>
  `,
})
export class FieldReportDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportsApi = inject(FieldReportsApiService);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  report: FieldReport | null = null;
  isLoading = true;
  errorMsg = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMsg = 'Invalid report ID';
      this.isLoading = false;
      return;
    }
    this.loadReport(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadReport(id: string): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.reportsApi
      .getReportById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const wrapped = response as unknown as { data?: FieldReport };
          this.report = wrapped.data && !Array.isArray(wrapped.data) ? wrapped.data : response;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMsg = 'Failed to load report details. The report may not exist.';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  statusLabel(): string {
    const status: ReportStatus | number | string | undefined = this.report?.status;
    if (typeof status === 'number') return ['Pending', 'Under Review', 'Resolved'][status] ?? 'Unknown';
    return status || 'Unknown';
  }

  hasCoordinates(): boolean {
    return !!this.report?.location_lat && !!this.report?.location_lng;
  }

  viewOnMap(): void {
    if (this.report && this.hasCoordinates()) {
      this.router.navigate(['/dashboard/heatmap'], {
        queryParams: {
          loc: `${this.report.location_lat},${this.report.location_lng}`,
        },
      });
    }
  }

  isHealthyReport(): boolean {
    if (!this.report?.disease_key) return true;
    const key = this.report.disease_key.toLowerCase().replace(/_/g, ' ').trim();
    return key.includes('healthy') || key.includes('normal') || key.includes('no disease');
  }

  getDisplayDisease(): string {
    if (!this.report) return '';
    if (this.isHealthyReport()) return 'Healthy cacao';
    return this.report.disease_key
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  goBack(): void {
    this.router.navigate(['/dashboard/field-reports']);
  }
}
