import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import {
  OnboardingRequest,
  OnboardingStatusResponse,
} from '../models/onboarding.model';
import { environment } from '../../environments/environment.local';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  private readonly baseUrl = `${environment.apiBaseUrl}api/onboarding`;

  constructor(private readonly http: HttpClient) {}

  enviarOnboarding(
    payload: OnboardingRequest,
    usuarioId: string
  ): Observable<OnboardingStatusResponse> {
    const body: OnboardingRequest = {
      ...payload,
      usuarioId,
    };

    return this.http
      .post<OnboardingStatusResponse | string>(
        `${this.baseUrl}/onboarding`,
        body,
        {
          headers: this.buildHeaders(usuarioId),
          responseType: 'text' as 'json',
        }
      )
      .pipe(
        map((response) => {
          if (typeof response === 'string') {
            if (!response.trim()) {
              return { onboardingConcluido: true };
            }
            try {
              return JSON.parse(response) as OnboardingStatusResponse;
            } catch {
              return { onboardingConcluido: true };
            }
          }
          return response as OnboardingStatusResponse;
        })
      );
  }

  consultarStatus(usuarioId: string): Observable<OnboardingStatusResponse> {
    return this.http.get<OnboardingStatusResponse>(`${this.baseUrl}/status`, {
      headers: this.buildHeaders(usuarioId),
    });
  }

  private buildHeaders(usuarioId: string): HttpHeaders {
    return new HttpHeaders({
      usuarioId,
    });
  }
}
