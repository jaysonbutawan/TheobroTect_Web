import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goBack(): void {
    window.history.length > 1 ? window.history.back() : this.router.navigate(['/']);
  }
}