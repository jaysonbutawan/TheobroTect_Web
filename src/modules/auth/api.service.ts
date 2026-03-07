import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { AdminLoginPayload, AdminLoginResponse } from './login.component.dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/admin`;

  login(data: AdminLoginPayload): Observable<AdminLoginResponse> {
  return this.http.post<AdminLoginResponse>(`${this.baseUrl}/login`, data);
}
}