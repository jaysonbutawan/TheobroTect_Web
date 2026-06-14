import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { Observable, shareReplay, tap } from 'rxjs';

import {
  ApiResponse,
  DiseaseDto,
  CreateDiseaseDto,
  UpdateDiseaseDto
} from '../disease-guidance.dto';

@Injectable({
  providedIn: 'root'
})
export class DiseaseGuideService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/diseases`;

  // 1. Create a variable to hold the cached observable instance
  private diseasesCache$: Observable<ApiResponse<DiseaseDto[]>> | null = null;

  createDisease(
    data: CreateDiseaseDto
  ): Observable<ApiResponse<DiseaseDto>> {
    return this.http.post<ApiResponse<DiseaseDto>>(this.baseUrl, data).pipe(
      tap(() => this.invalidateCache()) // Invalidate cache on creation
    );
  }

  getDisease(): Observable<ApiResponse<DiseaseDto[]>> {
    // 2. If no cache exists, generate the HTTP call and share the response
    if (!this.diseasesCache$) {
      this.diseasesCache$ = this.http.get<ApiResponse<DiseaseDto[]>>(this.baseUrl).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
        // refCount: false ensures data stays cached even when the user switches tabs/views
      );
    }
    return this.diseasesCache$;
  }

  getDiseaseById(
    id: number
  ): Observable<ApiResponse<DiseaseDto>> {
    return this.http.get<ApiResponse<DiseaseDto>>(`${this.baseUrl}/${id}`);
  }

  updateDisease(
    id: number,
    data: UpdateDiseaseDto
  ): Observable<ApiResponse<DiseaseDto>> {
    return this.http.put<ApiResponse<DiseaseDto>>(`${this.baseUrl}/${id}`, data).pipe(
      tap(() => this.invalidateCache()) // Invalidate cache on updates
    );
  }

  deleteDisease(
    id: number
  ): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.invalidateCache()) // Invalidate cache on deletions
    );
  }

  invalidateCache(): void {
    this.diseasesCache$ = null;
  }
}
