import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../app/core/services/auth.service';
import { ConfirmationDialogComponent } from '../../app/shared/components/confirmation-dialog/confirmation-dialog.component';

interface NavItem {
  link: string;
  exact: boolean;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, ConfirmationDialogComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() collapseChanged = new EventEmitter<boolean>();

  private auth = inject(AuthService);
  private router = inject(Router);

  showLogoutConfirm = false;
  isLoggingOut = false;

  navItems: NavItem[] = [
    { link: '/dashboard', exact: true, label: 'Dashboard', icon: 'pi pi-th-large' },
    { link: '/dashboard/user-management', exact: false, label: 'User Management', icon: 'pi pi-users' },
    { link: '/dashboard/field-reports', exact: false, label: 'Field Reports', icon: 'pi pi-file' },
    { link: '/dashboard/heatmap', exact: false, label: 'Heat Maps', icon: 'pi pi-map' },
    { link: '/dashboard/guide', exact: false, label: 'Disease Guide', icon: 'pi pi-book' },
  ];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.collapseChanged.emit(this.isCollapsed);
  }

  openLogoutDialog(): void {
    this.showLogoutConfirm = true;
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  confirmLogout(): void {
    this.isLoggingOut = true;
    this.auth.logout().subscribe({
      next: () => {
        this.isLoggingOut = false;
        this.showLogoutConfirm = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.isLoggingOut = false;
        this.showLogoutConfirm = false;
        this.router.navigate(['/']);
      },
    });
  }

  get labelClass(): string {
    return this.isCollapsed
      ? 'hidden w-0 opacity-0'
      : 'block w-auto opacity-100 animate-fade-in';
  }
}
