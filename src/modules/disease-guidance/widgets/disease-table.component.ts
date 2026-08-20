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
    <div class="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="relative w-full sm:max-w-sm">
        <svg
          class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          [(ngModel)]="searchQuery"
          (ngModelChange)="currentPage = 1"
          placeholder="Search diseases"
          aria-label="Search diseases"
          class="min-h-11 w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 sm:text-sm"
        />
      </div>

      <div class="relative w-full sm:w-60 sm:flex-shrink-0">
        <button
          type="button"
          (click)="isFilterDropdownOpen = !isFilterDropdownOpen"
          class="flex min-h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-green-600 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
          [attr.aria-expanded]="isFilterDropdownOpen"
          aria-haspopup="listbox"
        >
          <span class="truncate">{{
            filterLocale ? formatLabel(filterLocale) : 'All Disease Types'
          }}</span>
          <svg
            class="transition-transform duration-300 shrink-0 ml-2 text-slate-400"
            [class.-rotate-180]="isFilterDropdownOpen"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        @if (isFilterDropdownOpen) {
          <div
            class="absolute right-0 z-50 mt-2 flex w-full origin-top flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
            role="listbox"
          >
            <ul class="max-h-64 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
              <li>
                <button
                  type="button"
                  (click)="onFilterSelect('')"
                  class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-colors text-left"
                  [ngClass]="
                    !filterLocale
                      ? 'bg-green-50 text-green-600'
                      : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                  "
                >
                  <span class="truncate">All Disease Types</span>
                  @if (!filterLocale) {
                    <svg
                      class="w-4 h-4 text-green-600 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  }
                </button>
              </li>

              @for (key of diseaseKeys; track key) {
                <li>
                  <button
                    type="button"
                    (click)="onFilterSelect(key)"
                    class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-colors text-left"
                    [ngClass]="
                      filterLocale === key
                        ? 'bg-green-50 text-green-600'
                        : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                    "
                  >
                    <span class="truncate">{{ formatLabel(key) }}</span>
                    @if (filterLocale === key) {
                      <svg
                        class="w-4 h-4 text-green-600 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    }
                  </button>
                </li>
              }
            </ul>
          </div>
        }
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 md:p-6">
      <div class="hidden md:grid md:grid-cols-12 gap-4 px-6 pb-4 border-b border-gray-200 mb-4">
        <div class="md:col-span-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
          Disease Name
        </div>
        <div class="md:col-span-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
          Disease Key
        </div>
        <div class="md:col-span-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
          Created At
        </div>
        <div
          class="md:col-span-3 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right"
        >
          Actions
        </div>
      </div>

      <div class="flex flex-col gap-4 md:gap-3">
        @for (disease of pagedRecords; track disease.id) {
          <div
            class="group flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-5 md:px-6 md:py-4 bg-white rounded-lg md:items-center border border-gray-200 transition-all duration-300 hover:border-green-200 hover:shadow-sm"
          >
            <div class="md:col-span-4">
              <p class="text-base md:text-sm font-black text-slate-800">
                {{ disease.display_name.en || '—' }}
              </p>
              <p class="text-xs font-bold text-slate-400 mt-0.5">
                {{ disease.display_name.tl || '—' }}
              </p>
            </div>

            <div class="flex flex-col md:block md:col-span-3 mt-1 md:mt-0">
              <span
                class="md:hidden text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1"
                >Disease Key</span
              >
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black tracking-wide uppercase bg-gray-100 text-slate-600 border border-gray-200"
              >
                {{ disease.disease_key }}
              </span>
            </div>

            <div class="flex flex-col md:block md:col-span-2 mt-1 md:mt-0">
              <span
                class="md:hidden text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1"
                >Created At</span
              >
              @if (disease.created_at) {
                <p class="text-sm font-bold text-slate-700">
                  {{ disease.created_at | date: 'MMM dd, yyyy' }}
                </p>
                <p class="text-xs text-slate-400 mt-0.5 font-medium">
                  {{ disease.created_at | date: 'h:mm a' }}
                </p>
              } @else {
                <span class="text-slate-400 font-medium">—</span>
              }
            </div>

            <div
              class="flex items-center justify-between md:col-span-3 md:justify-end gap-2 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-gray-200 md:border-none"
            >
              <span class="md:hidden text-[10px] font-black uppercase text-slate-400 tracking-wider"
                >Actions</span
              >
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="onTableViewDisease(disease)"
                  class="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  title="View details"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>

                <button
                  type="button"
                  (click)="onTableEditDisease(disease)"
                  class="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-500 transition-colors hover:border-green-300 hover:bg-green-50 hover:text-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                  title="Edit disease"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
                    />
                    <path d="m15 5 4 4" />
                  </svg>
                </button>

                <button
                  type="button"
                  (click)="onTableDeleteDisease(disease)"
                  class="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  title="Delete disease"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }

        @if (filteredRecords.length === 0) {
          <div
            class="py-20 flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border border-gray-200 mx-2 my-4"
          >
            <div
              class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border border-gray-200 shadow-sm mb-5"
            >
              <svg
                class="w-9 h-9 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h3 class="text-lg font-black text-slate-800">No diseases found</h3>
            <p class="text-sm font-medium text-slate-500 mt-2 max-w-sm">
              Try adjusting your filter to find what you're looking for.
            </p>
          </div>
        }
      </div>

      @if (filteredRecords.length > 0) {
        <div class="mt-6">
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
    </div>

    <app-confirmation-dialog
      [isOpen]="pendingDeleteDisease !== null"
      title="Delete Disease Guidance"
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
  isFilterDropdownOpen = false;

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

  public onFilterSelect(key: string): void {
    this.filterLocale = key;
    this.isFilterDropdownOpen = false;
    this.currentPage = 1;
  }
}
