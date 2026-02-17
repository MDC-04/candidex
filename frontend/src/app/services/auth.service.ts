import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, SignupRequest } from '../models/auth.model';
import { Router } from '@angular/router';

const API_URL = 'http://localhost:8080/api/auth/';
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_URL + 'login', credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
        this.saveUser(response);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  signup(userData: SignupRequest): Observable<any> {
    return this.http.post(API_URL + 'signup', userData);
  }

  logout(): void {
    this.clearStorage();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  public saveToken(token: string): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private saveUser(user: AuthResponse): void {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): AuthResponse | null {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  private clearStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  public isLoggedIn(): boolean {
    return this.hasToken();
  }
}
