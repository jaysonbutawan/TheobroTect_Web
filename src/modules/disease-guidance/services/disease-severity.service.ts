import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { Observable, shareReplay, tap } from 'rxjs';

import {
  ApiResponse,
  CreateDiseaseSeverityDto,
  DiseaseSeverityDto
} from '../disease-guidance.dto';

@Injectable({
  providedIn: 'root'
})
export class DiseaseSeverityService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/severities`;

  private severitiesCache$: Observable<ApiResponse<DiseaseSeverityDto[]>> | null = null;

  createSeverity(
    data: CreateDiseaseSeverityDto
  ): Observable<ApiResponse<DiseaseSeverityDto>> {
    return this.http.post<ApiResponse<DiseaseSeverityDto>>(this.baseUrl, data).pipe(
      tap(() => this.invalidateCache())
    );
  }

  getSeverities(): Observable<ApiResponse<DiseaseSeverityDto[]>> {
    if (!this.severitiesCache$) {
      this.severitiesCache$ = this.http.get<ApiResponse<DiseaseSeverityDto[]>>(this.baseUrl).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.severitiesCache$;
  }

  getSeverityById(
    id: number
  ): Observable<ApiResponse<DiseaseSeverityDto>> {
    return this.http.get<ApiResponse<DiseaseSeverityDto>>(`${this.baseUrl}/${id}`);
  }
  invalidateCache(): void {
    this.severitiesCache$ = null;
  }
}
