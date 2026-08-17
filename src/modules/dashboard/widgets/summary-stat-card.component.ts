import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrendDirection } from './dashboard-helpers';

export interface SummaryStatConfig {
  label: string;
  value: string | number;
  subtitle: string;
  icon: string;
  badgeText?: string;
  gradient: string;
  iconBg: string;
  textColor: string;
  colSpan?: string;
}

export interface TrendIndicator {
  direction: TrendDirection;
  value?: string;
  label?: string;
}

@Component({
  selector: 'app-summary-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="config.colSpan || ''"
      [class]="config.gradient + ' rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all'"
    >
      <div class="flex items-start justify-between mb-3">
        <div
          [class]="
            config.iconBg +
            ' w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md'
          "
        >
          <span class="material-symbols-rounded text-xl">{{ config.icon }}</span>
        </div>

        @if (config.badgeText) {
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {{ config.badgeText }}
          </span>
        } @else if (trend) {
          @if (trend.direction === 'up') {
            <div class="flex items-center gap-1" [class]="trendColorClass('up')">
              <span class="material-symbols-rounded text-sm">trending_up</span>
              <span class="text-[10px] font-black">{{ trend.label || trend.value }}</span>
            </div>
          } @else if (trend.direction === 'down') {
            <div class="flex items-center gap-1" [class]="trendColorClass('down')">
              <span class="material-symbols-rounded text-sm">trending_down</span>
              <span class="text-[10px] font-black">{{ trend.label || trend.value }}</span>
            </div>
          } @else {
            <div class="flex items-center gap-1 text-slate-500">
              <span class="material-symbols-rounded text-sm">trending_flat</span>
              <span class="text-[10px] font-black">Stable</span>
            </div>
          }
        }
      </div>

      <div>
        <p [class]="'text-3xl font-black mb-1 ' + config.textColor">{{ config.value }}</p>
        <p [class]="'text-xs font-semibold ' + config.textColor">{{ config.subtitle }}</p>
        @if (additionalInfo) {
          <p [class]="'text-[10px] font-medium mt-1 ' + config.textColor">
            {{ additionalInfo }}
          </p>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class SummaryStatCardComponent {
  @Input({ required: true }) config!: SummaryStatConfig;
  @Input() trend?: TrendIndicator;
  @Input() additionalInfo?: string;

  trendColorClass(direction: TrendDirection): string {
    if (this.config.icon === 'favorite' || this.config.icon === 'speed') {
      return direction === 'up' ? 'text-emerald-700' : 'text-red-600';
    }

    if (this.config.icon === 'warning') {
      return direction === 'up' ? 'text-red-700' : 'text-green-600';
    }
    return 'text-slate-500';
  }
}
