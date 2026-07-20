import { Severity, ReportStatus } from './common.model';

export interface FieldReport {
  id: string;
  timestamp: string;
  barangay: string;
  category: string;
  severity: Severity;
  status: ReportStatus;
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
  images?: string[];
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReportFilters {
  barangay: string;
  category: string;
  severity: Severity | '';
  date: string;
  status?: ReportStatus | '';
}
