import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Auth error interceptor.
 *
 * When a protected API call returns 401 while we hold a token, it means the
 * session is no longer valid (expired/revoked token). In that case we clear the
 * local session and send the user back to the login page, remembering where
 * they were so they can be returned there after signing in again.
 *
 * A 401 on the login/register endpoints is NOT a session expiry (it just means
 * "wrong credentials"), so those are deliberately ignored here.
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const isApiRequest = req.url.includes('/api/v1');
        const isAuthEndpoint =
          req.url.includes('/api/v1/auth/login') ||
          req.url.includes('/api/v1/auth/register');
        const hadSession = !!authService.getToken();

        if (isApiRequest && !isAuthEndpoint && hadSession) {
          authService.logout();
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: router.url },
          });
        }
      }
      return throwError(() => error);
    })
  );
};
