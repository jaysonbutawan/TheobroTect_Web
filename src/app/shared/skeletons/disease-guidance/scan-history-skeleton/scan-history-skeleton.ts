// src/app/shared/skeletons/scan-history-skeleton/scan-history-skeleton.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scan-history-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Note: this slots INSIDE the existing white card, below the title/toolbar,
         so it doesn't need its own outer border/shadow — just the table itself. -->
    <div class="overflow-x-auto">
      <table class="w-full border-collapse min-w-[640px]">
        <thead>
          <tr class="bg-[#eef6ef]">
            <th class="text-left px-5 py-3">
              <div class="h-2.5 bg-[#d7e8d9] rounded w-20 animate-pulse"></div>
            </th>
            <th class="text-left px-5 py-3">
              <div class="h-2.5 bg-[#d7e8d9] rounded w-24 animate-pulse"></div>
            </th>
            <th class="text-left px-5 py-3">
              <div class="h-2.5 bg-[#d7e8d9] rounded w-16 animate-pulse"></div>
            </th>
            <th class="text-right px-5 py-3">
              <div class="h-2.5 bg-[#d7e8d9] rounded w-14 ml-auto animate-pulse"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          @for (i of [1,2,3,4,5]; track i) {
          <tr class="border-b border-[#f4f6f8] last:border-0">
            <!-- Date & Time -->
            <td class="px-5 py-4 whitespace-nowrap">
              <div class="space-y-1.5 animate-pulse">
                <div class="h-3.5 bg-slate-100 rounded w-24"></div>
                <div class="h-3 bg-slate-100 rounded w-16"></div>
              </div>
            </td>
            <!-- Disease type -->
            <td class="px-5 py-4 whitespace-nowrap">
              <div class="flex items-center gap-1.5 animate-pulse">
                <div class="w-3.5 h-3.5 rounded-full bg-slate-100 flex-shrink-0"></div>
                <div class="h-3.5 bg-slate-100 rounded w-20"></div>
              </div>
            </td>
            <!-- Location -->
            <td class="px-5 py-4 whitespace-nowrap">
              <div class="flex items-center gap-1.5 animate-pulse">
                <div class="w-3.5 h-3.5 rounded-full bg-slate-100 flex-shrink-0"></div>
                <div class="h-3.5 bg-slate-100 rounded w-24"></div>
              </div>
            </td>
            <!-- Action -->
            <td class="px-5 py-4 text-right whitespace-nowrap">
              <div class="h-3.5 bg-slate-100 rounded w-16 ml-auto animate-pulse"></div>
            </td>
          </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class ScanHistorySkeletonComponent {}

@Component({
  selector: 'app-scan-history-profile-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3 mb-6">
      <!-- Avatar -->
      <div class="relative flex-shrink-0">
        <div class="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm animate-pulse"></div>
      </div>
      <!-- Name + badge -->
      <div class="space-y-1.5 animate-pulse">
        <div class="h-3.5 bg-slate-200 rounded w-28"></div>
        <div class="h-3 bg-[#d7e8d9] rounded w-20"></div>
      </div>
    </div>
  `
})
export class ScanHistoryProfileSkeletonComponent {}