import { Component, Input, Output, EventEmitter, NgZone, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiseaseDto } from '../disease-guidance.dto';
import { PaginationComponent } from '../../../app/shared/components/pagination/pagination.component';

@Component({
  selector: 'app-disease-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
  <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
  <div class="flex items-center gap-3 flex-wrap">
    <div class="relative w-56 shrink-0">
      <button
        type="button"
        (click)="isFilterDropdownOpen = !isFilterDropdownOpen"
        class="w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all shadow-sm font-medium"
      >
        <span class="truncate">{{ filterLocale ? formatLabel(filterLocale) : 'All Disease Types' }}</span>
        <svg
          class="transition-transform duration-300 shrink-0 ml-2 text-slate-400"
          [class.-rotate-180]="isFilterDropdownOpen"
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      @if (isFilterDropdownOpen) {
        <div class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col left-0 origin-top animate-in fade-in slide-in-from-top-2 duration-200">
          <ul class="max-h-64 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">

            <li>
              <button
                type="button"
                (click)="onFilterSelect('')"
                class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
                [ngClass]="!filterLocale ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
              >
                <span class="truncate">All Disease Types</span>
                @if (!filterLocale) {
                  <svg class="w-4 h-4 text-slate-900 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                }
              </button>
            </li>

            @for (key of diseaseKeys; track key) {
              <li>
                <button
                  type="button"
                  (click)="onFilterSelect(key)"
                  class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
                  [ngClass]="filterLocale === key ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                >
                  <span class="truncate">{{ formatLabel(key) }}</span>
                  @if (filterLocale === key) {
                    <svg class="w-4 h-4 text-slate-900 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
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
</div>

<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-sm text-left whitespace-nowrap">
      <thead>
        <tr class="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
          <th class="px-6 py-4 w-[32%]">Disease Name</th>
          <th class="px-6 py-4 w-[22%]">Disease Key</th>
          <th class="px-6 py-4 w-[20%]">Created At</th>
          <th class="px-6 py-4 w-[21%] text-right">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">

        @for (disease of pagedRecords; track disease.id) {
          <tr class="hover:bg-slate-50/80 transition-colors group">

            <td class="px-6 py-4">
              <div class="flex flex-col">
                <span class="font-medium text-slate-900">{{ disease.display_name.en || '—' }}</span>
                <span class="text-xs text-slate-500 mt-0.5">{{ disease.display_name.tl || '—' }}</span>
              </div>
            </td>

            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600">
                {{ disease.disease_key }}
              </span>
            </td>

            <td class="px-6 py-4">
              @if (disease.created_at) {
                <div class="flex flex-col">
                  <span class="text-slate-700">{{ disease.created_at | date: 'MMM dd, yyyy' }}</span>
                  <span class="text-xs text-slate-400 mt-0.5">{{ disease.created_at | date: 'h:mm a' }}</span>
                </div>
              } @else {
                <span class="text-slate-400">—</span>
              }
            </td>

            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">

                <button
                  type="button"
                  (click)="onTableViewDisease(disease)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  title="View details"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View
                </button>

                <button
                  type="button"
                  (click)="onTableEditDisease(disease)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title="Edit disease"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  Edit
                </button>

                <button
                  type="button"
                  (click)="onTableDeleteDisease(disease)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                  title="Delete disease"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    <line x1="10" x2="10" y1="11" y2="17"/>
                    <line x1="14" x2="14" y1="11" y2="17"/>
                  </svg>
                  Delete
                </button>

              </div>
            </td>
          </tr>
        }

        @if (filteredRecords.length === 0) {
          <tr>
            <td colspan="4" class="px-6 py-20 text-center">
              <div class="flex flex-col items-center justify-center">
                <div class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-slate-900">No diseases found</h3>
                <p class="text-sm text-slate-500 mt-1">Try adjusting your filter to find what you're looking for.</p>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </table>
  </div>

  <app-pagination
    variant="compact"
    [currentPage]="currentPage"
    [totalPages]="totalPages"
    [pageStart]="pageStart"
    [pageEnd]="pageEnd"
    [totalItems]="filteredRecords.length"
    itemLabel="diseases"
    (pageChange)="onPageChange($event)" />
</div>
  `
})
export class DiseaseTableComponent implements OnDestroy {
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
  deleteToastVisible = false;
  deleteCountdown = 5;
  isFilterDropdownOpen = false;

  private deleteTimer: any = null;
  private deleteCountTimer: any = null;

  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  ngOnDestroy(): void {
    this.clearTimers();
  }

  get filteredRecords(): DiseaseDto[] {
    return this.existingRecords.filter(disease => {
      const query = this.searchQuery.trim().toLowerCase();
      const matchesSearch = !query ||
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
      this.currentPage = this.totalPages; // clamp if filtering/deleting shrinks the list
    }
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRecords.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  formatLabel(key: string): string {
    if (!key) return '';
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  onTableViewDisease(disease: DiseaseDto): void {
    this.view.emit(disease);
  }

  onTableEditDisease(disease: DiseaseDto): void {
    this.edit.emit(disease);
  }

  onTableDeleteDisease(disease: DiseaseDto): void {
    if (this.pendingDeleteDisease) {
      this.confirmDelete();
    }

    this.pendingDeleteDisease = disease;
    this.deleteToastVisible = true;
    this.deleteCountdown = 5;

    this.ngZone.runOutsideAngular(() => {
      this.deleteCountTimer = setInterval(() => {
        this.ngZone.run(() => {
          this.deleteCountdown--;
          this.cdr.markForCheck();
          if (this.deleteCountdown <= 0) clearInterval(this.deleteCountTimer);
        });
      }, 1000);

      this.deleteTimer = setTimeout(() => {
        this.ngZone.run(() => {
          this.confirmDelete();
          this.cdr.markForCheck();
        });
      }, 5000);
    });
  }

  undoDelete(): void {
    this.clearTimers();
    this.pendingDeleteDisease = null;
    this.deleteToastVisible = false;
    this.deleteCountdown = 5;
  }

  confirmDelete(): void {
    this.clearTimers();
    if (!this.pendingDeleteDisease) return;

    this.deleteConfirmed.emit(this.pendingDeleteDisease.id);
    this.pendingDeleteDisease = null;
    this.deleteToastVisible = false;
    this.deleteCountdown = 5;
  }

  public onFilterSelect(key: string): void {
    this.filterLocale = key;
    this.isFilterDropdownOpen = false;
    this.currentPage = 1;
  }

  private clearTimers(): void {
    clearTimeout(this.deleteTimer);
    clearInterval(this.deleteCountTimer);
  }
}