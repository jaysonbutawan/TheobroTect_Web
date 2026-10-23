import { Component, Input } from '@angular/core';

export interface DiseaseCardConfig {
  title: string;
  value: number;
  color: string;
  percentageOfTotal: string;
}

@Component({
  selector: 'app-disease-card',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div class="bg-white p-5 h-full">
      <div class="flex items-center gap-2 mb-2">
        <span class="w-2.5 h-2.5 rounded-full" [style.background-color]="config.color"></span>
        <p class="text-sm text-slate-700 m-0">{{ config.title }}</p>
      </div>
      <p class="text-4xl font-semibold text-slate-900 leading-none m-0 mb-4">{{ config.value }}</p>
      <div class="flex items-center gap-3">
        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full"
            [style.background-color]="config.color"
            [style.width]="config.percentageOfTotal"
          ></div>
        </div>
        <span class="text-xs text-slate-500">{{ config.percentageOfTotal }} of scans</span>
      </div>
    </div>
  `,
})
export class DiseaseCardComponent {
  @Input({ required: true }) config!: DiseaseCardConfig;
}
