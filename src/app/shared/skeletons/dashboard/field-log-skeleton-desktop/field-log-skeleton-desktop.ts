import { Component } from '@angular/core';

@Component({
  selector: 'app-field-log-skeleton-desktop',
  standalone: true,
  template: `
    <div class="divide-y divide-slate-100 animate-pulse" role="status" aria-label="Loading field logs">
      @for (i of [1, 2, 3, 4, 5]; track i) {
        <div class="px-4 sm:px-6 py-4 md:grid md:grid-cols-12 md:gap-4 md:items-center">
          <div class="md:col-span-4 space-y-2">
            <div class="h-4 w-32 bg-slate-100 rounded"></div>
            <div class="h-3 w-44 max-w-full bg-slate-100 rounded"></div>
          </div>
          <div class="md:col-span-2 mt-3 md:mt-0">
            <div class="h-4 w-24 bg-slate-100 rounded"></div>
          </div>
          <div class="md:col-span-2 mt-3 md:mt-0">
            <div class="h-6 w-16 bg-slate-100 rounded-md"></div>
          </div>
          <div class="md:col-span-3 mt-3 md:mt-0">
            <div class="h-4 w-28 bg-slate-100 rounded"></div>
          </div>
          <div class="hidden md:block md:col-span-1">
            <div class="h-4 w-8 bg-slate-100 rounded ml-auto"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class FieldLogSkeletonDesktopComponent {}
