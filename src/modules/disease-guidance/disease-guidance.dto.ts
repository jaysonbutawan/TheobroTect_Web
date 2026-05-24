export interface LocalizedText {
  en: string;
  tl: string;
}

export interface DiseaseDto {
  id: number;
  disease_key: string;
  display_name: LocalizedText;
  description: LocalizedText;
  locale: string;
  created_at?: string;   //
  updated_at?: string;   // 
}

export interface CreateDiseaseDto {
  disease_key: string;
  locale: string;
  display_name: LocalizedText;
  description: LocalizedText;
}
export interface UpdateDiseaseDto {
  disease_key?: string;
  locale?: string;
  display_name?: LocalizedText;
  description?: LocalizedText;
}

export interface ChecklistItemSchema {
  id?: string;
  task: string;
  checked: boolean;
}
export interface DiseaseSeverityDto {
  id: number;
  disease_id: number;
  severity_level: string;

  disease?: DiseaseDto;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDiseaseSeverityDto {
  disease_id: number;
  severity_level: string;
}

export interface UpdateDiseaseSeverityDto {
  disease_id?: number;
  severity_level?: string;
}

export interface MonitoringPlanDto {
  id: number;
  disease_key: string;
  disease_severity_id: number | null;
  rescan_after_days: number;
  preferred_time_hour: number | null;
  message: LocalizedText;
  checklist: ChecklistItemSchema[];
  locale: string | null;
  severity?: DiseaseSeverityDto;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMonitoringPlanDto {
  disease_key: string;
  disease_severity_id: number | null;
  rescan_after_days: number;
  preferred_time_hour: number | null;
  message: LocalizedText;
  locale?: string | null;
}
export interface UpdateMonitoringPlanDto {
  rescan_after_days?: number;
  preferred_time_hour?: number | null;
  message?: LocalizedText;
  locale?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
