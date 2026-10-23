import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { LEGEND_ITEMS } from './chart-config';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './line-chart.component.html',
})
export class LineChartComponent {
  @Input({ required: true }) chartData!: ChartConfiguration<'line'>['data'];
  @Input() availableYears: number[] = [];
  @Input() selectedYear: number = new Date().getFullYear();
  @Output() yearSelected = new EventEmitter<number>();

  readonly legend = LEGEND_ITEMS;

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
        grid: { color: '#f1f5f9', lineWidth: 1 },
        border: { display: false },
        ticks: {
          font: { size: 12, family: 'DM Sans, sans-serif' },
          color: '#64748b',
          padding: 8,
          precision: 0,
          maxTicksLimit: 6,
        },
      },
      x: {
        grid: { display: false },
        border: { color: '#e2e8f0' },
        ticks: {
          font: { size: 12, family: 'DM Sans, sans-serif' },
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
        backgroundColor: '#0f172a',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          size: 13,
          family: 'DM Sans, sans-serif',
        },
        bodyFont: {
          size: 12,
          family: 'DM Sans, sans-serif',
        },
        callbacks: {
          title: (context) => `${context[0].label || ''} ${this.selectedYear}`,
          label: (context) => {
            const value = context.parsed.y;
            return ` ${context.dataset.label}: ${value} ${value === 1 ? 'scan' : 'scans'}`;
          },
        },
      },
    },
  };
}
