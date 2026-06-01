import { Component, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─── Data Models ────────────────────────────────────────────────────────────

export type DiseaseValue = 'all' | 'black pod' | 'cacao pod borer' | 'mealybug';

export interface DiseaseOption {
  value: DiseaseValue;
  label: string;
}

export interface FilterState {
  year: number;
  month: number;
  disease: DiseaseValue;
}

// ─── Static Config ───────────────────────────────────────────────────────────

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

// Updated to match the specific text in your design
const DISEASE_OPTIONS: DiseaseOption[] = [

  { value: 'all', label: 'All Diseases' },
  { value: 'black pod', label: 'Black Pod' },
  { value: 'cacao pod borer', label: 'Cacao Pod Borer' },
  { value: 'mealybug', label: 'Mealybug' },
];

const MIN_YEAR = 2020;
const MAX_YEAR = 2030;

const now = new Date();

const DEFAULT_FILTER: FilterState = {
  year: now.getFullYear(),
  month: now.getMonth(),
  disease: 'all'
};
// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div class="flex flex-wrap items-center gap-2 py-3">

  <div class="relative" (clickOutside)="closePanel()">
    <button
      class="flex items-center gap-[7px] px-[14px] py-[9px] bg-white border border-slate-200 rounded-[10px] cursor-pointer text-[13px] font-medium text-slate-900 transition-all duration-150 whitespace-nowrap select-none leading-none hover:bg-slate-50 hover:border-slate-300"
      [class.border-slate-900]="panelOpen"
      [class.shadow-[0_0_0_3px_rgba(15,23,42,0.06)]]="panelOpen"
      (click)="togglePanel()"
    >
      <svg class="w-[15px] h-[15px] text-slate-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span class="text-slate-400 font-normal">Period:</span>
      <span>{{ triggerLabel }}</span>
      <svg class="w-[13px] h-[13px] text-slate-400 transition-transform duration-200" [class.rotate-180]="panelOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>

    @if (panelOpen) {
      <div class="hidden max-[480px]:block fixed inset-0 bg-slate-900/35 z-[199]" (click)="closePanel()"></div>
      <div class="absolute top-[calc(100%+8px)] left-0 z-[200] bg-white border border-slate-200 rounded-[14px] p-5 w-[300px] shadow-[0_8px_32px_rgba(15,23,42,0.10)] max-[480px]:fixed max-[480px]:top-auto max-[480px]:bottom-0 max-[480px]:left-0 max-[480px]:right-0 max-[480px]:w-full max-[480px]:rounded-t-[18px]">

        <span class="block text-[10.5px] font-semibold tracking-[0.08em] uppercase text-slate-400 mb-2">Year</span>
        <div class="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4">
          <button class="text-slate-500 hover:text-slate-900 px-2 text-base" (click)="prevYear()" [disabled]="pendingYear <= minYear">&#8249;</button>
          <span class="text-[15px] font-semibold text-slate-900">{{ pendingYear }}</span>
          <button class="text-slate-500 hover:text-slate-900 px-2 text-base" (click)="nextYear()" [disabled]="pendingYear >= maxYear">&#8250;</button>
        </div>

        <div class="h-px bg-slate-100 mb-4"></div>

        <span class="block text-[10.5px] font-semibold tracking-[0.08em] uppercase text-slate-400 mb-2">Month</span>
        <div class="grid grid-cols-3 gap-[6px] mb-[18px]">
          @for (month of months; track $index) {
            <button
              class="py-[9px] px-1 bg-white border border-slate-200 rounded-lg text-[11.5px] font-semibold tracking-[0.03em] text-slate-600 hover:bg-slate-50"
              [class.!bg-slate-900]="$index === pendingMonth"
              [class.!border-slate-900]="$index === pendingMonth"
              [class.!text-white]="$index === pendingMonth"
              (click)="selectMonth($index)"
            >{{ month.toUpperCase() }}</button>
          }
        </div>

        <div class="flex gap-2">
          <button class="flex-1 py-[10px] bg-slate-900 text-white rounded-lg text-[13px] font-semibold hover:bg-slate-800" (click)="applyFilter()">Apply</button>
          <button class="px-[14px] py-[10px] bg-white text-slate-500 border border-slate-200 rounded-lg text-[13px] font-medium hover:bg-slate-50" (click)="closePanel()">Cancel</button>
        </div>
      </div>
    }
  </div>

  <div class="relative" (clickOutside)="closeDiseasePanel()">

    <button
      class="flex items-center gap-[7px] px-[14px] py-[9px] bg-white border border-slate-200 rounded-[10px] cursor-pointer text-[13px] font-medium text-slate-900 transition-all duration-150 whitespace-nowrap select-none leading-none hover:bg-slate-50 hover:border-slate-300"
      [class.border-slate-900]="diseasePanelOpen"
      [class.shadow-[0_0_0_3px_rgba(15,23,42,0.06)]]="diseasePanelOpen"
      (click)="toggleDiseasePanel()"
    >
      <svg class="w-[14px] h-[14px] text-slate-400 flex-shrink-0" [class.text-slate-900]="diseasePanelOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <span>{{ activeDisease?.label || 'Select Disease' }}</span>
      <svg class="w-[13px] h-[13px] text-slate-400 transition-transform duration-200" [class.rotate-180]="diseasePanelOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>

    @if (diseasePanelOpen) {
      <div class="hidden max-[480px]:block fixed inset-0 bg-slate-900/35 z-[199]" (click)="closeDiseasePanel()"></div>
      <div class="absolute top-[calc(100%+8px)] left-0 z-[200] bg-white border border-slate-200 rounded-[12px] p-0 w-[340px] shadow-[0_10px_35px_rgba(15,23,42,0.12)] flex flex-col max-[480px]:fixed max-[480px]:top-auto max-[480px]:bottom-0 max-[480px]:left-0 max-[480px]:right-0 max-[480px]:w-full max-[480px]:rounded-t-[18px]">

        <div class="flex items-start justify-between p-4 pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-[15px] font-semibold text-slate-900 leading-tight">Disease Filter</h3>
            <p class="text-[12px] text-slate-500 mt-0.5">Select specific diseases for reporting</p>
          </div>
          <button class="text-slate-400 hover:text-slate-700 transition-colors" (click)="closeDiseasePanel()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="px-4 py-3">
          <div class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-all">
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search diseases..."
              class="bg-transparent border-none outline-none text-[13px] w-full placeholder:text-slate-400 text-slate-900"
            />
          </div>
        </div>

        <div class="px-4 pb-2 flex flex-col gap-2 max-h-[260px] overflow-y-auto">
          @for (opt of filteredDiseaseOptions; track opt.value) {
            <button
              (click)="pendingDisease = opt.value"
              class="w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-colors duration-150"
              [class.border-slate-900]="pendingDisease === opt.value"
              [class.bg-slate-50]="pendingDisease === opt.value"
              [class.border-slate-200]="pendingDisease !== opt.value"
              [class.hover:border-slate-300]="pendingDisease !== opt.value"
            >
              <div
                class="w-[18px] h-[18px] rounded-full border flex-shrink-0 flex items-center justify-center transition-colors"
                [class.border-slate-900]="pendingDisease === opt.value"
                [class.border-slate-300]="pendingDisease !== opt.value"
              >
                @if (pendingDisease === opt.value) {
                  <div class="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                }
              </div>

              <div class="flex-1">
                <div class="text-[13px] font-medium text-slate-900">{{ opt.label }}</div>
              </div>
            </button>
          }

          @if (filteredDiseaseOptions.length === 0) {
            <div class="text-center py-6 text-[13px] text-slate-500">No diseases found matching "{{ searchQuery }}"</div>
          }
        </div>

        <div class="flex items-center justify-end gap-2 p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-[12px]">
          <button
            class="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-md text-[13px] font-medium hover:bg-slate-50 transition-colors"
            (click)="closeDiseasePanel()"
          >Cancel</button>
          <button
            class="px-4 py-2 bg-[#0f172a] text-white border border-[#0f172a] rounded-md text-[13px] font-medium hover:bg-slate-800 transition-colors shadow-sm"
            (click)="applyDiseaseFilter()"
          >Apply Filter</button>
        </div>

      </div>
    }
  </div>

  @if (activeDisease && activeDisease.value !== 'all') {
    <span class="inline-flex items-center gap-[6px] px-[11px] py-[5px] bg-green-50 border border-green-200 rounded-full text-[12px] font-medium text-green-700">
      <span class="w-[6px] h-[6px] rounded-full bg-green-500 flex-shrink-0"></span>
      {{ activeDisease.label }}
    </span>
  }

  <button
    class="flex items-center gap-[6px] px-[14px] py-[9px] bg-slate-50 border border-slate-200 rounded-[10px] text-[13px] font-medium text-slate-500 cursor-pointer transition-all hover:bg-white hover:text-slate-900"
    (click)="resetFilters()"
  >
    <svg class="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
    </svg>
    Reset
  </button>

</div>`
})
export class FilterBarComponent implements OnInit {

  @Output() filterChange = new EventEmitter<FilterState>();

  // ── Static Config ──────────────────────────────────────────────────────────

  readonly months = MONTHS;
  readonly minYear = MIN_YEAR;
  readonly maxYear = MAX_YEAR;
  readonly diseaseOptions = DISEASE_OPTIONS;

  // ── State ──────────────────────────────────────────────────────────────────

  /** Committed filter */
  appliedFilter: FilterState = { ...DEFAULT_FILTER };

  // Date Panel State
  panelOpen = false;
  pendingYear = DEFAULT_FILTER.year;
  pendingMonth = DEFAULT_FILTER.month;

  // Disease Panel State
  diseasePanelOpen = false;
  pendingDisease: DiseaseValue = DEFAULT_FILTER.disease;
  searchQuery = '';

  ngOnInit(): void {
    this.filterChange.emit(this.appliedFilter);
  }
  get triggerLabel(): string {
    return `${MONTHS[this.appliedFilter.month]} ${this.appliedFilter.year}`;
  }

  get activeDisease(): DiseaseOption | undefined {
    return DISEASE_OPTIONS.find(o => o.value === this.appliedFilter.disease);
  }

  /** Filters the disease list based on the search input */
  get filteredDiseaseOptions(): DiseaseOption[] {
    if (!this.searchQuery.trim()) return this.diseaseOptions;

    const query = this.searchQuery.toLowerCase();
    return this.diseaseOptions.filter(opt =>
      opt.label.toLowerCase().includes(query)
    );
  }

  // ── Date Panel Methods ─────────────────────────────────────────────────────

  togglePanel(): void {
    this.closeDiseasePanel(); // close the other panel if open
    this.panelOpen ? this.closePanel() : this.openPanel();
  }

  openPanel(): void {
    this.pendingYear = this.appliedFilter.year;
    this.pendingMonth = this.appliedFilter.month;
    this.panelOpen = true;
  }

  closePanel(): void {
    this.panelOpen = false;
  }

  prevYear(): void { if (this.pendingYear > MIN_YEAR) this.pendingYear--; }
  nextYear(): void { if (this.pendingYear < MAX_YEAR) this.pendingYear++; }
  selectMonth(index: number): void { this.pendingMonth = index; }

  applyFilter(): void {
    this.appliedFilter = {
      ...this.appliedFilter,
      year: this.pendingYear,
      month: this.pendingMonth,
    };
    this.filterChange.emit(this.appliedFilter);
    this.closePanel();
  }


  toggleDiseasePanel(): void {
    this.closePanel(); // close the date panel if open
    this.diseasePanelOpen ? this.closeDiseasePanel() : this.openDiseasePanel();
  }

  openDiseasePanel(): void {
    this.pendingDisease = this.appliedFilter.disease;
    this.searchQuery = '';
    this.diseasePanelOpen = true;
  }

  closeDiseasePanel(): void {
    this.diseasePanelOpen = false;
  }

  applyDiseaseFilter(): void {
    this.appliedFilter = {
      ...this.appliedFilter,
      disease: this.pendingDisease,
    };
    this.filterChange.emit(this.appliedFilter);
    this.closeDiseasePanel();
  }

  resetFilters(): void {
    this.appliedFilter = { ...DEFAULT_FILTER };
    this.filterChange.emit(this.appliedFilter);
    this.closePanel();
    this.closeDiseasePanel();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePanel();
    this.closeDiseasePanel();
  }
}
