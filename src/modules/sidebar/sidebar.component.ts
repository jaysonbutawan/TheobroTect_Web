import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css' 
})
export class SidebarComponent {
  isCollapsed = false;
  isReportsOpen = false;

  constructor(private router: Router) {}

  isReportsActive(): boolean {
    return this.router.url.includes('field-reports');
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) this.isReportsOpen = false;
  }

  toggleReports() {
    this.isReportsOpen = !this.isReportsOpen;
  }

  logout() {
  const confirmed = confirm('Are you sure you want to sign out?');

  if (confirmed) {
    // Clear stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Redirect to login
    this.router.navigate(['/login']);
  }
}
}