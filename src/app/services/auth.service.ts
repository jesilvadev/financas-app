import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResponse,
} from '../models/auth.model';
import { UsuarioResponse } from '../models/user.model';
import { environment } from '../../environments/environment.local';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly baseUrl = environment.apiBaseUrl;

  private currentUserSubject: BehaviorSubject<UsuarioResponse | null>;
  public currentUser$: Observable<UsuarioResponse | null>;

  constructor(private readonly http: HttpClient) {
    const storedUser = this.getStoredUser();

    this.currentUserSubject = new BehaviorSubject<UsuarioResponse | null>(
      storedUser
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UsuarioResponse | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  public get isAuthenticated(): boolean {
    return !!this.token;
  }

  register(payload: AuthRegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}auth/register`, payload)
      .pipe(tap((response) => this.persistAuthState(response)));
  }

  login(payload: AuthLoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}auth/login`, payload)
      .pipe(tap((response) => this.persistAuthState(response)));
  }

  fetchCurrentUser(): Observable<UsuarioResponse> {
    return this.http
      .get<UsuarioResponse>(`${this.baseUrl}auth/me`)
      .pipe(tap((user) => this.persistUser(user)));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  private persistAuthState(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.persistUser(response.usuario);
  }

  private persistUser(user: UsuarioResponse): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private getStoredUser(): UsuarioResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? (JSON.parse(raw) as UsuarioResponse) : null;
  }
}
