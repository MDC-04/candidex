import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { RegisterDto, LoginDto, AuthResponse, UserInfo } from '../models/auth.model';
import { environment } from '../../../environments/environment';

/**
 * Authentication service
 * Manages user authentication, JWT tokens, and session state
 * Based on API.md section 1 and SECURITY.md
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'candidex_access_token';
  
  // Observable for current user state
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(this.getCurrentUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, dto)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }
  
  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, dto)
      .pipe(
        tap(response => this.handleAuthResponse(response))
      );
  }
  
  /**
   * Logout user (clear token and state)
   */
  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
  }
  
  /**
   * Get current access token
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }
  
  /**
   * Get current user info
   */
  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  /**
   * Fetch the authenticated user from the backend (GET /auth/me).
   * This is the source of truth: the JWT does not carry the full name,
   * so we re-hydrate the user from the server (e.g. after a page reload).
   */
  fetchCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.API_URL}/auth/me`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  /**
   * Re-hydrate the current user on app startup if a valid token exists.
   * If the backend rejects the token, the local session is cleared.
   */
  loadCurrentUser(): void {
    if (!this.isAuthenticated()) {
      return;
    }
    this.fetchCurrentUser().subscribe({
      error: () => this.logout()
    });
  }
  
  /**
   * Handle authentication response (store token and update state)
   */
  private handleAuthResponse(response: AuthResponse): void {
    sessionStorage.setItem(this.TOKEN_KEY, response.accessToken);
    this.currentUserSubject.next(response.user);
  }
  
  /**
   * Get user info from stored token
   */
  private getCurrentUserFromToken(): UserInfo | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    
    try {
      const payload = this.decodeToken(token);
      return {
        id: payload.userId,
        email: payload.email,
        fullName: '' // Not stored in token
      };
    } catch {
      return null;
    }
  }
  
  /**
   * Decode JWT token (extract payload)
   */
  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token');
    }
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }
}
