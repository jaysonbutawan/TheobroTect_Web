import { Component } from '@angular/core';

@Component({
  selector: 'app-chart-skeleton',
  standalone: true,
  template: `
    <section
      class="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 w-full animate-pulse"
      role="status"
      aria-label="Loading chart"
    >
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div>
          <div class="h-6 w-52 bg-slate-100 rounded"></div>
          <div class="h-4 w-72 max-w-full bg-slate-100 rounded mt-2"></div>
        </div>
        <div class="h-9 w-28 bg-slate-100 rounded-lg"></div>
      </div>

      <div class="flex flex-wrap gap-x-5 gap-y-1 mb-4">
        @for (i of [1, 2, 3]; track i) {
          <div class="h-4 w-28 bg-slate-100 rounded"></div>
        }
      </div>

      <div class="h-[300px] sm:h-[380px] bg-slate-100 rounded-lg"></div>
    </section>
  `,
})
export class ChartSkeletonComponent {}
