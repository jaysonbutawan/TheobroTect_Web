import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Scan, ScanResponse } from '../../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class ScansApiService extends BaseApiService {
  protected endpoint = '/scans';

  getScans(): Observable<ScanResponse> {
    return this.get<ScanResponse>('');
  }

  getScanById(id: number): Observable<Scan> {
    return this.get<Scan>(`/${id}`);
  }

  getUserScans(userId: number): Observable<ScanResponse> {
    const params = new HttpParams().set('user_id', userId.toString());
    return this.get<ScanResponse>('', params);
  }

  createScan(scan: Partial<Scan>): Observable<Scan> {
    return this.post<Scan>('', scan);
  }

  updateScan(id: number, scan: Partial<Scan>): Observable<Scan> {
    return this.put<Scan>(`/${id}`, scan);
  }

  deleteScan(id: number): Observable<void> {
    return this.delete<void>(`/${id}`);
  }
}
