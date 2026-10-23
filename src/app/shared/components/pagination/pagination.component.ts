import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 text-sm">
      <p class="m-0 text-slate-500">
        @if (variant === 'compact') {
          Showing {{ currentPageItemCount }} of {{ totalItems }} {{ itemLabel }}
        } @else {
          Showing {{ pageStart }} to {{ pageEnd }} of {{ totalItems }} {{ itemLabel }}
        }
      </p>

      <div class="flex flex-wrap items-center gap-1.5">
        <button
          (click)="emitPage(currentPage - 1)"
          [disabled]="currentPage === 1"
          class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
        >
          Previous
        </button>

        @if (variant === 'compact') {
          <span class="px-2 text-slate-600">Page {{ currentPage }} of {{ totalPages }}</span>
        } @else {
          @for (p of visiblePages; track p) {
            @if (p === -1) {
              <span class="px-1 text-slate-400">…</span>
            } @else {
              <button
                (click)="emitPage(p)"
                class="min-w-8 px-2 py-1.5 rounded-lg border"
                [ngClass]="
                  p === currentPage
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                "
              >
                {{ p }}
              </button>
            }
          }
        }

        <button
          (click)="emitPage(currentPage + 1)"
          [disabled]="currentPage === totalPages"
          class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
        >
          Next
        </button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  @Input() variant: 'default' | 'compact' = 'default';

  @Input() currentPage = 1;

  @Input() totalPages = 1;

  @Input() pageStart = 0;

  @Input() pageEnd = 0;

  @Input() totalItems = 0;

  @Input() itemLabel = 'entries';

  @Input() siblingCount = 1;

  @Output() pageChange = new EventEmitter<number>();

  get currentPageItemCount(): number {
    return this.totalItems === 0 ? 0 : this.pageEnd - this.pageStart + 1;
  }

  emitPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const sibling = this.siblingCount;

    const totalVisible = sibling * 2 + 5;
    if (total <= totalVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const left = Math.max(current - sibling, 2);
    const right = Math.min(current + sibling, total - 1);

    const pages: number[] = [1];

    if (left > 2) {
      pages.push(-1);
    } else {
      for (let p = 2; p < left; p++) pages.push(p);
    }

    for (let p = left; p <= right; p++) pages.push(p);

    if (right < total - 1) {
      pages.push(-1);
    } else {
      for (let p = right + 1; p < total; p++) pages.push(p);
    }

    pages.push(total);
    return pages;
  }
}
