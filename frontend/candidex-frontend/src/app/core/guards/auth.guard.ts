import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard (functional guard)
 * Protects routes that require authentication.
 * If not authenticated, redirects to login and remembers the attempted URL
 * (returnUrl) so the user can be sent back there after signing in.
 * Based on SECURITY.md section 5
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Redirect to login if not authenticated, keeping the target URL
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
