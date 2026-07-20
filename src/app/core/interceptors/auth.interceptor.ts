import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from '../services/logger.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const logger = inject(LoggerService);
  const token = localStorage.getItem('access_token');

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('Auth interceptor: Token attached to request', { url: req.url });
  } else {
    logger.debug('Auth interceptor: No token found, sending unauthenticated request', { url: req.url });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        logger.warn('Unauthorized request detected, redirecting to login');
        localStorage.removeItem('access_token');
        router.navigate(['/']);
      } else if (error.status === 403) {
        logger.warn('Forbidden request detected');
      } else if (error.status >= 500) {
        logger.error('Server error detected', error);
      }

      return throwError(() => error);
    })
  );
};
