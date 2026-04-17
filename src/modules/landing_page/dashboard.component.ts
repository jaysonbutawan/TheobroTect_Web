import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  constructor(private router: Router) {} 

  // Green-themed Chart Data
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Mar 1', 'Mar 8', 'Mar 15', 'Mar 22', 'Mar 29', 'Apr 5'],
    datasets: [
      { data: [20, 25, 22, 28, 25, 20], label: 'Black Pod', backgroundColor: '#166534' }, // Dark Green
      { data: [12, 10, 15, 12, 14, 12], label: 'Mealybug', backgroundColor: '#15803d' },  // Mid Green
      { data: [8, 10, 5, 7, 9, 8], label: 'Pod Borer', backgroundColor: '#22c55e' }       // Light Green
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true } },
    plugins: { legend: { position: 'bottom' } }
  };

  stats = {
    blackPod: 124,
    mealybug: 85,
    podBorer: 42
  };

  recentScans = [
    { farmer: 'Juan Dela Cruz', locationName: 'Tagum - Sector 4', type: 'Black Pod', confidence: 98, coordinates: '7.4477,125.8093' },
    { farmer: 'Maria Santos', locationName: 'Panabo - North Site', type: 'Mealybug', confidence: 85, coordinates: '7.3077,125.6839' },
    { farmer: 'Ricardo Gomez', locationName: 'Mabini - Farm B', type: 'Pod Borer', confidence: 92, coordinates: '7.2833,125.8500' }
  ];

  navigateToMap(coords: string) {
    this.router.navigate(['/dashboard/heatmap'], { queryParams: { loc: coords } });
  }
}