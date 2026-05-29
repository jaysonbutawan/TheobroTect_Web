// src/modules/dashboard/heatmap/heatmap-skeleton.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-heatmap-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5 animate-pulse">

      <!-- Left column -->
      <div class="flex flex-col gap-4">

        <!-- Map skeleton -->
        <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm"
             style="height: 460px;">
          <!-- Top controls -->
          <div class="absolute top-4 left-4 right-4 flex justify-between z-10">
            <div class="h-9 w-28 bg-slate-200 rounded-xl"></div>
            <div class="h-9 w-9 bg-slate-200 rounded-xl"></div>
          </div>
          <!-- Fake heatmap blobs -->
          <div class="absolute inset-0 flex items-center justify-center gap-6 opacity-30">
            <div class="w-32 h-32 rounded-full bg-red-300 blur-2xl"></div>
            <div class="w-24 h-24 rounded-full bg-yellow-300 blur-2xl"></div>
            <div class="w-20 h-20 rounded-full bg-blue-300 blur-2xl"></div>
          </div>
          <!-- Bottom badge -->
          <div class="absolute bottom-4 left-4 flex gap-2">
            <div class="h-6 w-24 bg-slate-200 rounded-lg"></div>
            <div class="h-6 w-36 bg-slate-200 rounded-lg"></div>
          </div>
        </div>

        <!-- Heatmap scale bar -->
        <div class="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div class="h-3 w-20 bg-slate-100 rounded-full"></div>
          <div class="flex-1 h-1.5 bg-slate-100 rounded-full"></div>
          <div class="flex gap-4">
            <div class="h-3 w-8 bg-slate-100 rounded"></div>
            <div class="h-3 w-14 bg-slate-100 rounded"></div>
            <div class="h-3 w-10 bg-slate-100 rounded"></div>
          </div>
        </div>

        <!-- Sync bar -->
        <div class="flex items-center justify-between px-5 py-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm gap-4">
          <div class="flex items-center gap-2.5">
            <div class="w-2 h-2 rounded-full bg-slate-200"></div>
            <div class="h-3 w-36 bg-slate-100 rounded"></div>
          </div>
          <div class="flex items-center gap-3">
            <div class="h-3 w-24 bg-slate-100 rounded"></div>
            <div class="w-24 h-1.5 bg-slate-100 rounded-full"></div>
            <div class="h-3 w-8 bg-slate-100 rounded"></div>
            <div class="w-7 h-7 bg-slate-100 rounded-lg"></div>
          </div>
        </div>

      </div>

      <!-- Right column -->
      <div class="flex flex-col gap-4">

        <!-- Detection legend skeleton -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div class="h-3 w-24 bg-slate-100 rounded mb-4"></div>
          <div class="h-3 w-48 bg-slate-100 rounded mb-4"></div>
          @for (i of [1,2,3,4]; track i) {
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2.5">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                <div class="h-3 w-20 bg-slate-100 rounded"></div>
              </div>
              <div class="h-5 w-16 bg-slate-100 rounded-full"></div>
            </div>
            <div class="ml-5 mb-4 space-y-1">
              <div class="h-1 w-full bg-slate-100 rounded-full"></div>
              <div class="h-2.5 w-32 bg-slate-100 rounded"></div>
            </div>
          }
        </div>

        <!-- Active alerts skeleton -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div class="h-3 w-20 bg-slate-100 rounded mb-3"></div>
          <div class="space-y-2">
            <div class="h-9 bg-red-50 border border-red-100 rounded-xl"></div>
            <div class="h-9 bg-yellow-50 border border-yellow-100 rounded-xl"></div>
          </div>
        </div>

        <!-- Observation log skeleton -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div class="h-3 w-32 bg-slate-100 rounded mb-3"></div>
          <div class="h-16 bg-slate-50 border border-slate-200 rounded-xl mb-2"></div>
          <div class="h-9 bg-slate-100 rounded-xl mb-3"></div>
          <div class="h-12 bg-slate-50 border-l-2 border-slate-200 rounded-xl px-3 py-2 space-y-1">
            <div class="h-3 w-48 bg-slate-100 rounded"></div>
            <div class="h-2.5 w-24 bg-slate-100 rounded"></div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class HeatmapSkeletonComponent {}