import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PaginationComponent } from '../../app/shared/components/pagination/pagination.component';
import { FieldReportsApiService } from '../../app/core/services/api/field-reports-api.service';
import { FieldReport, ReportFilters, Severity, ReportStatus } from '../../app/shared/models';
import { ReportPreviewDialogComponent } from './report-preview-dialog.component';

@Component({
  selector: 'app-field-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ReportPreviewDialogComponent],
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

  // Options for Year and Month filters
  yearOptions: number[] = [2026, 2025, 2024, 2023, 2022];
  monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // ── Period Filter State ─────────────────────────────────────
  panelOpen = false;
  triggerLabel = 'All Time';

  currentYear = new Date().getFullYear();
  minYear = 2020; // Adjust to your earliest data year
  maxYear = this.currentYear;

  pendingYear: number = this.currentYear;
  pendingMonth: number | null = null;

  months: string[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Updated filter state with year and month
  filters = {
    address: '',
    disease_key: '',
    severity_key: '',
    year: '',
    month: ''
  };

  allReports: FieldReport[] = [];
  filteredReports: FieldReport[] = [];
  pagedReports: FieldReport[] = [];

  pageSize = 5;
  currentPage = 1;

  showReportDialog = false;

  ngOnInit(): void {
    this.cdr.markForCheck();
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // ── Period Filter Methods ───────────────────────────────────
  togglePanel(): void {
    this.panelOpen = !this.panelOpen;
    if (this.panelOpen) {
      // Initialize pending state to match currently applied filters
      this.pendingYear = this.filters.year ? parseInt(this.filters.year, 10) : this.currentYear;
      this.pendingMonth = this.filters.month ? parseInt(this.filters.month, 10) - 1 : null;
    }
    this.cdr.markForCheck();
  }

  closePanel(): void {
    this.panelOpen = false;
    this.cdr.markForCheck();
  }

  prevYear(): void {
    if (this.pendingYear > this.minYear) {
      this.pendingYear--;
      this.cdr.markForCheck();
    }
  }

  nextYear(): void {
    if (this.pendingYear < this.maxYear) {
      this.pendingYear++;
      this.cdr.markForCheck();
    }
  }

  selectMonth(index: number | null): void {
    this.pendingMonth = index;
    this.cdr.markForCheck();
  }

  applyFilter(): void {
    // 1. Update the actual filters
    this.filters.year = this.pendingYear.toString();
    this.filters.month = this.pendingMonth !== null
      ? (this.pendingMonth + 1).toString().padStart(2, '0')
      : '';

    // 2. Update the trigger label for the UI
    if (this.pendingMonth !== null) {
      this.triggerLabel = `${this.months[this.pendingMonth]} ${this.pendingYear}`;
    } else {
      this.triggerLabel = `${this.pendingYear}`;
    }

    // 3. Close panel and trigger actual data filtering
    this.closePanel();
    this.onFilterChange();
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
          this.cdr.markForCheck();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to fetch reports:', error);
          this.errorMsg = 'Could not load field reports. Please try again.';
          this.isLoading = false;
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
    this.filters = {
      address: '',
      disease_key: '',
      severity_key: '',
      year: '',
      month: ''
    };

    // Reset Date Popover UI
    this.triggerLabel = 'All Time';
    this.pendingYear = this.currentYear;
    this.pendingMonth = null;
    this.panelOpen = false;

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

      // Year & Optional Month Date Filtering logic
      const matchesDate = (() => {
        if (!this.filters.year && !this.filters.month) return true;

        // Uses created_at or date timestamp field from the report
        const reportDateRaw = r.scanned_at || (r as any).date;
        if (!reportDateRaw) return true;

        const reportDate = new Date(reportDateRaw);
        if (isNaN(reportDate.getTime())) return true;

        const reportYear = reportDate.getFullYear().toString();
        const reportMonth = (reportDate.getMonth() + 1).toString().padStart(2, '0');

        const matchesYear = !this.filters.year || reportYear === this.filters.year;
        const matchesMonth = !this.filters.month || reportMonth === this.filters.month;

        return matchesYear && matchesMonth;
      })();

      return matchesAddress && matchesCategory && matchesSeverity && matchesDate;
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
    return diseaseKey
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  formatStatus(status: ReportStatus | number | string): string {
    if (typeof status === 'number') {
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

  openReportDialog(): void {
    this.showReportDialog = true;
  }

  closeReportDialog(): void {
    this.showReportDialog = false;
  }

  get reportsForPDF(): FieldReport[] {
    return this.filteredReports.length > 0 ? this.filteredReports : this.allReports;
  }
}
