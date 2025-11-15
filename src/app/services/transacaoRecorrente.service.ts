import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  TransacaoRecorrente,
  TransacaoRecorrenteRequest,
} from '../models/transacaoRecorrente.model';
import { environment } from '../../environments/environment.local';

@Injectable({
  providedIn: 'root',
})
export class TransacaoRecorrenteService {
  private readonly baseUrl = `${environment.apiBaseUrl}transacao-recorrente`;

  constructor(private readonly http: HttpClient) {}

  listarPorUsuario(usuarioId: string): Observable<TransacaoRecorrente[]> {
    return this.http.get<TransacaoRecorrente[]>(
      `${this.baseUrl}/buscar-por-usuario/${usuarioId}`
    );
  }

  criar(payload: TransacaoRecorrenteRequest): Observable<TransacaoRecorrente> {
    return this.http.post<TransacaoRecorrente>(this.baseUrl, payload);
  }

  buscarPorId(id: string): Observable<TransacaoRecorrente> {
    return this.http.get<TransacaoRecorrente>(`${this.baseUrl}/${id}`);
  }

  atualizar(
    id: string,
    payload: TransacaoRecorrenteRequest
  ): Observable<TransacaoRecorrente> {
    return this.http.put<TransacaoRecorrente>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
