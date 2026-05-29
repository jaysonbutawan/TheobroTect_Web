// field-log-skeleton-mobile.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-log-skeleton-mobile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 gap-4 md:hidden">
      @for (i of items; track i) {
        <div class="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3 flex-1">
              <div class="w-12 h-12 rounded-xl bg-gray-100 animate-pulse flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-100 animate-pulse rounded-lg w-3/4"></div>
                <div class="h-3 bg-gray-100 animate-pulse rounded-lg w-1/2"></div>
              </div>
            </div>
            <div class="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0"></div>
          </div>
          <div class="flex items-center justify-between gap-3 pt-4 border-t border-gray-50">
            <div class="flex gap-2">
              <div class="h-7 w-24 bg-gray-100 animate-pulse rounded-lg"></div>
              <div class="h-7 w-20 bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <div class="h-2.5 w-16 bg-gray-100 animate-pulse rounded"></div>
              <div class="h-4 w-10 bg-gray-100 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class FieldLogSkeletonMobileComponent {
  items = [1, 2, 3];
}