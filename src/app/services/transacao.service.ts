import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

import { Transacao, TransacaoRequest } from '../models/transacao.model';
import { environment } from '../../environments/environment.local';

@Injectable({
  providedIn: 'root',
})
export class TransacaoService {
  private readonly baseUrl = `${environment.apiBaseUrl}transacao`;

  private readonly transacoesAtualizadasSubject = new Subject<void>();
  readonly transacoesAtualizadas$ =
    this.transacoesAtualizadasSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  listarPorUsuario(usuarioId: string): Observable<Transacao[]> {
    return this.http.get<Transacao[]>(
      `${this.baseUrl}/buscar-por-usuario/${usuarioId}`
    );
  }

  criar(payload: TransacaoRequest): Observable<Transacao> {
    return this.http.post<Transacao>(this.baseUrl, payload).pipe(
      tap(() => {
        this.transacoesAtualizadasSubject.next();
      })
    );
  }

  buscarPorId(id: string): Observable<Transacao> {
    return this.http.get<Transacao>(`${this.baseUrl}/${id}`);
  }

  atualizar(id: string, payload: TransacaoRequest): Observable<Transacao> {
    return this.http.put<Transacao>(`${this.baseUrl}/${id}`, payload).pipe(
      tap(() => {
        this.transacoesAtualizadasSubject.next();
      })
    );
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.transacoesAtualizadasSubject.next();
      })
    );
  }
}
