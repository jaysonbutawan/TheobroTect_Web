import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/auth';

  login(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
}