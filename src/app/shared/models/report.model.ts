import { Severity, ReportStatus } from './common.model';
export interface FieldReport {
  id: string;
  user_id: number;
  scanned_at: string;
  user_address: string;
  disease_key: string;
  severity_key: Severity;
  location_lat?: number;
  location_lng?: number;
  confidence: number;
  status: ReportStatus | number | string;
  location_label?: string;
}
export interface ReportFilters {
  disease_key: string;
  severity_key: Severity | '';
  address: string;
  date: string;
}
