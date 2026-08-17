import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { AuthApiService } from '../../app/core/services/api/auth-api.service';
import { AuthService } from '../../app/core/services/auth.service';
import { ToastService } from '../../app/shared/components/toast/toast.service';
import { ChangePasswordResponse } from '../../app/shared/models/auth.model';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent password change', () => {
  const authApi = { changePassword: vi.fn() };
  const auth = { clearSession: vi.fn() };
  const router = { navigate: vi.fn().mockResolvedValue(true) };
  const toast = { show: vi.fn() };
  let component: SettingsComponent;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        { provide: AuthApiService, useValue: authApi },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    component = TestBed.createComponent(SettingsComponent).componentInstance;
  });

  it('does not submit an invalid form', () => {
    component.onChangePassword();

    expect(authApi.changePassword).not.toHaveBeenCalled();
    expect(component.passwordForm.controls.currentPassword.touched).toBe(true);
  });

  it('uses the Laravel payload and prevents duplicate submissions', () => {
    const response = new Subject<ChangePasswordResponse>();
    authApi.changePassword.mockReturnValue(response);
    component.passwordForm.setValue({
      currentPassword: 'current-secret',
      newPassword: 'new-secret-123',
      confirmPassword: 'new-secret-123',
    });

    component.onChangePassword();
    component.onChangePassword();

    expect(authApi.changePassword).toHaveBeenCalledTimes(1);
    expect(authApi.changePassword).toHaveBeenCalledWith({
      current_password: 'current-secret',
      new_password: 'new-secret-123',
      new_password_confirmation: 'new-secret-123',
    });
    expect(component.passwordChangeLoading).toBe(true);

    response.next({ status: 'OK' });
    response.complete();
    expect(component.passwordChangeLoading).toBe(false);
  });

  it('clears the revoked session and redirects to login after success', () => {
    authApi.changePassword.mockReturnValue(of({ status: 'OK' }));
    component.passwordForm.setValue({
      currentPassword: 'current-secret',
      newPassword: 'new-secret-123',
      confirmPassword: 'new-secret-123',
    });

    component.onChangePassword();

    expect(auth.clearSession).toHaveBeenCalledOnce();
    expect(router.navigate).toHaveBeenCalledWith(['/'], {
      state: { passwordChanged: true },
    });
  });

  it('shows a safe message for an invalid current password', () => {
    authApi.changePassword.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            error: { status: 'INVALID_CURRENT_PASSWORD' },
          }),
      ),
    );
    component.passwordForm.setValue({
      currentPassword: 'wrong-secret',
      newPassword: 'new-secret-123',
      confirmPassword: 'new-secret-123',
    });

    component.onChangePassword();

    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Password Change Failed',
      'Your current password is incorrect.',
    );
  });

  it('maps Laravel confirmation validation errors without exposing the response', () => {
    authApi.changePassword.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 422,
            error: {
              errors: { new_password: ['The new password confirmation does not match.'] },
            },
          }),
      ),
    );
    component.passwordForm.setValue({
      currentPassword: 'current-secret',
      newPassword: 'new-secret-123',
      confirmPassword: 'new-secret-123',
    });

    component.onChangePassword();

    expect(toast.show).toHaveBeenCalledWith(
      'error',
      'Validation Error',
      'The new passwords do not match.',
    );
  });
});
