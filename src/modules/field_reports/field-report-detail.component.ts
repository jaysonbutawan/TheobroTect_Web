import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FieldReportsApiService } from '../../app/core/services/api/field-reports-api.service';
import { FieldReport, Severity, ReportStatus } from '../../app/shared/models';

@Component({
  selector: 'app-field-report-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="p-4 sm:p-6 md:p-10 bg-transparent min-h-screen font-sans select-none">

  <!-- Loading State -->
  @if (isLoading) {
    <div class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D683A]"></div>
    </div>
  }

  <!-- Error State -->
  @if (errorMsg && !isLoading) {
    <div class="max-w-2xl mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p class="text-red-600 font-semibold">{{ errorMsg }}</p>
        <button
          (click)="goBack()"
          class="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  }

  <!-- Detail View -->
  @if (report && !isLoading) {
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <button
          (click)="goBack()"
          class="flex items-center gap-2 px-4 py-2 bg-[#f1f5f9] text-slate-700 rounded-xl font-semibold hover:bg-[#e2e8f0] transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <h1 class="text-2xl font-black text-slate-800">Field Report Details</h1>
        <div class="w-20"></div> <!-- Spacer for centering -->
      </div>

      <!-- Report Card -->
      <div class="bg-[#f8fafc] rounded-[2rem] shadow-[10px_10px_20px_rgba(0,0,0,0.05),inset_4px_4px_10px_rgba(255,255,255,1),inset_-4px_-4px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <!-- Header Section -->
        <div class="bg-gradient-to-r from-[#3D683A] to-[#2d4f2a] p-6 text-white">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-black mb-2">{{ report.disease_key }}</h2>
              <p class="text-white/80 text-sm">{{ report.user_address }}</p>
            </div>
            <div class="text-right">
              <span
                [class]="getSeverityBadgeClass(report.severity_key)"
                class="inline-block px-4 py-1.5 rounded-full text-xs font-bold"
              >
                {{ report.severity_key }}
              </span>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="p-6 space-y-6">
          <!-- Status and Date Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Scanned Date</label>
              <p class="text-base font-bold text-slate-700">{{ report.scanned_at | date:'MMM d, y, h:mm a' }}</p>
            </div>
          </div>

          <!-- Location -->
          @if (report.user_address) {
            <div class="space-y-2">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Location</label>
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-[#3D683A] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div>
                  <p class="text-base font-bold text-slate-700">{{ report.user_address }}</p>
                </div>
              </div>
            </div>
          }

          <!-- Metadata -->
          <div class="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            @if (report.scanned_at) {
              <div>
                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">Scanned</label>
                <p class="text-sm text-slate-600">{{ report.scanned_at | date:'MMM d, y, h:mm a' }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        @if (report.user_address) {
          <button
            (click)="viewOnMap()"
            class="px-6 py-3 bg-[#3D683A] text-white rounded-xl font-semibold hover:bg-[#2d4f2a] transition-colors shadow-lg"
          >
            View on Map
          </button>
        }
        <button
          (click)="goBack()"
          class="px-6 py-3 bg-[#f1f5f9] text-slate-700 rounded-xl font-semibold hover:bg-[#e2e8f0] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  }
</div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
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
    this.cdr.markForCheck();
    this.loadReport(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadReport(id: string): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.reportsApi.getReportById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (report) => {
          this.report = report;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.errorMsg = 'Failed to load report details. The report may not exist.';
          this.isLoading = false;
          this.cdr.markForCheck();
          console.error('Error loading report:', error);
        }
      });
  }

  getSeverityBadgeClass(severity: Severity): string {
    switch (severity) {
      case 'Mild':
        return 'bg-yellow-400/20 text-yellow-100 border border-yellow-300/30';
      case 'Moderate':
        return 'bg-orange-400/20 text-orange-100 border border-orange-300/30';
      case 'Severe':
        return 'bg-red-400/20 text-red-100 border border-red-300/30';
      default:
        return 'bg-gray-400/20 text-gray-100 border border-gray-300/30';
    }
  }

  getStatusTextClass(status: ReportStatus): string {
    switch (status) {
      case 'Pending':
        return 'text-red-600';
      case 'Under Review':
        return 'text-sky-600';
      case 'Resolved':
        return 'text-emerald-600';
      default:
        return 'text-slate-600';
    }
  }

  getStatusDotClass(status: ReportStatus): string {
    switch (status) {
      case 'Pending':
        return 'bg-red-500';
      case 'Under Review':
        return 'bg-sky-500';
      case 'Resolved':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  }

  viewOnMap(): void {
    if (this.report?.location_lat && this.report?.location_lng) {
      this.router.navigate(['/dashboard/heatmap'], {
        queryParams: {
          loc: `${this.report.location_lat},${this.report.location_lng}`
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/field-reports']);
  }
}
