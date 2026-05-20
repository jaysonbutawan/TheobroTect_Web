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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
