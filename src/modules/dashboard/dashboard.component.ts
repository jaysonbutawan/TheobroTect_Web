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

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      { data: [110, 115, 120, 130, 125, 115, 110], label: 'Healthy Cacao', borderColor: '#a3e635', tension: 0.4, fill: false, pointBackgroundColor: '#a3e635' },
      { data: [65, 59, 80, 81, 56, 55, 40], label: 'Black Pod (Severe)', borderColor: '#166534', tension: 0.4, fill: false, pointBackgroundColor: '#166534' },
      { data: [28, 48, 40, 19, 86, 27, 90], label: 'Mealybug (Mild)', borderColor: '#4ade80', tension: 0.4, fill: false, pointBackgroundColor: '#4ade80' },
      { data: [45, 35, 25, 40, 30, 60, 50], label: 'Pod Borer (Mild)', borderColor: '#15803d', tension: 0.4, fill: false, pointBackgroundColor: '#15803d' }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  navigateToMap(coords: string) {
    this.router.navigate(['/dashboard/heatmap'], { queryParams: { loc: coords } });
  }
}