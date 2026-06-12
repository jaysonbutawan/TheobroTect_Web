import { Component, Input, Output, EventEmitter, NgZone, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiseaseDto } from '../disease-guidance.dto';

@Component({
  selector: 'app-disease-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `

<div class="flex items-center justify-between mb-5 gap-3 flex-wrap">
<div class="flex items-center gap-3 flex-wrap">
  <div class="relative w-48 shrink-0">
    <button
      type="button"
      (click)="isFilterDropdownOpen = !isFilterDropdownOpen"
      class="w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white/80 text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-all shadow-sm"
    >
      <span class="truncate font-medium">{{ filterLocale ? formatLabel(filterLocale) : 'All Disease Types' }}</span>
      <svg class="transition-transform duration-200 shrink-0 ml-2" [class.rotate-180]="isFilterDropdownOpen" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6" /></svg>
    </button>

    @if (isFilterDropdownOpen) {
      <div class="absolute z-50 w-full md:w-56 mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden flex flex-col left-0">
        <ul class="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">

          <li>
            <button
              type="button"
              (click)="onFilterSelect('')"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left"
              [ngClass]="!filterLocale ? 'bg-slate-50 border-slate-800 text-slate-900 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'"
              style="border-width: 1px;"
            >
              <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
                   [ngClass]="!filterLocale ? 'border-slate-800' : 'border-slate-300'">
                @if (!filterLocale) {
                  <div class="w-2 h-2 rounded-full bg-slate-800"></div>
                }
              </div>
              <span class="truncate">All Disease Types</span>
            </button>
          </li>

          @for (key of diseaseKeys; track key) {
            <li>
              <button
                type="button"
                (click)="onFilterSelect(key)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                [ngClass]="filterLocale === key ? 'bg-slate-50 border-slate-800 text-slate-900 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'"
                style="border-width: 1px;"
              >
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
                     [ngClass]="filterLocale === key ? 'border-slate-800' : 'border-slate-300'">
                  @if (filterLocale === key) {
                    <div class="w-2 h-2 rounded-full bg-slate-800"></div>
                  }
                </div>
                <span class="truncate">{{ formatLabel(key) }}</span>
              </button>
            </li>
          }
        </ul>
      </div>
    }
  </div>
</div>
</div>

<div class="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
  <table class="w-full text-sm">
    <thead>
      <tr class="bg-slate-50/80 border-b border-slate-100">
        <th
          class="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[32%]"
        >
          Disease Name
        </th>
        <th
          class="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[22%]"
        >
          Disease Key
        </th>
        <th
          class="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]"
        >
          Created At
        </th>
        <th class="px-5 py-3.5 w-[21%]"></th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-50">
      @for (disease of filteredRecords; track disease.id) {
        <tr class="hover:bg-slate-50/60 transition-colors group">
          <td class="px-5 py-4">
            <div class="flex items-center gap-3">
              <div>
                <div class="font-semibold text-slate-800 text-sm leading-tight">
                  {{ disease.display_name.en || '—' }}
                </div>
                <div class="text-xs text-slate-400 mt-0.5">
                  {{ disease.display_name.tl || '—' }}
                </div>
              </div>
            </div>
          </td>

          <td class="px-5 py-4">
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200"
            >
              {{ disease.disease_key }}
            </span>
          </td>

          <td class="px-5 py-4">
            @if (disease.created_at) {
              <div class="text-sm text-slate-600">
                {{ disease.created_at | date: 'MMM dd, yyyy' }}
              </div>
              <div class="text-xs text-slate-400 mt-0.5">
                {{ disease.created_at | date: 'h:mm a' }}
              </div>
            } @else {
              <span class="text-sm text-slate-400">—</span>
            }
          </td>

          <td class="px-5 py-4">
            <div class="flex items-center justify-end gap-1">
              <button
                type="button"
                (click)="onTableViewDisease(disease)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                title="View full details"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View
              </button>

              <button
                type="button"
                (click)="onTableEditDisease(disease)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-green-600 hover:bg-green-50 border border-transparent hover:border-green-100 transition-all"
                title="Edit this disease"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>

              <button
                type="button"
                (click)="onTableDeleteDisease(disease)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                title="Delete this disease"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Delete
              </button>
            </div>
          </td>
        </tr>
      }

      @if (filteredRecords.length === 0) {
        <tr>
          <td colspan="5" class="px-5 py-16 text-center">
            <svg
              class="w-10 h-10 mx-auto text-slate-200 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm font-medium text-slate-500">No diseases found</p>
            <p class="text-xs text-slate-400 mt-1">Try adjusting your search or filter</p>
          </td>
        </tr>
      }
    </tbody>
  </table>

  <div
    class="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between"
  >
    <span class="text-xs text-slate-500">
      Showing <span class="font-semibold text-slate-700">{{ filteredRecords.length }}</span> of
      <span class="font-semibold text-slate-700">{{ existingRecords.length }}</span> diseases
    </span>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-green-400 hover:text-green-600 transition-all flex items-center justify-center text-xs font-bold"
      >
        ‹
      </button>
      <button
        type="button"
        class="w-7 h-7 rounded-lg bg-green-500 text-white text-xs font-bold shadow-sm"
      >
        1
      </button>
      <button
        type="button"
        class="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-green-400 hover:text-green-600 transition-all flex items-center justify-center text-xs font-bold"
      >
        ›
      </button>
    </div>
  </div>
</div>
  `
})
export class DiseaseTableComponent implements OnDestroy {
  @Input() existingRecords: DiseaseDto[] = [];
  @Input() diseaseKeys: string[] = [];

  @Output() view = new EventEmitter<DiseaseDto>();
  @Output() edit = new EventEmitter<DiseaseDto>();
  @Output() deleteConfirmed = new EventEmitter<number>();

  searchQuery: string = '';
  filterLocale: string = '';

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
  }

  private clearTimers(): void {
    clearTimeout(this.deleteTimer);
    clearInterval(this.deleteCountTimer);
  }
}
