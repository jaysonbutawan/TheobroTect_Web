import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../app/core/services/api/auth-api.service';
import { AuthService } from '../../app/core/services/auth.service';
import { ToastService } from '../../app/shared/components/toast/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authApiService = inject(AuthApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  currentUser: any = null;
  loading = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit() {
    this.currentUser = this.auth.getUser();
    if (this.currentUser) {
      this.profileForm.patchValue({
        name: this.currentUser.name || '',
        email: this.currentUser.email || '',
      });
    }
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) {
      this.toastService.show('error', 'Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    this.loading = true;
    const { name, email } = this.profileForm.getRawValue();

    this.authApiService.updateProfile({ name, email }).subscribe({
      next: (res: any) => {
        const updatedUser = { ...this.currentUser, name, email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.currentUser = updatedUser;
        this.toastService.show('success', 'Profile Updated', 'Your profile has been updated successfully.');
        this.loading = false;
      },
      error: (err) => {
        this.toastService.show('error', 'Update Failed', err.error?.message || 'Failed to update profile. Please try again.');
        this.loading = false;
      },
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) {
      this.toastService.show('error', 'Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.toastService.show('error', 'Password Mismatch', 'New password and confirmation do not match.');
      return;
    }

    this.loading = true;

    this.authApiService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.toastService.show('success', 'Password Changed', 'Your password has been changed successfully.');
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.toastService.show('error', 'Change Failed', err.error?.message || 'Failed to change password. Please check your current password.');
        this.loading = false;
      },
    });
  }
}
