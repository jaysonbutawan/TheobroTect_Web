import { Component } from '@angular/core';
import { Router } from '@angular/router'; 
import { CommonModule } from '@angular/common'; // Standard Angular directives (ngClass, ngFor)

@Component({
  selector: 'app-dashboard',
  standalone: true,           // Ensure this is here for modern Angular
  imports: [CommonModule],    // THIS IS THE KEY: This fixes the ngClass/ngFor error
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css' // Changed from .html to .css
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

  navigateToMap(coords: string) {
    // Navigates to Field Reports and passes the coordinates
    this.router.navigate(['/dashboard/field-reports'], { queryParams: { loc: coords } });
  }
}