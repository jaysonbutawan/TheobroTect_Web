export interface ScanResultDto {
    id: string;
    user_id: string;
    local_id: string;

    image_url: string | null;

    scanned_at: string;
    disease_key: string;
    severity_key: string;
    confidence: number;

    location_lat: number | null;
    location_lng: number | null;
    location_accuracy: number | null;
    location_label: string | null;

    next_scan_at: string | null;

    created_at: string;
    updated_at: string;
}