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

export interface MonitoringPlanDto {
  id: number;
  title?: string;
  description?: string;
}

export interface RecommendationDto {
  id: number;
  recommendation?: string;
}

export interface DiseaseSeverityDto {
  id: number;
  disease_id: number;
  severity_level: string;

  disease?: DiseaseDto;
  monitoring_plan?: MonitoringPlanDto;
  recommendations?: RecommendationDto[];

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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
