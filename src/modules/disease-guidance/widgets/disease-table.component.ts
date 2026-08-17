import {
  Component,
  Input,
  Output,
  EventEmitter,
  NgZone,
  ChangeDetectorRef,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiseaseDto } from '../disease-guidance.dto';
import { PaginationComponent } from '../../../app/shared/components/pagination/pagination.component';

@Component({
  selector: 'app-disease-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap select-none">
      <div class="flex items-center gap-3 flex-wrap w-full sm:w-auto">
        <div class="relative w-full sm:w-56 shrink-0">
          <button
            type="button"
            (click)="isFilterDropdownOpen = !isFilterDropdownOpen"
            class="w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-lg bg-white text-slate-700 border border-gray-200 shadow-sm hover:text-green-600 hover:border-green-200 transition-all font-bold"
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
              class="absolute z-50 w-full mt-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col left-0 origin-top animate-in fade-in slide-in-from-top-2 duration-200"
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
    </div>

    <div
      class="bg-white rounded-lg p-4 md:p-6 border border-gray-200 shadow-sm select-none"
    >
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
                  class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 bg-white border border-gray-200 shadow-sm hover:text-blue-600 hover:border-blue-200 transition-all"
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
                  class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 bg-white border border-gray-200 shadow-sm hover:text-green-600 hover:border-green-200 transition-all"
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
                  class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 bg-white border border-gray-200 shadow-sm hover:text-red-500 hover:border-red-200 transition-all"
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
  `,
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
