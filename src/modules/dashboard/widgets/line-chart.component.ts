import { Component, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
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
  @Output() yearSelected = new EventEmitter<string>();


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
    console.log('CHILD RECEIVED');
    console.log(this.chartData);
  }

  onYearChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.yearSelected.emit(selectElement.value);
  }
}
