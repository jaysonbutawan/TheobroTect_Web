import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiseaseDto } from '../disease-guidance.dto';
import { PaginationComponent } from '../../../app/shared/components/pagination/pagination.component';
import { ConfirmationDialogComponent } from '../../../app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-disease-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ConfirmationDialogComponent],
  template: `
    <section class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-200"
      >
        <h2 class="text-lg font-semibold m-0">
          {{ filteredRecords.length }} {{ filteredRecords.length === 1 ? 'disease' : 'diseases' }}
        </h2>

        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="search"
            [(ngModel)]="searchQuery"
            (ngModelChange)="currentPage = 1"
            placeholder="Search diseases"
            aria-label="Search diseases"
            class="block w-full sm:w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-green-700"
          />
          <select
            [(ngModel)]="filterLocale"
            (ngModelChange)="currentPage = 1"
            aria-label="Filter by detection label"
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus-visible:outline-2 focus-visible:outline-green-700"
          >
            <option value="">All labels</option>
            @for (key of diseaseKeys; track key) {
              <option [value]="key">{{ formatLabel(key) }}</option>
            }
          </select>
        </div>
      </div>

      <div
        class="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500"
      >
        <span class="md:col-span-4">Disease</span>
        <span class="md:col-span-3">Detection label</span>
        <span class="md:col-span-2">Created</span>
        <span class="md:col-span-3 text-right">Actions</span>
      </div>

      <div class="divide-y divide-slate-100">
        @for (disease of pagedRecords; track disease.id) {
          <div class="px-4 sm:px-6 py-4 md:grid md:grid-cols-12 md:gap-4 md:items-center text-sm">
            <div class="md:col-span-4 min-w-0">
              <p class="m-0 font-medium text-slate-900">{{ disease.display_name.en || 'Unnamed' }}</p>
              <p class="m-0 mt-0.5 text-xs text-slate-500">{{ disease.display_name.tl || 'No Filipino name' }}</p>
            </div>

            <p class="md:col-span-3 m-0 mt-2 md:mt-0 text-slate-600">{{ formatLabel(disease.disease_key) }}</p>

            <p class="md:col-span-2 m-0 mt-1 md:mt-0 text-slate-600">
              {{ disease.created_at ? (disease.created_at | date: 'MMM d, y') : 'Not recorded' }}
            </p>

            <div class="md:col-span-3 flex items-center gap-5 mt-3 md:mt-0 md:justify-end">
              <button
                type="button"
                (click)="onTableViewDisease(disease)"
                class="font-medium text-green-700 hover:underline focus-visible:outline-2 focus-visible:outline-green-700"
              >
                View
              </button>
              <button
                type="button"
                (click)="onTableEditDisease(disease)"
                class="font-medium text-slate-700 hover:underline focus-visible:outline-2 focus-visible:outline-green-700"
              >
                Edit
              </button>
              <button
                type="button"
                (click)="onTableDeleteDisease(disease)"
                class="text-slate-500 hover:text-red-600 hover:underline focus-visible:outline-2 focus-visible:outline-green-700"
              >
                Delete
              </button>
            </div>
          </div>
        } @empty {
          <div class="py-14 px-6 text-center">
            <h3 class="text-base font-semibold m-0">No diseases found</h3>
            <p class="text-sm text-slate-500 mt-1 mb-0">
              Try a different search or label, or add a disease to get started.
            </p>
          </div>
        }
      </div>

      @if (filteredRecords.length > 0) {
        <div class="border-t border-slate-200">
          <app-pagination
            variant="compact"
            [currentPage]="currentPage"
            [totalPages]="totalPages"
            [pageStart]="pageStart"
            [pageEnd]="pageEnd"
            [totalItems]="filteredRecords.length"
            itemLabel="diseases"
            (pageChange)="onPageChange($event)"
          />
        </div>
      }
    </section>

    <app-confirmation-dialog
      [isOpen]="pendingDeleteDisease !== null"
      title="Delete disease guidance"
      [message]="
        'Are you sure you want to delete ' +
        (pendingDeleteDisease?.display_name?.en || 'this disease') +
        '? This action cannot be undone.'
      "
      cancelText="Cancel"
      confirmText="Delete"
      confirmButtonClass="bg-red-600 hover:bg-red-700"
      (confirm)="confirmDelete()"
      (cancel)="cancelDelete()"
    />
  `,
})
export class DiseaseTableComponent {
  @Input() existingRecords: DiseaseDto[] = [];
  @Input() diseaseKeys: string[] = [];
  @Input() pageSize = 10;

  @Output() view = new EventEmitter<DiseaseDto>();
  @Output() edit = new EventEmitter<DiseaseDto>();
  @Output() deleteConfirmed = new EventEmitter<number>();

  searchQuery: string = '';
  filterLocale: string = '';
  currentPage = 1;

  pendingDeleteDisease: DiseaseDto | null = null;

  get filteredRecords(): DiseaseDto[] {
    return this.existingRecords.filter((disease) => {
      const query = this.searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (disease.display_name?.en ?? '').toLowerCase().includes(query) ||
        (disease.display_name?.tl ?? '').toLowerCase().includes(query) ||
        (disease.disease_key ?? '').toLowerCase().includes(query);

      const matchesLocale = !this.filterLocale || disease.disease_key === this.filterLocale;
      return matchesSearch && matchesLocale;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRecords.length / this.pageSize));
  }

  get pageStart(): number {
    return this.filteredRecords.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredRecords.length);
  }

  get pagedRecords(): DiseaseDto[] {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRecords.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  formatLabel(key: string): string {
    if (!key) return '';
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  onTableViewDisease(disease: DiseaseDto): void {
    this.view.emit(disease);
  }

  onTableEditDisease(disease: DiseaseDto): void {
    this.edit.emit(disease);
  }

  onTableDeleteDisease(disease: DiseaseDto): void {
    this.pendingDeleteDisease = disease;
  }

  cancelDelete(): void {
    this.pendingDeleteDisease = null;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteDisease) return;

    this.deleteConfirmed.emit(this.pendingDeleteDisease.id);
    this.pendingDeleteDisease = null;
  }
}
