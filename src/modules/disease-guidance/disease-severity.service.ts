import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  CreateDiseaseSeverityDto,
  DiseaseSeverityDto
} from './disease-guidance.dto';

@Injectable({
  providedIn: 'root'
})
export class DiseaseSeverityService {

  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/severities`;

  createSeverity(
    data: CreateDiseaseSeverityDto
  ): Observable<ApiResponse<DiseaseSeverityDto>> {

    return this.http.post<ApiResponse<DiseaseSeverityDto>>(
      this.baseUrl,
      data
    );
  }

  getSeverities(): Observable<ApiResponse<DiseaseSeverityDto[]>> {

    return this.http.get<ApiResponse<DiseaseSeverityDto[]>>(
      this.baseUrl
    );
  }

  getSeverityById(
    id: number
  ): Observable<ApiResponse<DiseaseSeverityDto>> {

    return this.http.get<ApiResponse<DiseaseSeverityDto>>(
      `${this.baseUrl}/${id}`
    );
  }
}
