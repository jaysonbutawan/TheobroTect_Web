import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { ScanResponseDto } from './dashboard.dto';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/scans`

  getUsersScan(): Observable<ScanResponseDto> {
    return this.http.get<ScanResponseDto>(`${this.baseUrl}`);
  }
}
