import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/api/base-api.service';
import { LoginPayload, LoginResponse } from '../../../../app/shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService extends BaseApiService {
  protected endpoint = '/auth';

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.post<LoginResponse>('/login', payload);
  }

  logout(): Observable<any> {
    return this.post('/logout', {});
  }

  updateProfile(payload: { name: string; email: string }): Observable<any> {
    return this.put('/profile', payload);
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.put('/password', payload);
  }
}
