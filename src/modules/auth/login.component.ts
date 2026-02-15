import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';
  loading = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Invalid credentials';
        this.loading = false;
      }
    });
  }
}