import { Component, Input, OnChanges, SimpleChanges, EventEmitter, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './line-chart.component.html'
})
export class LineChartComponent implements OnChanges {
  // Receive the data from the parent component
  @Input({ required: true }) chartData!: ChartConfiguration<'line'>['data'];
  @Input() availableYears: number[] = [];
  @Input() selectedYear: number = new Date().getFullYear();
  @Output() yearSelected = new EventEmitter<number>();

  isYearDropdownOpen: boolean = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Close dropdown if clicking outside the year selector
    if (this.isYearDropdownOpen && !target.closest('.year-selector-container')) {
      this.isYearDropdownOpen = false;
    }
  }

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Cases',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: { bottom: 10 }
        },
        grid: {
          color: '#f3f4f6'
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    // Chart data received and will be re-rendered
  }

  toggleYearDropdown(): void {
    this.isYearDropdownOpen = !this.isYearDropdownOpen;
  }

  selectYear(year: number): void {
    this.isYearDropdownOpen = false;
    this.yearSelected.emit(year);
  }
}
