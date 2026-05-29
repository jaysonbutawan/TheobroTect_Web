import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-field-reports-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto animate-pulse">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-white/10">
            @for (i of [1,2,3,4]; track i) {
              <th class="px-8 py-5">
                <div class="h-3 w-20 bg-white/30 rounded"></div>
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10">
          @for (i of [1,2,3,4,5]; track i) {
            <tr>
              <td class="px-8 py-6">
                <div class="h-7 w-24 bg-white/30 rounded-lg"></div>
              </td>
              <td class="px-8 py-6">
                <div class="h-4 w-32 bg-white/30 rounded"></div>
              </td>
              <td class="px-8 py-6">
                <div class="flex justify-center">
                  <div class="h-6 w-20 bg-white/30 rounded-full"></div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="h-4 w-28 bg-white/30 rounded ml-auto"></div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class FieldReportsSkeletonComponent {}