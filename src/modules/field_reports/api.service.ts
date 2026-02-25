import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "../../environments/environment.prod";
import { ScanResultDto } from "./scan_result.dto";

@Injectable({ providedIn: 'root' })
export class FieldReportsApiService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/field-reports`;

  list(query?: { disease_key?: string; severity_key?: string; limit?: number; offset?: number }) {
  let params = new HttpParams();

  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        params = params.set(k, String(v));
      }
    });
  }

  return this.http.get<{ status: string; scans: ScanResultDto[] }>(this.baseUrl, { params });
}

    getById(id: string) {
        return this.http.get<ScanResultDto>(`${this.baseUrl}/${id}`);
    }

} 
