// Common types used across the application

export type Severity = 'Mild' | 'Moderate' | 'Severe';

export type ReportStatus = 'Pending' | 'Under Review' | 'Resolved';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
