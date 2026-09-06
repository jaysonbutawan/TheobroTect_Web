import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReverseGeocodingService } from './reverse-geocoding.service';

describe('ReverseGeocodingService', () => {
  let service: ReverseGeocodingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ReverseGeocodingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shares one request for coordinates with the same normalized key', () => {
    const results: string[] = [];

    service.resolve(7.1234561, 125.1234561).subscribe((value) => results.push(value));
    service.resolve(7.1234562, 125.1234562).subscribe((value) => results.push(value));

    const request = http.expectOne(
      (candidate) => candidate.url === 'https://nominatim.openstreetmap.org/reverse',
    );
    expect(request.request.params.get('lat')).toBe('7.1234561');
    expect(request.request.params.get('lon')).toBe('125.1234561');

    request.flush({
      display_name: 'Santo Niño, Davao del Norte',
      address: { village: 'Santo Niño' },
    });

    expect(results).toEqual(['Santo Niño', 'Santo Niño']);
  });

  it('rejects invalid coordinates before making a request', () => {
    expect(() => service.coordinateKey(91, 125)).toThrowError(RangeError);
    expect(() => service.coordinateKey(7, Number.NaN)).toThrowError(RangeError);
    http.expectNone('https://nominatim.openstreetmap.org/reverse');
  });

  it('does not share cached results when coordinates differ at six decimal places', () => {
    service.resolve(7.123456, 125.123456).subscribe();
    service.resolve(7.123457, 125.123457).subscribe();

    const requests = http.match(
      (candidate) => candidate.url === 'https://nominatim.openstreetmap.org/reverse',
    );

    expect(requests).toHaveLength(2);
    requests[0].flush({ display_name: 'Santo Niño', address: { village: 'Santo Niño' } });
    requests[1].flush({ display_name: 'Sabanangan', address: { village: 'Sabanangan' } });
  });
});
