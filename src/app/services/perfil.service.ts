import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.local';
import {
  UpdatePerfilRequest,
  UpdateSenhaRequest,
} from '../models/perfil.model';
import { UsuarioResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  private readonly baseUrl = `${environment.apiBaseUrl}api/perfil`;

  constructor(private readonly http: HttpClient) {}

  atualizarPerfil(
    userId: string,
    payload: UpdatePerfilRequest
  ): Observable<UsuarioResponse> {
    const params = new HttpParams().set('userId', userId);

    // Converte faixaSalario para faixasalario (minúsculo) conforme o endpoint espera
    const requestBody = {
      nome: payload.nome,
      email: payload.email,
      faixasalario: payload.faixaSalario,
    };

    return this.http.put<UsuarioResponse>(this.baseUrl, requestBody, {
      params,
    });
  }

  atualizarSenha(
    userId: string,
    payload: UpdateSenhaRequest
  ): Observable<string> {
    const params = new HttpParams().set('userId', userId);

    return this.http.put<string>(`${this.baseUrl}/senha`, payload, {
      params,
      responseType: 'text' as 'json',
    });
  }

  deletarConta(userId: string): Observable<string> {
    const params = new HttpParams().set('userId', userId);

    return this.http.delete<string>(this.baseUrl, {
      params,
      responseType: 'text' as 'json',
    });
  }
}
