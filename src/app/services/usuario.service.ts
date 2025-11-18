import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';
import { UsuarioResponse } from '../models/user.model';

export interface UsuarioUpdateRequest {
  nome?: string;
  email?: string;
  senha?: string;
  faixaSalario?: number;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly baseUrl = `${environment.apiBaseUrl}usuario`;

  constructor(private readonly http: HttpClient) {}

  buscarPorId(id: string): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.baseUrl}/${id}`);
  }

  atualizar(
    id: string,
    payload: UsuarioUpdateRequest
  ): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.baseUrl}/${id}`, payload);
  }
}
