import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const logger = inject(LoggerService);
    
    const user = authService.getUser();
    
    if (user && allowedRoles.includes(user.role)) {
      logger.debug('Role guard: User has required role', { role: user.role });
      return true;
    }
    
    logger.warn('Role guard: User does not have required role', { 
      userRole: user?.role, 
      required: allowedRoles 
    });
    
    // Redirect to unauthorized page or dashboard
    router.navigate(['/dashboard']);
    return false;
  };
};
