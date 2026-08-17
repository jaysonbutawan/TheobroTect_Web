import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/api/base-api.service';
import {
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  LoginResponse,
} from '../../../../app/shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService extends BaseApiService {
  protected endpoint = '/auth';

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.post<LoginResponse>('/login', payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<ChangePasswordResponse> {
    return this.patch<ChangePasswordResponse>('/update-password', payload);
  }
}
