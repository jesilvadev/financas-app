import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Categoria, CategoriaRequest } from '../models/categoria.model';
import { environment } from '../../environments/environment.local';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly baseUrl = `${environment.apiBaseUrl}categoria`;

  constructor(private readonly http: HttpClient) {}

  listarPorUsuario(usuarioId: string): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(
      `${this.baseUrl}/buscar-por-usuario/${usuarioId}`
    );
  }

  criar(payload: CategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(this.baseUrl, payload);
  }

  buscarPorId(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.baseUrl}/${id}`);
  }

  atualizar(id: string, payload: CategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/${id}`, payload);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
