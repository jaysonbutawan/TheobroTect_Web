import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../logger.service';

@Injectable()
export abstract class BaseApiService {
  protected abstract endpoint: string;
  
  protected http = inject(HttpClient);
  protected logger = inject(LoggerService);
  
  protected get baseUrl(): string {
    return `${environment.apiUrl}${this.endpoint}`;
  }

  protected get<T>(path: string = '', params?: HttpParams): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`GET ${url}`, { params });
    
    return this.http.get<T>(url, { params }).pipe(
      tap(res => this.logger.debug(`GET ${url} - Success`, res)),
      catchError(err => this.handleError(err, 'GET', url))
    );
  }

  protected post<T>(path: string = '', body: any): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`POST ${url}`, { body });
    
    return this.http.post<T>(url, body).pipe(
      tap(res => this.logger.debug(`POST ${url} - Success`, res)),
      catchError(err => this.handleError(err, 'POST', url))
    );
  }

  protected put<T>(path: string = '', body: any): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`PUT ${url}`, { body });
    
    return this.http.put<T>(url, body).pipe(
      tap(res => this.logger.debug(`PUT ${url} - Success`, res)),
      catchError(err => this.handleError(err, 'PUT', url))
    );
  }

  protected patch<T>(path: string = '', body: any): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`PATCH ${url}`, { body });
    
    return this.http.patch<T>(url, body).pipe(
      tap(res => this.logger.debug(`PATCH ${url} - Success`, res)),
      catchError(err => this.handleError(err, 'PATCH', url))
    );
  }

  protected delete<T>(path: string = ''): Observable<T> {
    const url = `${this.baseUrl}${path}`;
    this.logger.debug(`DELETE ${url}`);
    
    return this.http.delete<T>(url).pipe(
      tap(res => this.logger.debug(`DELETE ${url} - Success`, res)),
      catchError(err => this.handleError(err, 'DELETE', url))
    );
  }

  private handleError(error: HttpErrorResponse, method: string, url: string): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      this.logger.error(`${method} ${url} - Client Error`, error.error);
    } else {
      // Server-side error
      errorMessage = `Server Error (${error.status}): ${error.message}`;
      this.logger.error(`${method} ${url} - Server Error`, {
        status: error.status,
        message: error.message,
        error: error.error
      });
    }

    return throwError(() => error);
  }
}
