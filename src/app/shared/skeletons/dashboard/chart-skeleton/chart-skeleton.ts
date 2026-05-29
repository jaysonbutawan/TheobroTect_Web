// src/app/shared/skeletons/chart-skeleton/chart-skeleton.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 md:p-8 border-b border-gray-50 bg-slate-50/30">
        <div class="h-7 w-48 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
      <div class="p-4 md:p-8 h-64 md:h-96 relative overflow-hidden">
        <!-- Y axis lines -->
        <div class="absolute inset-x-8 inset-y-8 flex flex-col justify-between">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="w-full h-px bg-gray-100"></div>
          }
        </div>

        <!-- Simulated line chart curves -->
        <svg class="absolute inset-0 w-full h-full px-8 py-8" preserveAspectRatio="none" viewBox="0 0 400 200">
          <!-- Line 1 -->
          <path d="M0,60 C50,40 100,120 150,80 S250,20 300,60 S370,100 400,70"
            fill="none" stroke="#e5e7eb" stroke-width="3" stroke-linecap="round"/>
          <!-- Line 2 -->
          <path d="M0,120 C50,100 100,60 150,90 S250,140 300,100 S370,60 400,80"
            fill="none" stroke="#e5e7eb" stroke-width="3" stroke-linecap="round"/>
          <!-- Line 3 -->
          <path d="M0,160 C50,140 100,100 150,130 S250,80 300,120 S370,150 400,130"
            fill="none" stroke="#e5e7eb" stroke-width="3" stroke-linecap="round"/>
          <!-- Line 4 -->
          <path d="M0,90 C50,110 100,150 150,110 S250,60 300,90 S370,120 400,100"
            fill="none" stroke="#e5e7eb" stroke-width="3" stroke-linecap="round"/>
        </svg>

        <!-- X axis labels -->
        <div class="absolute bottom-4 inset-x-8 flex justify-between">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="h-3 w-8 bg-gray-100 animate-pulse rounded"></div>
          }
        </div>

        <!-- Legend -->
        <div class="absolute bottom-10 inset-x-8 flex justify-center gap-6">
          @for (i of [1,2,3,4]; track i) {
            <div class="flex items-center gap-2">
              <div class="h-3 w-8 bg-gray-100 animate-pulse rounded-full"></div>
              <div class="h-3 w-16 bg-gray-100 animate-pulse rounded"></div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ChartSkeletonComponent {}