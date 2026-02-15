import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet],
  template: `
    <div class="flex">
      <app-sidebar></app-sidebar>

      <div class="flex-1 p-8">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class DashboardComponent {}
