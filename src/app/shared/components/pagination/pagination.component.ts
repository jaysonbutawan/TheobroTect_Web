// src/app/shared/components/pagination/pagination.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (variant === 'compact') {
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-500">
          Showing <span class="font-bold text-slate-700">{{ currentPageItemCount }}</span> of
          <span class="font-bold text-slate-700">{{ totalItems }}</span> {{ itemLabel }}
        </p>

        <div class="flex items-center gap-2">
          <button (click)="emitPage(currentPage - 1)" [disabled]="currentPage === 1"
            class="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div class="w-8 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-md text-sm font-bold text-slate-700">
            {{ currentPage }}
          </div>

          <button (click)="emitPage(currentPage + 1)" [disabled]="currentPage === totalPages"
            class="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    } @else {
      <div class="flex flex-wrap items-center justify-between gap-3 px-8 py-5 border-t border-white/20">
        <p class="text-xs font-bold text-slate-500">
          Showing <span class="text-slate-800">{{ pageStart }} to {{ pageEnd }}</span> of
          <span class="text-slate-800">{{ totalItems }}</span> {{ itemLabel }}
        </p>

        <div class="flex items-center gap-1.5">
          <button (click)="emitPage(currentPage - 1)" [disabled]="currentPage === 1"
            class="w-7 h-7 bg-white/80 border border-white/40 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors">
            <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          @for (p of visiblePages; track p) {
            @if (p === -1) {
              <span class="w-7 h-7 flex items-center justify-center text-xs font-black text-slate-400">…</span>
            } @else {
              <button (click)="emitPage(p)"
                class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border transition-colors"
                [ngClass]="p === currentPage
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white/80 border-white/40 text-slate-600 hover:bg-white'">{{ p }}</button>
            }
          }

          <button (click)="emitPage(currentPage + 1)" [disabled]="currentPage === totalPages"
            class="w-7 h-7 bg-white/80 border border-white/40 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-white transition-colors">
            <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    }
  `
})
export class PaginationComponent {
  /** Visual style: 'default' (colored, numbered pages) or 'compact' (plain, single page indicator) */
  @Input() variant: 'default' | 'compact' = 'default';
  /** Current active page (1-indexed) */
  @Input() currentPage = 1;
  /** Total number of pages */
  @Input() totalPages = 1;
  /** First item index shown on the current page (for the "Showing X to Y" label) */
  @Input() pageStart = 0;
  /** Last item index shown on the current page */
  @Input() pageEnd = 0;
  /** Total number of items across all pages */
  @Input() totalItems = 0;
  /** Label after the count, e.g. "entries", "scans", "diseases" */
  @Input() itemLabel = 'entries';
  /** How many page buttons to show around the current page before collapsing into "…" (default variant only) */
  @Input() siblingCount = 1;

  @Output() pageChange = new EventEmitter<number>();

  /** Item count on the current page — used by the compact variant's "Showing X of Y" label */
  get currentPageItemCount(): number {
    return this.totalItems === 0 ? 0 : this.pageEnd - this.pageStart + 1;
  }

  emitPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  /**
   * Builds a windowed page list with ellipsis markers (-1) so large page counts
   * don't render hundreds of buttons, e.g. [1, -1, 4, 5, 6, -1, 42]
   */
  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const sibling = this.siblingCount;

    // Small enough to just show every page
    const totalVisible = sibling * 2 + 5; // first, last, current, 2 ellipses worth of buffer
    if (total <= totalVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const left = Math.max(current - sibling, 2);
    const right = Math.min(current + sibling, total - 1);

    const pages: number[] = [1];

    if (left > 2) {
      pages.push(-1); // ellipsis
    } else {
      for (let p = 2; p < left; p++) pages.push(p);
    }

    for (let p = left; p <= right; p++) pages.push(p);

    if (right < total - 1) {
      pages.push(-1); // ellipsis
    } else {
      for (let p = right + 1; p < total; p++) pages.push(p);
    }

    pages.push(total);
    return pages;
  }
}