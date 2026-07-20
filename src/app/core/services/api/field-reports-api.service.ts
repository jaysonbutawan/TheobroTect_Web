import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../../app/core/services/api/base-api.service';
import { FieldReport, ApiResponse } from '../../../../app/shared/models';

export interface FieldReportsResponse extends ApiResponse<FieldReport[]> {
  data: FieldReport[];
}

@Injectable({
  providedIn: 'root'
})
export class FieldReportsApiService extends BaseApiService {
  protected endpoint = '/field-reports';

  getReports(): Observable<FieldReportsResponse> {
    return this.get<FieldReportsResponse>('');
  }

  getReportById(id: string): Observable<FieldReport> {
    return this.get<FieldReport>(`/${id}`);
  }

  createReport(report: Partial<FieldReport>): Observable<FieldReport> {
    return this.post<FieldReport>('', report);
  }

  updateReport(id: string, report: Partial<FieldReport>): Observable<FieldReport> {
    return this.put<FieldReport>(`/${id}`, report);
  }

  deleteReport(id: string): Observable<void> {
    return this.delete<void>(`/${id}`);
  }
}
