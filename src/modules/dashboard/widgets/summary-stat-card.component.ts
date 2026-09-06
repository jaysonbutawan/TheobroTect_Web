import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrendDirection } from './dashboard-helpers';

export type SummaryStatIcon = 'fact_check' | 'favorite' | 'warning' | 'speed';

export interface SummaryStatConfig {
  label: string;
  value: string | number;
  subtitle: string;
  icon: SummaryStatIcon;
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
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path [attr.d]="iconPaths[config.icon]" />
          </svg>
        </div>

        @if (config.badgeText) {
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {{ config.badgeText }}
          </span>
        } @else if (trend) {
          @if (trend.direction === 'up') {
            <div class="flex items-center gap-1" [class]="trendColorClass('up')">
              <svg
                class="h-3.5 w-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path [attr.d]="trendIconPaths.up" />
              </svg>
              <span class="text-[10px] font-black">{{ trend.label || trend.value }}</span>
            </div>
          } @else if (trend.direction === 'down') {
            <div class="flex items-center gap-1" [class]="trendColorClass('down')">
              <svg
                class="h-3.5 w-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path [attr.d]="trendIconPaths.down" />
              </svg>
              <span class="text-[10px] font-black">{{ trend.label || trend.value }}</span>
            </div>
          } @else {
            <div class="flex items-center gap-1 text-slate-500">
              <svg
                class="h-3.5 w-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path [attr.d]="trendIconPaths.stable" />
              </svg>
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

  readonly iconPaths: Record<SummaryStatIcon, string> = {
    fact_check:
      'M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14z M10.79 16.29 7.5 13l1.41-1.41 1.88 1.88 4.3-4.29 1.41 1.41z M17.5 8.5h-5v-2h5v2z',
    favorite:
      'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    warning: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
    speed:
      'M20.38 8.57l-1.23 1.85A8 8 0 0 1 18.93 18H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 20h17.29a10 10 0 0 0-.26-11.43z M10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z',
  };

  readonly trendIconPaths: Record<TrendDirection, string> = {
    up: 'M3 17 9 11l4 4 8-8 M14 7h7v7',
    down: 'M3 7l6 6 4-4 8 8 M14 17h7v-7',
    stable: 'M5 12h14 M15 8l4 4-4 4',
  };

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
