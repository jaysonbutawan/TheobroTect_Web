import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError, timeout } from 'rxjs';

export const LOCATION_UNAVAILABLE = 'Location unavailable';

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

  private readonly maxCacheEntries = 500;
  private readonly requestTimeoutMs = 10_000;
  private readonly baseUrl = 'https://nominatim.openstreetmap.org/reverse';

  resolve(lat: number, lng: number): Observable<string> {
    const key = this.coordinateKey(lat, lng);
    const cached = this.cache.get(key);

    if (cached) {
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }

    const request$ = this.fetchBarangay(lat, lng).pipe(
      timeout({ first: this.requestTimeoutMs }),
      catchError((error: unknown) => {
        this.cache.delete(key);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.cache.set(key, request$);
    this.evictOldestCacheEntry();

    return request$;
  }

  coordinateKey(lat: number, lng: number): string {
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    ) {
      throw new RangeError('Invalid reverse-geocoding coordinates');
    }

    return `${lat.toFixed(6)},${lng.toFixed(6)}`;
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
      .pipe(map((res) => this.extractBarangay(res)));
  }

  private extractBarangay(response: NominatimResponse): string {
    const addr = response.address;

    if (addr.village) return addr.village;
    if (addr.suburb) return addr.suburb;
    if (addr.quarter) return addr.quarter;
    if (addr.neighbourhood) return addr.neighbourhood;
    if (addr.city_district) return addr.city_district;

    return LOCATION_UNAVAILABLE;
  }

  private evictOldestCacheEntry(): void {
    if (this.cache.size <= this.maxCacheEntries) return;

    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) this.cache.delete(oldestKey);
  }
}
