export interface LocalizedText {
  en: string;
  tl: string;
}

export interface DiseaseDto {
  disease_key: string;
  display_name: LocalizedText;
  description: LocalizedText;
  locale: string;
}


export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
