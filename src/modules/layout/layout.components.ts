import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Adjust your paths as necessary
import { SidebarComponent } from '../../modules/sidebar/sidebar.component';
import { ToastService } from '../../app/shared/components/toast/toast.service';
import { ToastNotificationComponent } from '../../app/shared/components/toast/toast-notification.component'; // 🌟 ADD THIS

@Component({
  selector: 'app-layout',
  standalone: true,
  // 🌟 ADD ToastNotificationComponent to the imports array
  imports: [CommonModule, RouterOutlet, SidebarComponent, ToastNotificationComponent],
  templateUrl: './layout.components.html',
})
export class LayoutComponent {
  isMobileMenuOpen = false;
  sideCollapsed = false;
  private touchStartX = 0;

  constructor(public toastService: ToastService) {}

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  swipeStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  swipeEnd(event: TouchEvent) {
    const touchEndX = event.changedTouches[0].screenX;
    if (this.touchStartX - touchEndX > 50) {
      this.isMobileMenuOpen = false;
    }
  }

  @HostListener('window:keydown.escape', ['$event'])
  handleKeyDown(event: any) {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  closeMenu(): void {
    this.isMobileMenuOpen = false;
  }
}
