import { Injectable, inject } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.prod';

import {
  RecommendationDto,
  CreateRecommendationDto,
  UpdateRecommendationDto
} from './recommendation.dto';

@Injectable({
  providedIn: 'root'
})
export class RecommendationSetupService {

  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/recommendations`;

  createRecommendation(
    data: CreateRecommendationDto
  ): Observable<RecommendationDto> {

    return this.http.post<RecommendationDto>(
      this.baseUrl,
      data
    );
  }

 getRecommendations(diseaseId?: number): Observable<RecommendationDto[]> {
    let params = new HttpParams();

    // If a disease ID is passed in, attach it to the request url: ?disease_id=5
    if (diseaseId) {
      params = params.set('disease_id', diseaseId.toString());
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

  updateRecommendation(
    id: number,
    data: UpdateRecommendationDto
  ): Observable<RecommendationDto> {

    return this.http.put<RecommendationDto>(
      `${this.baseUrl}/${id}`,
      data
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
