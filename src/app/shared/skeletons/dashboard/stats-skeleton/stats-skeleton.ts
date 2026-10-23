import { Component } from '@angular/core';

@Component({
  selector: 'app-stats-skeleton',
  standalone: true,
  template: `
    <div class="flex flex-col gap-6 animate-pulse" role="status" aria-label="Loading disease report">
      <div>
        <div class="h-8 w-48 bg-slate-100 rounded"></div>
        <div class="h-4 w-64 max-w-full bg-slate-100 rounded mt-2"></div>
      </div>

      <div
        class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-2xl border border-slate-200 overflow-hidden"
      >
        @for (i of [1, 2, 3, 4]; track i) {
          <div class="bg-white p-5">
            <div class="h-4 w-24 bg-slate-100 rounded"></div>
            <div class="h-8 w-16 bg-slate-100 rounded mt-2"></div>
          </div>
        }
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 rounded-2xl border border-slate-200 overflow-hidden"
      >
        @for (i of [1, 2, 3]; track i) {
          <div class="bg-white p-5">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-2.5 h-2.5 rounded-full bg-slate-100"></div>
              <div class="h-4 w-28 bg-slate-100 rounded"></div>
            </div>
            <div class="h-9 w-14 bg-slate-100 rounded mb-4"></div>
            <div class="flex items-center gap-3">
              <div class="flex-1 h-1.5 bg-slate-100 rounded-full"></div>
              <div class="h-3 w-16 bg-slate-100 rounded"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class StatsSkeletonComponent {}
