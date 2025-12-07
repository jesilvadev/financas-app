import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { DashboardResponse } from '../models/dashboard.model';
import { PeriodoDashboard } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly baseUrl = `${environment.apiBaseUrl}api/dashboard`;
  private readonly PERIODO_KEY = 'dashboard_periodo';

  constructor(private readonly http: HttpClient) {}

  obterPeriodoSalvo(): PeriodoDashboard {
    const salvo = localStorage.getItem(this.PERIODO_KEY);
    if (
      salvo &&
      Object.values(PeriodoDashboard).includes(salvo as PeriodoDashboard)
    ) {
      return salvo as PeriodoDashboard;
    }
    // Padrão: mês atual
    return PeriodoDashboard.MES_ATUAL;
  }

  salvarPeriodo(periodo: PeriodoDashboard): void {
    localStorage.setItem(this.PERIODO_KEY, periodo);
  }

  resetarPeriodo(): void {
    localStorage.removeItem(this.PERIODO_KEY);
  }

  obterDashboard(
    usuarioId?: string,
    periodo?: PeriodoDashboard
  ): Observable<DashboardResponse> {
    const periodoUsado = periodo || this.obterPeriodoSalvo();

    let params = new HttpParams();

    if (usuarioId) {
      params = params.set('usuarioId', usuarioId);
    }

    params = params.set('periodo', periodoUsado);

    return this.http.get<DashboardResponse>(this.baseUrl, {
      params,
    });
  }
}
