import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  console.log('🔥 Interceptor triggered');
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
console.log('TOKEN:', token);
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Token found — Authorization header set:', authReq.headers.get('Authorization'));
  } else {
    console.warn('⚠️ No access_token in localStorage — request sent without Authorization header');
  }

  return next(authReq).pipe(
    catchError((error) => {
      // 🔥 THIS IS THE KEY PART
      if (error.status === 401) {
        localStorage.removeItem('access_token');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
