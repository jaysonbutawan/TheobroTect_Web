// src/app/shared/skeletons/field-reports-skeleton/field-reports-skeleton.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-reports-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse min-w-[760px]">
        <thead>
          <tr class="bg-white/10 border-y border-white/20">
            <th class="px-8 py-4"><div class="h-2.5 bg-slate-200/60 rounded w-20 animate-pulse"></div></th>
            <th class="px-8 py-4"><div class="h-2.5 bg-slate-200/60 rounded w-16 animate-pulse"></div></th>
            <th class="px-8 py-4"><div class="h-2.5 bg-slate-200/60 rounded w-20 animate-pulse"></div></th>
            <th class="px-8 py-4 text-center"><div class="h-2.5 bg-slate-200/60 rounded w-16 mx-auto animate-pulse"></div></th>
            <th class="px-8 py-4"><div class="h-2.5 bg-slate-200/60 rounded w-14 animate-pulse"></div></th>
            <th class="px-8 py-4 text-right"><div class="h-2.5 bg-slate-200/60 rounded w-14 ml-auto animate-pulse"></div></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10">
          @for (i of [1,2,3,4,5]; track i) {
          <tr>
            <td class="px-8 py-5"><div class="h-3.5 bg-slate-200/60 rounded w-24 animate-pulse"></div></td>
            <td class="px-8 py-5"><div class="h-3.5 bg-slate-200/60 rounded w-20 animate-pulse"></div></td>
            <td class="px-8 py-5"><div class="h-3.5 bg-slate-200/60 rounded w-28 animate-pulse"></div></td>
            <td class="px-8 py-5"><div class="flex justify-center"><div class="h-5 bg-slate-200/60 rounded-full w-16 animate-pulse"></div></div></td>
            <td class="px-8 py-5"><div class="h-3.5 bg-slate-200/60 rounded w-20 animate-pulse"></div></td>
            <td class="px-8 py-5 text-right"><div class="h-7 bg-slate-200/60 rounded-xl w-24 ml-auto animate-pulse"></div></td>
          </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class FieldReportsSkeletonComponent {}