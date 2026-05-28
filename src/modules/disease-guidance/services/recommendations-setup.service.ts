import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.prod';

import {
  RecommendationDto,
  SaveRecommendationsDto,
  ApiResponse
} from '../recommendation.dto';

@Injectable({
  providedIn: 'root'
})
export class RecommendationSetupService {

  private http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apiUrl}/recommendations`;

  saveRecommendations(
    data: SaveRecommendationsDto
  ): Observable<ApiResponse<RecommendationDto[]>> {

    return this.http.post<ApiResponse<RecommendationDto[]>>(
      this.baseUrl,
      data
    );
  }

  getRecommendations(
    diseaseId?: number
  ): Observable<RecommendationDto[]> {
    let params = new HttpParams();

    if (diseaseId) {
      params = params.set(
        'disease_id',
        diseaseId.toString()
      );
    }
    return this.http.get<RecommendationDto[]>(
      this.baseUrl,
      { params }
    );
  }

  getRecommendationById(
    id: number
  ): Observable<RecommendationDto> {

    return this.http.get<RecommendationDto>(
      `${this.baseUrl}/${id}`
    );
  }
  deleteRecommendation(
    id: number
  ): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${id}`
    );
  }
}
