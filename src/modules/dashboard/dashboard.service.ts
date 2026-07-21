import { Injectable, inject } from '@angular/core';
import { ScansApiService } from '../../app/core/services/api/scans-api.service';
import { ScanResponse } from '../../app/shared/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private scansApi = inject(ScansApiService);

  getUsersScan(): Observable<ScanResponse> {
    return this.scansApi.getScans();
  }
}
