import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  DiseaseDto
} from './disease-guidance.dto';

@Injectable({
  providedIn: 'root'
})
export class DiseaseGuideService {

  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/diseases`;

  createDisease(
    data: DiseaseDto
  ): Observable<ApiResponse<DiseaseDto>> {

    return this.http.post<ApiResponse<DiseaseDto>>(
      this.baseUrl,
      data
    );
  }

  getDisease(): Observable<ApiResponse<DiseaseDto[]>> {

    return this.http.get<ApiResponse<DiseaseDto[]>>(
      this.baseUrl
    );
  }

  getDiseaseById(
    id: number
  ): Observable<ApiResponse<DiseaseDto>> {

    return this.http.get<ApiResponse<DiseaseDto>>(
      `${this.baseUrl}/${id}`
    );
  }

  updateDisease(
    id: number,
    data: DiseaseDto
  ): Observable<ApiResponse<DiseaseDto>> {

    return this.http.put<ApiResponse<DiseaseDto>>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  deleteDisease(
    id: number
  ): Observable<ApiResponse<null>> {

    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/${id}`
    );
  }
}
