import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrendIndicator } from './summary-stat-card.component';

/**
 * Disease type card configuration
 */
export interface DiseaseCardConfig {
  title: string;
  value: number;
  badge: {
    text: string;
    color: string;
  };
  icon: {
    svg: string;
    color: string;
  };
  backgroundImage: string;
  percentageOfTotal?: string;
  colSpan?: string;
}

@Component({
  selector: 'app-disease-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="config.colSpan || ''"
      class="group relative h-[200px] sm:h-[220px] rounded-2xl overflow-hidden border border-gray-200 bg-white cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <!-- Background Image with Gradient Overlay -->
      <div class="absolute inset-0 overflow-hidden">
        <div
          [style.background-image]="'url(' + config.backgroundImage + ')'"
          class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-20"
        ></div>
        <!-- Modern gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-transparent"></div>
      </div>

      <!-- Content -->
      <div class="relative h-full p-6 flex flex-col justify-between z-10">


        <!-- Footer Content -->
        <div>
          <!-- Title -->
          <p class="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
            {{ config.title }}
          </p>

          <!-- Value and Trend Row -->
          <div class="flex items-end justify-between gap-4">
            <!-- Large Value -->
            <div class="flex-1">
              <p class="text-5xl sm:text-6xl font-black text-gray-900 leading-none">
                {{ config.value }}
              </p>
            </div>
          </div>

          <!-- Percentage Info with Progress Bar -->
          @if (config.percentageOfTotal) {
            <div class="mt-3 flex items-center gap-2">
              <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  [class]="'h-full rounded-full transition-all duration-500 ' + getProgressBarColor()"
                  [style.width]="config.percentageOfTotal"
                ></div>
              </div>
              <span class="text-xs font-bold text-gray-600 whitespace-nowrap">
                {{ config.percentageOfTotal }}
              </span>
            </div>
          }
        </div>
      </div>

      <!-- Decorative accent line that grows on hover -->
      <div [class]="'absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ' + getAccentColor()"></div>
    </div>
  `,
  styles: []
})
export class DiseaseCardComponent {
  @Input({ required: true }) config!: DiseaseCardConfig;
  @Input() trend?: TrendIndicator;

  /**
   * Get icon background color based on badge color
   */
  getIconBackground(): string {
    if (this.config.badge.color.includes('red')) {
      return 'bg-red-500';
    } else if (this.config.badge.color.includes('blue')) {
      return 'bg-blue-500';
    } else if (this.config.badge.color.includes('yellow')) {
      return 'bg-yellow-500';
    }
    return 'bg-gray-500';
  }

  /**
   * Get progress bar color based on badge color
   */
  getProgressBarColor(): string {
    if (this.config.badge.color.includes('red')) {
      return 'bg-gradient-to-r from-red-400 to-red-600';
    } else if (this.config.badge.color.includes('blue')) {
      return 'bg-gradient-to-r from-blue-400 to-blue-600';
    } else if (this.config.badge.color.includes('yellow')) {
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    }
    return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }

  getAccentColor(): string {
    if (this.config.badge.color.includes('red')) {
      return 'bg-red-500 group-hover:h-2';
    } else if (this.config.badge.color.includes('blue')) {
      return 'bg-blue-500 group-hover:h-2';
    } else if (this.config.badge.color.includes('yellow')) {
      return 'bg-yellow-500 group-hover:h-2';
    }
    return 'bg-gray-500 group-hover:h-2';
  }

  getTrendBadgeClass(direction: 'up' | 'down'): string {
    if (direction === 'up') {
      // Increasing disease - bad
      if (this.config.badge.color.includes('red')) {
        return 'bg-red-100 text-red-700 border border-red-200';
      } else if (this.config.badge.color.includes('blue')) {
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      } else {
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      }
    } else {
      // Decreasing disease - good
      return 'bg-green-100 text-green-700 border border-green-200';
    }
  }
}
