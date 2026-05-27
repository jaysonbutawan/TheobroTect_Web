export interface RecommendationDto {
  id: number;
  disease_severity_id: number | null;
  category_key: string;

  content:
    | Record<string, any>
    | Record<string, any>[];

  sort_order: number;
  locale: string | null;
  created_at: string;
  updated_at: string;
  severity?: any;
}

export interface CreateRecommendationDto {
  disease_key: string | null;

  disease_severity_id?: number | null;

  category_key: string;

  content:
    | Record<string, any>
    | Record<string, any>[];

  sort_order?: number;

  locale?: string | null;
}

export interface UpdateRecommendationDto {
  category_key?: string;

  content?:
    | Record<string, any>
    | Record<string, any>[];

  sort_order?: number;

  locale?: string | null;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
}export interface RecommendationDto {
  id: number;
  disease_severity_id: number | null;
  category_key: string;

  content:
    | Record<string, any>
    | Record<string, any>[];

  sort_order: number;
  locale: string | null;
  created_at: string;
  updated_at: string;
  severity?: any;
}

export interface CreateRecommendationDto {
  disease_key: string | null;

  disease_severity_id?: number | null;

  category_key: string;

  content:
    | Record<string, any>
    | Record<string, any>[];

  sort_order?: number;

  locale?: string | null;
}

export interface UpdateRecommendationDto {
  category_key?: string;

  content?:
    | Record<string, any>
    | Record<string, any>[];

  sort_order?: number;

  locale?: string | null;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
}
