export interface ScanDto {
  id: number;
  user_id: number;

  user_name: string;
  user_address: string;

  local_id: string;
  image_url: string | null;

  scanned_at: string;
  disease_key: string;
  severity_key: string;

  confidence: number;

  location_lat: number;
  location_lng: number;
  location_accuracy: number | null;
  location_label: string | null;

  next_scan_at: string;

  status: number;

  created_at: string;
  updated_at: string;
}

export interface ScanResponseDto {
  status: string;
  count: number;
  data: ScanDto[];
}
