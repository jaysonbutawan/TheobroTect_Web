import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, shareReplay } from 'rxjs';

interface NominatimAddress {
  village?: string;
  suburb?: string;
  quarter?: string;
  neighbourhood?: string;
  city_district?: string;
  town?: string;
  city?: string;
  county?: string;
  state?: string;
}

interface NominatimResponse {
  display_name: string;
  address: NominatimAddress;
}

@Injectable({ providedIn: 'root' })
export class ReverseGeocodingService {
  private http = inject(HttpClient);
  private cache = new Map<string, Observable<string>>();

  private readonly fallback = 'Unknown Barangay';
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/reverse';

  resolve(lat: number, lng: number): Observable<string> {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const request$ = this.fetchBarangay(lat, lng).pipe(shareReplay(1));
    this.cache.set(key, request$);

    return request$;
  }

  private fetchBarangay(lat: number, lng: number): Observable<string> {
    const params = {
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1',
      'accept-language': 'en',
    };

    return this.http
      .get<NominatimResponse>(this.baseUrl, { params })
      .pipe(
        map((res) => this.extractBarangay(res)),
        catchError(() => of(this.fallback)),
      );
  }

  private extractBarangay(response: NominatimResponse): string {
    const addr = response.address;

    if (addr.village) return addr.village;
    if (addr.suburb) return addr.suburb;
    if (addr.quarter) return addr.quarter;
    if (addr.neighbourhood) return addr.neighbourhood;
    if (addr.city_district) return addr.city_district;

    return this.fallback;
  }
}
