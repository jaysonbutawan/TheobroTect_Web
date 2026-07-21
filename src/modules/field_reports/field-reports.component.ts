import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from '../../app/shared/components/pagination/pagination.component';
import { FieldReportsApiService } from '../../app/core/services/api/field-reports-api.service';
import { FieldReport, ReportFilters, Severity, ReportStatus } from '../../app/shared/models';

@Component({
  selector: 'app-field-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './field-reports-list.component.html',
})
export class FieldReportsComponent implements OnInit, OnDestroy {
  private reportsApi = inject(FieldReportsApiService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;
  isSyncing = false;
  errorMsg = '';

  barangayOptions: string[] = [
    'Dacudao',
    'Datu Balong',
    'Igangon',
    'Kipalili',
    'Libuton',
    'Linao',
    'Mamangan',
    'Monte Dujali',
    'Pinamuno',
    'Sabangan',
    'San Miguel',
    'Santo Niño',
    'Poblacion'
  ];

  categoryOptions: string[] = ['Black Pod Disease', 'Mealybug', 'Cacao Pod Borer'];
  severityOptions: Severity[] = ['Mild', 'Moderate', 'Severe'];

  filters: ReportFilters = { address: '', disease_key: '', severity_key: '', date: '' };

  allReports: FieldReport[] = [];
  filteredReports: FieldReport[] = [];
  pagedReports: FieldReport[] = [];

  pageSize = 5;
  currentPage = 1;

  ngOnInit(): void {
    this.cdr.markForCheck();
    this.loadReports();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // ── Data loading ──────────────────────────────────────────
  loadReports(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.reportsApi.getReports()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allReports = response.data || [];

          // 1. Logs the raw object so you can expand it
          console.log('Raw Field Reports Data:', this.allReports);

          // 2. Logs it as a beautiful grid (field by field)
          console.table(this.allReports);

          this.cdr.markForCheck();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to fetch reports:', error); // Log the error too!
          this.errorMsg = 'Could not load field reports. Please try again.';
          this.isLoading = false;
          // Fallback to empty array
          this.allReports = [];
          this.cdr.markForCheck();
          this.applyFilters();
        }
      });
  }
  // ── Filtering ──────────────────────────────────────────────
  onFilterChange(): void {
    this.currentPage = 1;
    this.cdr.markForCheck();
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = { address: '', disease_key: '', severity_key: '', date: '' };
    this.onFilterChange();
  }

  private applyFilters(): void {
    this.filteredReports = this.allReports.filter((r) => {
      const matchesAddress = !this.filters.address || r.user_address === this.filters.address;
      const matchesCategory =
        !this.filters?.disease_key ||
        r?.disease_key?.toLowerCase().includes(this.filters.disease_key.toLowerCase()) ||
        this.filters.disease_key.toLowerCase().includes(r?.disease_key?.toLowerCase() ?? '');
      const matchesSeverity = !this.filters.severity_key || r.severity_key === this.filters.severity_key;
      // Date filtering intentionally omitted from mock data — wire up once timestamps are real ISO dates.
      return matchesAddress && matchesCategory && matchesSeverity;
    });
    this.cdr.markForCheck();
    this.updatePagedReports();
  }

  // ── Pagination ─────────────────────────────────────────────
  private updatePagedReports(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedReports = this.filteredReports.slice(start, start + this.pageSize);
  }

  get totalReports(): number {
    return this.filteredReports.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalReports / this.pageSize));
  }

  get pageStart(): number {
    return this.totalReports === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalReports);
  }

  goToPage(p: number): void {
    this.currentPage = p;
    this.updatePagedReports();
    this.cdr.markForCheck();
  }

  // ── Sync ───────────────────────────────────────────────────
  syncData(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;

    this.reportsApi.getReports()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allReports = response.data || [];
          this.applyFilters();
          this.isSyncing = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.errorMsg = 'Sync failed.';
          this.isSyncing = false;
          this.cdr.markForCheck();
        }
      });
  }

  viewReport(report: FieldReport): void {
    this.router.navigate(['/dashboard/field-reports', report.id]);
  }

  formatDiseaseKey(diseaseKey: string): string {
    if (!diseaseKey) return 'Unknown';
    // Convert snake_case or kebab-case to Title Case
    return diseaseKey
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  formatStatus(status: ReportStatus | number | string): string {
    if (typeof status === 'number') {
      // Map numeric status to string
      switch (status) {
        case 0: return 'Pending';
        case 1: return 'Under Review';
        case 2: return 'Resolved';
        default: return 'Unknown';
      }
    }
    return status as string;
  }

  getSeverityClass(sev: Severity): string {
    switch (sev) {
      case 'Mild':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Moderate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Severe':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  getStatusTextClass(status: ReportStatus | number | string): string {
    const statusStr = this.formatStatus(status);
    switch (statusStr) {
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

  getStatusDotClass(status: ReportStatus | number | string): string {
    const statusStr = this.formatStatus(status);
    switch (statusStr) {
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
}
