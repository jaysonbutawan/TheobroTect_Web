import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../../modules/sidebar/sidebar.component';
import { ToastService } from '../../app/shared/components/toast/toast.service';
import { ToastNotificationComponent } from '../../app/shared/components/toast/toast-notification.component';
import { ConfirmationDialogComponent } from '../../app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../../app/core/services/auth.service';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from './sidebar-width.constant';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, ToastNotificationComponent, ConfirmationDialogComponent],
  templateUrl: './layout.components.html',
})
export class LayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isMobileMenuOpen = false;
  sideCollapsed = false;
  showLogoutConfirm = false;
  isLoggingOut = false;
  private touchStartX = 0;

  readonly SIDEBAR_COLLAPSED_WIDTH = SIDEBAR_COLLAPSED_WIDTH;
  readonly SIDEBAR_EXPANDED_WIDTH = SIDEBAR_EXPANDED_WIDTH;

  constructor(public toastService: ToastService) {}

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  closeMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
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
        this.closeMenu();
        this.router.navigate(['/']);
      },
      error: () => {
        this.isLoggingOut = false;
        this.showLogoutConfirm = false;
        this.closeMenu();
        this.router.navigate(['/']);
      },
    });
  }

  swipeStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  swipeEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].screenX;
    if (this.touchStartX - touchEndX > 50) {
      this.closeMenu();
    }
  }

  @HostListener('window:keydown.escape')
  handleEscape() {
    if (this.isMobileMenuOpen) this.closeMenu();
  }
}
