import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './api.service';
import { AdminLoginPayload, AdminLoginResponse } from './login.component.dto';

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

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false]
  });

  onSubmit() {
  //   if (this.loginForm.invalid) {
  //     this.errorMessage = 'Please fill in all required fields correctly.';
  //     return;
  //   }

  //   this.loading = true;
  //   this.errorMessage = '';

  //   const { email, password } = this.loginForm.getRawValue();

  //   const payload: AdminLoginPayload = {
  //     email,
  //     password
  //   };

  //   this.authService.login(payload).subscribe({
  //   next: (res: AdminLoginResponse) => {
  // localStorage.setItem('token', res.token);
  // console.log('saved token:', localStorage.getItem('token'));
  this.router.navigate(['/dashboard']);
  // this.loading = false;

//         }
  }
}