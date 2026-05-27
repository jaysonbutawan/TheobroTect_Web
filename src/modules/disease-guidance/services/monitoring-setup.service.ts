import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';

import {
  ApiResponse,
  MonitoringPlanDto,
  CreateMonitoringPlanDto,
  UpdateMonitoringPlanDto,
} from '../disease-guidance.dto';

@Injectable({
  providedIn: 'root'
})
export class MonitoringSetupService {

  private http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/monitoring-plans`;

  getMonitoringPlans(): Observable<ApiResponse<MonitoringPlanDto[]>> {
    return this.http.get<ApiResponse<MonitoringPlanDto[]>>(this.baseUrl);
  }

  getMonitoringPlanById(id: number): Observable<ApiResponse<MonitoringPlanDto>> {
    return this.http.get<ApiResponse<MonitoringPlanDto>>(`${this.baseUrl}/${id}`);
  }

  createMonitoringPlan(data: CreateMonitoringPlanDto): Observable<ApiResponse<MonitoringPlanDto>> {
    return this.http.post<ApiResponse<MonitoringPlanDto>>(this.baseUrl, data);
  }

  updateMonitoringPlan(id: number, data: UpdateMonitoringPlanDto): Observable<ApiResponse<MonitoringPlanDto>> {
    return this.http.put<ApiResponse<MonitoringPlanDto>>(`${this.baseUrl}/${id}`, data);
  }

  deleteMonitoringPlan(id: number): Observable<ApiResponse<{ message: string }>> {
    return this.http.delete<ApiResponse<{ message: string }>>(`${this.baseUrl}/${id}`);
  }
}
