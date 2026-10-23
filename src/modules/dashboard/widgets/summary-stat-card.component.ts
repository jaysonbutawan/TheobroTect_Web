import { Component, Input } from '@angular/core';

export interface SummaryStatConfig {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-summary-stat-card',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div class="bg-white p-5 h-full">
      <p class="text-sm text-slate-500 m-0">{{ config.label }}</p>
      <p class="text-3xl font-semibold text-slate-900 leading-none mt-2 m-0">{{ config.value }}</p>
    </div>
  `,
})
export class SummaryStatCardComponent {
  @Input({ required: true }) config!: SummaryStatConfig;
}
