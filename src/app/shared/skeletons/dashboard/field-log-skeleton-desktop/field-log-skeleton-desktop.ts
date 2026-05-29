// field-log-skeleton-desktop.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-log-skeleton-desktop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hidden md:block">
      <div class="overflow-x-auto rounded-xl border border-gray-100">
        <table class="w-full border-collapse">
          <thead class="bg-gray-50/50">
            <tr class="border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Farmer Details</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Disease Type</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Confidence</th>
              <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (i of items; track i) {
              <tr>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-11 h-11 rounded-xl bg-gray-100 animate-pulse flex-shrink-0"></div>
                    <div class="space-y-2">
                      <div class="h-4 w-32 bg-gray-100 animate-pulse rounded-lg"></div>
                      <div class="h-3 w-24 bg-gray-100 animate-pulse rounded-lg"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-4 w-28 bg-gray-100 animate-pulse rounded-lg"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="h-7 w-20 bg-gray-100 animate-pulse rounded-lg"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="h-2 w-24 bg-gray-100 animate-pulse rounded-full"></div>
                    <div class="h-4 w-10 bg-gray-100 animate-pulse rounded"></div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="w-8 h-8 rounded-full bg-gray-100 animate-pulse mx-auto"></div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class FieldLogSkeletonDesktopComponent {
  items = [1, 2, 3, 4, 5];
}