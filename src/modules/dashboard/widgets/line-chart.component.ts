import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './line-chart.component.html',
})
export class LineChartComponent implements OnChanges {
  @Input({ required: true }) chartData!: ChartConfiguration<'line'>['data'];
  @Input() availableYears: number[] = [];
  @Input() selectedYear: number = new Date().getFullYear();
  @Output() yearSelected = new EventEmitter<number>();

  isYearDropdownOpen: boolean = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (this.isYearDropdownOpen && !target.closest('.year-selector-container')) {
      this.isYearDropdownOpen = false;
    }
  }

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Cases',
          font: {
            size: 13,
            weight: 'bold',
            family: 'DM Sans, sans-serif',
          },
          padding: { bottom: 12 },
          color: '#475569',
        },
        grid: {
          color: '#e2e8f0',
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold',
            family: 'DM Sans, sans-serif',
          },
          color: '#64748b',
          padding: 8,
          stepSize: 1,
          precision: 0,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
          font: {
            size: 13,
            weight: 'bold',
            family: 'DM Sans, sans-serif',
          },
          padding: { top: 12 },
          color: '#475569',
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 'bold',
            family: 'DM Sans, sans-serif',
          },
          color: '#64748b',
          padding: 8,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          size: 13,
          weight: 'bold',
          family: 'DM Sans, sans-serif',
        },
        bodyFont: {
          size: 12,
          weight: 'bold',
          family: 'DM Sans, sans-serif',
        },
        callbacks: {
          title: (context) => {
            return `${context[0].label || ''} ${this.selectedYear}`;
          },
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return ` ${label}: ${value} ${value === 1 ? 'case' : 'cases'}`;
          },
          footer: (context) => {
            const total = context.reduce((sum, item) => sum + (item.parsed.y || 0), 0);
            return `\nTotal: ${total} ${total === 1 ? 'case' : 'cases'}`;
          },
        },
      },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {}

  toggleYearDropdown(): void {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
  }

  selectYear(year: number): void {
    this.isYearDropdownOpen = false;
    this.yearSelected.emit(year);
  }
}
