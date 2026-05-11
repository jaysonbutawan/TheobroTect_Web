import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiseaseGuideService {

  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/diseases`;

  createDisease(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  getDiseases(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getDisease(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  updateDisease(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteDisease(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
