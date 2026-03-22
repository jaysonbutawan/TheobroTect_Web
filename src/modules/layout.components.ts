import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../modules/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './layout.components.html',
})
export class LayoutComponent {
     isMobileMenuOpen = false;
    private touchStartX = 0;

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
