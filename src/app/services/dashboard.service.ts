import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { DashboardResponse } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly baseUrl = `${environment.apiBaseUrl}api/dashboard`;

  constructor(private readonly http: HttpClient) {}

  obterDashboard(usuarioId: string): Observable<DashboardResponse> {
    const params = new HttpParams().set('usuariold', usuarioId);

    return this.http.get<DashboardResponse>(this.baseUrl, {
      params,
    });
  }
}
