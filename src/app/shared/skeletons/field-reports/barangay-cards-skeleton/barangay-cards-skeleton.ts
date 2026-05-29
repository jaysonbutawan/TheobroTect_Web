import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-barangay-cards-skeleton',
  imports: [],
  template: `
    <p>
      barangay-cards-skeleton works!
    </p>
  `,
  styles: ``,
})
export class BarangayCardsSkeleton {

}@Component({
  selector: 'app-barangay-cards-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      @for (i of [1,2,3]; track i) {
        <div class="relative h-44 overflow-hidden rounded-[2rem] bg-slate-200 shadow-md">
          <!-- Image placeholder -->
          <div class="absolute inset-0 bg-gradient-to-t from-slate-400/80 via-slate-300/40 to-slate-200"></div>
          <!-- Content -->
          <div class="absolute inset-0 p-6 flex flex-col justify-between">
            <div class="flex justify-between items-center">
              <div class="h-2.5 w-16 bg-white/40 rounded"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-white/30"></div>
            </div>
            <div class="h-6 w-36 bg-white/40 rounded-lg"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class BarangayCardsSkeletonComponent {}
