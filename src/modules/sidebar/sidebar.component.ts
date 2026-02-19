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

  // This detects if the current URL is field-reports
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
}