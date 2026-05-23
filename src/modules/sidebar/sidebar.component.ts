import { Component, Input, Output, EventEmitter } from '@angular/core'; //  Added Input, Output, and EventEmitter
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  link: string;
  exact: boolean;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  // 1. Turned this into an @Input to accept the state from LayoutComponent
  @Input() isCollapsed = false; 
  
  // 2. Added @Output to emit the state changes back up to LayoutComponent
  @Output() collapseChanged = new EventEmitter<boolean>(); 

  isReportsOpen = false;

  navItems: NavItem[] = [
    {
      link: '/dashboard',
      exact: true,
      label: 'Dashboard',
      icon: 'pi pi-th-large',
    },
    {
      link: '/dashboard/user-management',
      exact: false,
      label: 'User Management',
      icon: 'pi pi-users',
    },
    {
      link: '/dashboard/field-reports',
      exact: false,
      label: 'Field Reports',
      icon: 'pi pi-file',
    },
    {
      link: '/dashboard/heatmap',
      exact: false,
      label: 'Heat Maps',
      icon: 'pi pi-map',
    },
    {
      link: '/dashboard/guide',
      exact: false,
      label: 'Disease Guide',
      icon: 'pi pi-book',
    },
  ];

  constructor(private router: Router) {}

  isReportsActive(): boolean {
    return this.router.url.includes('field-reports');
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) this.isReportsOpen = false;
    
    // 3. Emit the updated state so the main content container resizes instantly!
    this.collapseChanged.emit(this.isCollapsed); 
  }

  toggleReports() {
    this.isReportsOpen = !this.isReportsOpen;
  }
}