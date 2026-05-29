import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-disease-table-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden animate-pulse">

      <!-- Table header -->
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50/80 border-b border-slate-100">
            @for (w of ['w-8', 'w-28', 'w-24', 'w-24', 'w-20']; track w) {
              <th class="px-5 py-3.5">
                <div class="h-3 bg-slate-200 rounded" [ngClass]="w"></div>
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          @for (i of [1,2,3,4,5]; track i) {
            <tr>
              <!-- ID -->
              <td class="px-5 py-4">
                <div class="h-3 w-6 bg-slate-100 rounded"></div>
              </td>
              <!-- Disease Name -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0"></div>
                  <div class="space-y-1.5">
                    <div class="h-3.5 w-32 bg-slate-100 rounded"></div>
                    <div class="h-3 w-24 bg-slate-100 rounded"></div>
                  </div>
                </div>
              </td>
              <!-- Disease Key -->
              <td class="px-5 py-4">
                <div class="h-6 w-28 bg-slate-100 rounded-md"></div>
              </td>
              <!-- Created At -->
              <td class="px-5 py-4">
                <div class="space-y-1.5">
                  <div class="h-3.5 w-24 bg-slate-100 rounded"></div>
                  <div class="h-3 w-16 bg-slate-100 rounded"></div>
                </div>
              </td>
              <!-- Actions -->
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <div class="h-7 w-14 bg-slate-100 rounded-lg"></div>
                  <div class="h-7 w-12 bg-slate-100 rounded-lg"></div>
                  <div class="h-7 w-16 bg-slate-100 rounded-lg"></div>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div class="h-3 w-32 bg-slate-100 rounded"></div>
        <div class="flex items-center gap-1">
          <div class="w-7 h-7 rounded-lg bg-slate-100"></div>
          <div class="w-7 h-7 rounded-lg bg-slate-200"></div>
          <div class="w-7 h-7 rounded-lg bg-slate-100"></div>
        </div>
      </div>

    </div>
  `
})
export class DiseaseTableSkeletonComponent {}
