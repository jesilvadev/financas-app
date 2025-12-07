import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { MetaRequest, MetaResponse, AporteRequest } from '../models/meta.model';

@Injectable({
  providedIn: 'root',
})
export class MetaService {
  private readonly baseUrl = `${environment.apiBaseUrl}api/metas`;

  constructor(private readonly http: HttpClient) {}

  criarMeta(request: MetaRequest): Observable<MetaResponse> {
    return this.http.post<MetaResponse>(this.baseUrl, request);
  }

  listarMetas(): Observable<MetaResponse[]> {
    return this.http.get<MetaResponse[]>(this.baseUrl);
  }

  obterMetaPorId(id: string): Observable<MetaResponse> {
    return this.http.get<MetaResponse>(`${this.baseUrl}/${id}`);
  }

  atualizarMeta(id: string, request: MetaRequest): Observable<MetaResponse> {
    return this.http.put<MetaResponse>(`${this.baseUrl}/${id}`, request);
  }

  excluirMeta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  adicionarAporte(request: AporteRequest): Observable<MetaResponse> {
    return this.http.post<MetaResponse>(`${this.baseUrl}/${request.idMeta}/aportes`, request);
  }
}