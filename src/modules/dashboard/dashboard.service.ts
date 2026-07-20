import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ScanResponse } from '../../app/shared/models';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/scans`

  getUsersScan(): Observable<ScanResponse> {
    return this.http.get<ScanResponse>(`${this.baseUrl}`);
  }
}
