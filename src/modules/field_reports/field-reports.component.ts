import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FieldReportsSkeletonComponent } from '../../app/shared/skeletons/field-reports/field-reports-skeleton/field-reports-skeleton';
import { PaginationComponent } from '../../app/shared/components/pagination/pagination.component';

export type Severity = 'Mild' | 'Moderate' | 'Severe';
export type ReportStatus = 'Pending' | 'Under Review' | 'Resolved';

export interface FieldReport {
  id: string;
  timestamp: string;   // display string, e.g. "Oct 24, 09:15 AM"
  barangay: string;
  category: string;
  severity: Severity;
  status: ReportStatus;
}

interface ReportFilters {
  barangay: string;
  category: string;
  severity: Severity | '';
  date: string;
}

@Component({
  selector: 'app-field-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, FieldReportsSkeletonComponent, PaginationComponent],
  templateUrl: './field-reports-list.component.html',
})
export class FieldReportsComponent implements OnInit {

  isLoading = true;
  isSyncing = false;
  errorMsg = '';

  barangayOptions: string[] = ['San Jose', 'Poblacion', 'Sta. Maria', 'Sto. Tomas'];
  categoryOptions: string[] = ['Black Pod', 'Mealybug', 'Pod Borer'];
  severityOptions: Severity[] = ['Mild', 'Moderate', 'Severe'];

  filters: ReportFilters = { barangay: '', category: '', severity: '', date: '' };

  allReports: FieldReport[] = [];
  filteredReports: FieldReport[] = [];
  pagedReports: FieldReport[] = [];

  pageSize = 5;
  currentPage = 1;

  ngOnInit(): void {
    this.loadReports();
  }

  // ── Data loading ──────────────────────────────────────────
  loadReports(): void {
    this.isLoading = true;
    this.errorMsg = '';

    // Replace with a real API call, e.g.:
    // this.fieldReportsService.getReports().subscribe({
    //   next: (reports) => { this.allReports = reports; this.applyFilters(); this.isLoading = false; },
    //   error: () => { this.errorMsg = 'Could not load field reports.'; this.isLoading = false; }
    // });

    setTimeout(() => {
      this.allReports = this.mockReports();
      this.applyFilters();
      this.isLoading = false;
    }, 300);
  }

  private mockReports(): FieldReport[] {
    return [
      { id: 'FR-1001', timestamp: 'Oct 24, 09:15 AM', barangay: 'San Jose', category: 'Black Pod', severity: 'Severe', status: 'Pending' },
      { id: 'FR-1002', timestamp: 'Oct 24, 08:30 AM', barangay: 'Poblacion', category: 'Mealybug', severity: 'Moderate', status: 'Under Review' },
      { id: 'FR-1003', timestamp: 'Oct 23, 04:45 PM', barangay: 'Sta. Maria', category: 'Pod Borer', severity: 'Mild', status: 'Resolved' },
      { id: 'FR-1004', timestamp: 'Oct 23, 01:20 PM', barangay: 'Sto. Tomas', category: 'Black Pod', severity: 'Mild', status: 'Resolved' },
      { id: 'FR-1005', timestamp: 'Oct 22, 11:10 AM', barangay: 'San Jose', category: 'Mealybug', severity: 'Moderate', status: 'Under Review' },
      { id: 'FR-1006', timestamp: 'Oct 21, 03:05 PM', barangay: 'Poblacion', category: 'Pod Borer', severity: 'Severe', status: 'Pending' },
      { id: 'FR-1007', timestamp: 'Oct 21, 10:40 AM', barangay: 'Sta. Maria', category: 'Black Pod', severity: 'Mild', status: 'Resolved' },
    ];
  }

  // ── Filtering ──────────────────────────────────────────────
  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = { barangay: '', category: '', severity: '', date: '' };
    this.onFilterChange();
  }

  private applyFilters(): void {
    this.filteredReports = this.allReports.filter((r) => {
      const matchesBarangay = !this.filters.barangay || r.barangay === this.filters.barangay;
      const matchesCategory = !this.filters.category || r.category === this.filters.category;
      const matchesSeverity = !this.filters.severity || r.severity === this.filters.severity;
      // Date filtering intentionally omitted from mock data — wire up once timestamps are real ISO dates.
      return matchesBarangay && matchesCategory && matchesSeverity;
    });

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
  }

  // ── Sync ───────────────────────────────────────────────────
  syncData(): void {
    if (this.isSyncing) return;
    this.isSyncing = true;

    // Replace with a real sync/refetch call, e.g.:
    // this.fieldReportsService.getReports().subscribe({
    //   next: (reports) => { this.allReports = reports; this.applyFilters(); this.isSyncing = false; },
    //   error: () => { this.errorMsg = 'Sync failed.'; this.isSyncing = false; }
    // });

    setTimeout(() => {
      this.allReports = this.mockReports();
      this.applyFilters();
      this.isSyncing = false;
    }, 600);
  }

  // ── Row actions ────────────────────────────────────────────
  viewReport(report: FieldReport): void {
    // Wire up to a detail modal or route, e.g.:
    // this.router.navigate(['/field-reports', report.id]);
    console.log('View report', report.id);
  }

  // ── Style helpers ──────────────────────────────────────────
  getSeverityClass(sev: Severity): string {
    switch (sev) {
      case 'Mild':
        return 'bg-white/80 text-slate-500 border-white/40';
      case 'Moderate':
        return 'bg-emerald-600 text-white border-emerald-600';
      case 'Severe':
      default:
        return 'bg-red-50 text-red-500 border-red-100';
    }
  }

  getStatusTextClass(status: ReportStatus): string {
    switch (status) {
      case 'Pending':
        return 'text-red-500';
      case 'Under Review':
        return 'text-sky-600';
      case 'Resolved':
      default:
        return 'text-emerald-600';
    }
  }

  getStatusDotClass(status: ReportStatus): string {
    switch (status) {
      case 'Pending':
        return 'bg-red-500';
      case 'Under Review':
        return 'bg-sky-500';
      default:
        return 'bg-emerald-500';
    }
  }
}