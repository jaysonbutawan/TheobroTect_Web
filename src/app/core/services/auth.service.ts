import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      finalize(() => this.clearSession())
    );
  }

  clearSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }
}
