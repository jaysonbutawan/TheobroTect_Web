// Common types used across the application

export type Severity = 'Mild' | 'Moderate' | 'Severe';

export type ReportStatus = 'Pending' | 'Under Review' | 'Resolved';

export type ScanStatus = 'complete' | 'failed';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}
