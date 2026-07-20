import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../app/core/services/api/auth-api.service';
import { LoginPayload, LoginResponse } from '../../app/shared/models';
import { ToastService } from '../../app/shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private authApiService = inject(AuthApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

  errorMessage = '';
  loading = false;
  showPassword = false;

  loginForm = this.fb.nonNullable.group({
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
    this.errorMessage = '';

    const { email, password } = this.loginForm.getRawValue();

    const payload: LoginPayload = {
      email,
      password
    };

    this.authApiService.login(payload).subscribe({
      next: (res: LoginResponse) => {
        localStorage.setItem('access_token', res.token);
        this.toastService.show('success', 'Login Successful', 'Welcome back!');
        this.router.navigate(['/dashboard']);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        this.toastService.show('error', 'Login Failed', this.errorMessage);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
