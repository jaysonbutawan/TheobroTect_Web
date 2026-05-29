// src/app/shared/skeletons/stats-skeleton/stats-skeleton.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      @for (i of [1,2,3]; track i) {
        <div class="h-[180px] rounded-[2.5rem] bg-gray-200 animate-pulse"></div>
      }
    </div>
  `
})
export class StatsSkeletonComponent {}