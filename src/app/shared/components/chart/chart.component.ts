import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartOptions, Plugin } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

export interface ChartDatum {
  name: string;
  value: number;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div [style.height.px]="height" class="relative w-full">
      <canvas
        baseChart
        [type]="chartType"
        [data]="chartData"
        [options]="chartOptions"
        [plugins]="barPlugins"
      ></canvas>
    </div>
  `,
})
export class ChartComponent implements OnChanges {
  @Input() type: 'pie' | 'bar' = 'pie';
  @Input() data: ChartDatum[] = [];
  @Input() height = 240;

  chartType: 'pie' | 'bar' = 'pie';
  chartData: ChartData<'pie' | 'bar'> = { labels: [], datasets: [] };
  barPlugins: Plugin[] = [];

  private readonly PALETTE = [
    '#3D683A', '#f59e0b', '#ef4444', '#0ea5e9',
    '#8b5cf6', '#ec4899', '#0891b2', '#f97316',
    '#14b8a6', '#6366f1', '#84cc16', '#e11d48',
  ];

  chartOptions: ChartOptions<'pie' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 10,
          padding: 12,
          font: { size: 11, weight: 'bold' },
          color: '#64748b',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: true,
        titleFont: { weight: 'bold' },
        bodyFont: { weight: 'bold' },
        callbacks: {
          label: (ctx) => {
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const value = ctx.parsed.y ?? (ctx.parsed as number);
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return ` ${ctx.label}: ${value} (${pct}%)`;
          },
        },
      },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    this.chartType = this.type;
    this.buildChartData();
  }

  private buildChartData(): void {
    const labels = this.data.map((d) => d.name);
    const values = this.data.map((d) => d.value);
    const bgColors = this.data.map((_, i) => this.PALETTE[i % this.PALETTE.length]);
    const hoverColors = bgColors.map((c) => this.darken(c, 15));

    if (this.type === 'pie') {
      this.barPlugins = [];

      this.chartOptions = {
        ...this.chartOptions,
        plugins: {
          ...this.chartOptions.plugins,
          legend: {
            ...this.chartOptions.plugins?.legend,
            display: true,
            position: 'bottom',
          },
        },
      };

      this.chartData = {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: bgColors,
            hoverBackgroundColor: hoverColors,
            borderWidth: 2,
            borderColor: '#f8fafc',
            hoverBorderColor: '#f8fafc',
          },
        ],
      };
    } else {
      this.barPlugins = [DataLabelsPlugin];

      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 11, weight: 'bold' },
              color: '#64748b',
              maxRotation: 0,
              autoSkip: false,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            border: { display: false },
            ticks: {
              font: { size: 11, weight: 'bold' },
              color: '#94a3b8',
              stepSize: 1,
              precision: 0,
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            titleFont: { weight: 'bold' },
            bodyFont: { weight: 'bold' },
            callbacks: {
              label: (ctx) => {
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const value = ctx.parsed.y ?? 0;
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return ` ${ctx.label}: ${value} (${pct}%)`;
              },
            },
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            offset: 4,
            color: '#475569',
            font: { size: 12, weight: 'bold' },
            formatter: (value: number) => value,
          },
        },
      };

      this.chartData = {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: bgColors,
            hoverBackgroundColor: hoverColors,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 36,
            datalabels: {
              display: true,
            },
          },
        ],
      };
    }
  }

  private darken(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
    const b = Math.max(0, (num & 0x0000ff) - amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}
