import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthApiService } from '../../app/core/services/api/auth-api.service';
import { AuthService } from '../../app/core/services/auth.service';
import { ToastService } from '../../app/shared/components/toast/toast.service';
import {
  ChangePasswordPayload,
  ChangePasswordStatus,
} from '../../app/shared/models/auth.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  private authApiService = inject(AuthApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  passwordChangeLoading = false;

  readonly passwordFields = [
    { key: 'currentPassword', label: 'Current password', autocomplete: 'current-password' },
    { key: 'newPassword', label: 'New password', autocomplete: 'new-password' },
    { key: 'confirmPassword', label: 'Confirm new password', autocomplete: 'new-password' },
  ] as const;

  private visibleFields = new Set<string>();

  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  get passwordRules(): { label: string; met: boolean }[] {
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    return [
      { label: 'Be at least 8 characters long', met: newPassword.length >= 8 },
      { label: 'Be different from your current password', met: !!newPassword && newPassword !== currentPassword },
      { label: 'Match the confirmation', met: !!newPassword && newPassword === confirmPassword },
    ];
  }

  isVisible(key: string): boolean {
    return this.visibleFields.has(key);
  }

  toggleVisibility(key: string): void {
    if (!this.visibleFields.delete(key)) this.visibleFields.add(key);
  }

  fieldError(key: (typeof this.passwordFields)[number]['key']): string {
    const control = this.passwordForm.controls[key];
    if (!control.touched) return '';
    if (control.hasError('required')) {
      return {
        currentPassword: 'Current password is required.',
        newPassword: 'New password is required.',
        confirmPassword: 'Please confirm your new password.',
      }[key];
    }
    if (control.hasError('minlength')) return 'Use at least 8 characters.';
    if (control.hasError('passwordMismatch')) return 'The new passwords do not match.';
    return '';
  }

  onChangePassword(): void {
    if (this.passwordChangeLoading) return;

    this.passwordForm.markAllAsTouched();

    if (this.passwordForm.invalid) {
      const message = this.passwordForm.controls.newPassword.hasError('minlength')
        ? 'Your new password must contain at least 8 characters.'
        : 'Please complete all password fields.';
      this.toastService.show('error', 'Check Your Passwords', message);
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.passwordForm.controls.confirmPassword.setErrors({ passwordMismatch: true });
      this.toastService.show('error', 'Password Mismatch', 'The new passwords do not match.');
      return;
    }

    this.passwordForm.controls.confirmPassword.setErrors(null);
    this.passwordChangeLoading = true;

    const payload: ChangePasswordPayload = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: confirmPassword,
    };

    this.authApiService
      .changePassword(payload)
      .pipe(finalize(() => (this.passwordChangeLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.status !== 'OK') {
            this.showStatusError(response.status);
            return;
          }

          this.passwordForm.reset();
          this.auth.clearSession();
          void this.router.navigate(['/'], {
            state: { passwordChanged: true },
          });
        },
        error: (error: HttpErrorResponse) => {
          this.handlePasswordChangeError(error);
        },
      });
  }

  private handlePasswordChangeError(error: HttpErrorResponse): void {
    const status = error.error?.status as ChangePasswordStatus | undefined;

    if (status) {
      this.showStatusError(status);
      if (status === 'USER_NOT_FOUND') {
        this.endSession('Your session is no longer valid. Please sign in again.');
      }
      return;
    }

    if (error.status === 422) {
      const errors = error.error?.errors as Record<string, string[]> | undefined;
      const confirmationErrors = errors?.['new_password_confirmation'] ?? errors?.['new_password'];
      const message = confirmationErrors?.some((item) => item.toLowerCase().includes('confirm'))
        ? 'The new passwords do not match.'
        : errors?.['current_password']
          ? 'Your current password is required.'
          : 'Please check the password fields and try again.';
      this.toastService.show('error', 'Validation Error', message);
      return;
    }

    if (error.status === 401) {
      this.endSession('Your session has expired. Please sign in again.');
      return;
    }

    const message =
      error.status === 0
        ? 'Unable to connect to the server. Check your connection and try again.'
        : 'The password could not be updated right now. Please try again later.';
    this.toastService.show('error', 'Password Change Failed', message);
  }

  private showStatusError(status: ChangePasswordStatus): void {
    const messages: Record<Exclude<ChangePasswordStatus, 'OK'>, string> = {
      INVALID_CURRENT_PASSWORD: 'Your current password is incorrect.',
      USER_NOT_FOUND: 'Your account could not be found.',
      NOT_ADMIN: 'Only administrator accounts can change a password here.',
      ACCOUNT_DELETED: 'This account is no longer active.',
    };

    if (status !== 'OK') {
      this.toastService.show('error', 'Password Change Failed', messages[status]);
    }
  }

  private endSession(message: string): void {
    this.auth.clearSession();
    void this.router.navigate(['/'], { state: { authMessage: message } });
  }
}
