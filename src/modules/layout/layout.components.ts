import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../../modules/sidebar/sidebar.component';
import { ToastService } from '../../app/shared/components/toast/toast.service';
import { ToastNotificationComponent } from '../../app/shared/components/toast/toast-notification.component';
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from './sidebar-width.constant';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, ToastNotificationComponent],
  templateUrl: './layout.components.html',
})
export class LayoutComponent {
  isMobileMenuOpen = false;
  sideCollapsed = false;
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
