import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { RelatorioMensalResponse } from '../models/relatorio.model';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  private readonly baseUrl = `${environment.apiBaseUrl}api/relatorios`;

  constructor(private readonly http: HttpClient) {}

  obterRelatorioMensal(usuarioId: string, mes: number, ano: number): Observable<RelatorioMensalResponse> {
    const params = new HttpParams()
      .set('userId', usuarioId)
      .set('mes', mes.toString())
      .set('ano', ano.toString());

    return this.http.get<RelatorioMensalResponse>(`${this.baseUrl}/mensal`, {
      params,
    });
  }

  exportarTransacoes(usuarioId: string, formato: string = 'csv'): Observable<Blob> {
    const params = new HttpParams()
      .set('userId', usuarioId)
      .set('formato', formato);

    return this.http.get(`${this.baseUrl}/exportacao/transacoes`, {
      params,
      responseType: 'blob',
    });
  }

  exportarTransacoesMensal(
    usuarioId: string,
    mes: number,
    ano: number,
    formato: string = 'csv'
  ): Observable<Blob> {
    const params = new HttpParams()
      .set('userId', usuarioId)
      .set('mes', mes.toString())
      .set('ano', ano.toString())
      .set('formato', formato);

    return this.http.get(`${this.baseUrl}/exportacao/transacoes/mensal`, {
      params,
      responseType: 'blob',
    });
  }
}