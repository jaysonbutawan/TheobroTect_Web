// src/app/shared/skeletons/scan-history-skeleton/scan-history-skeleton.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scan-history-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white border border-[#e8ecf0] rounded-2xl overflow-hidden shadow-sm">
      <!-- Header skeleton -->
      <div class="hidden lg:grid grid-cols-[2fr_1.2fr_1.6fr_1.5fr_1.3fr] px-5 py-3 border-b border-[#f0f4f8] bg-[#f8fafc]">
        @for (i of [1,2,3,4,5]; track i) {
          <div class="h-3 bg-slate-100 animate-pulse rounded w-20"></div>
        }
      </div>
      <!-- Row skeletons -->
      @for (i of [1,2,3,4,5]; track i) {
        <!-- Desktop -->
        <div class="hidden lg:grid grid-cols-[2fr_1.2fr_1.6fr_1.5fr_1.3fr] items-center px-5 py-4 border-b border-[#f4f6f8] last:border-0 animate-pulse">
          <div class="space-y-2">
            <div class="h-4 bg-slate-100 rounded w-32"></div>
            <div class="h-3 bg-slate-100 rounded w-24"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-slate-200 flex-shrink-0"></div>
            <div class="h-4 bg-slate-100 rounded w-16"></div>
          </div>
          <div class="flex items-center gap-3">
            <div class="h-6 w-16 bg-slate-100 rounded-full"></div>
            <div class="h-4 w-10 bg-slate-100 rounded"></div>
          </div>
          <div class="space-y-2">
            <div class="h-4 bg-slate-100 rounded w-24"></div>
            <div class="h-3 bg-slate-100 rounded w-16"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-7 w-24 bg-slate-100 rounded-lg"></div>
            <div class="w-8 h-8 bg-slate-100 rounded-lg"></div>
          </div>
        </div>
        <!-- Mobile -->
        <div class="lg:hidden flex flex-col gap-2 px-5 py-4 border-b border-[#f4f6f8] last:border-0 animate-pulse">
          <div class="h-4 bg-slate-100 rounded w-36"></div>
          <div class="h-3 bg-slate-100 rounded w-24"></div>
          <div class="flex gap-2 mt-1">
            <div class="h-6 w-16 bg-slate-100 rounded-full"></div>
            <div class="h-6 w-12 bg-slate-100 rounded"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class ScanHistorySkeletonComponent {}

@Component({
  selector: 'app-scan-history-profile-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[#2e7d32] border border-[#256427] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5 mb-6 animate-pulse">
      <!-- Avatar -->
      <div class="w-[52px] h-[52px] rounded-full bg-[#256427] border-2 border-[#4caf50] flex-shrink-0"></div>
      <!-- Info -->
      <div class="flex-1 space-y-2">
        <div class="h-3.5 bg-[#256427] rounded w-28"></div>
        <div class="h-3 bg-[#256427] rounded w-44"></div>
        <div class="h-5 bg-[#256427] rounded-full w-16 mt-1"></div>
      </div>
      <!-- Stat pills -->
      <div class="flex flex-wrap gap-2.5 sm:ml-auto">
        @for (w of [130, 130, 150]; track w) {
          <div class="bg-[#1b4d1e] border border-[#163d19] rounded-xl px-4 py-3 flex items-center gap-3"
               [style.min-width.px]="w">
            <div class="w-8 h-8 rounded-lg bg-[#256427] flex-shrink-0"></div>
            <div class="space-y-1.5 flex-1">
              <div class="h-2.5 bg-[#256427] rounded w-16"></div>
              <div class="h-5 bg-[#256427] rounded w-8"></div>
              <div class="h-2 bg-[#256427] rounded w-12"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ScanHistoryProfileSkeletonComponent {}