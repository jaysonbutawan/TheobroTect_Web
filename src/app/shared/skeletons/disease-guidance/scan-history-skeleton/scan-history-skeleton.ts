import { Component } from '@angular/core';

@Component({
  selector: 'app-scan-history-profile-skeleton',
  standalone: true,
  template: `
    <div class="flex items-center gap-3 mb-6">
      <div class="relative flex-shrink-0">
        <div
          class="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm animate-pulse"
        ></div>
      </div>
      <div class="space-y-1.5 animate-pulse">
        <div class="h-3.5 bg-slate-200 rounded w-28"></div>
        <div class="h-3 bg-[#d7e8d9] rounded w-20"></div>
      </div>
    </div>
  `,
})
export class ScanHistoryProfileSkeletonComponent {}
