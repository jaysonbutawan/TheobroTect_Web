import { Component } from '@angular/core';

@Component({
  selector: 'app-disease-table-skeleton',
  standalone: true,
  template: `
    <section
      class="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      role="status"
      aria-label="Loading diseases"
    >
      <div class="px-4 sm:px-6 py-4 border-b border-slate-200 animate-pulse">
        <div class="h-5 w-28 bg-slate-100 rounded"></div>
      </div>
      <div class="divide-y divide-slate-100">
        @for (i of [1, 2, 3, 4, 5]; track i) {
          <div class="px-4 sm:px-6 py-4 md:grid md:grid-cols-12 md:gap-4 md:items-center animate-pulse">
            <div class="md:col-span-4 space-y-2">
              <div class="h-4 w-36 bg-slate-100 rounded"></div>
              <div class="h-3 w-24 bg-slate-100 rounded"></div>
            </div>
            <div class="hidden md:block md:col-span-3 h-4 w-28 bg-slate-100 rounded"></div>
            <div class="hidden md:block md:col-span-2 h-4 w-24 bg-slate-100 rounded"></div>
            <div class="hidden md:block md:col-span-3 h-4 w-32 bg-slate-100 rounded ml-auto"></div>
          </div>
        }
      </div>
    </section>
  `,
})
export class DiseaseTableSkeletonComponent {}
