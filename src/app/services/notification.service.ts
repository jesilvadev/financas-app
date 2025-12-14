import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AlertaResponse,
  AtualizarPreferenciaAlertaRequest,
  TipoAlertaInfo,
  VerificacaoAlertasResponse,
} from '../models/alerta.model';
import { environment } from '../../environments/environment.local';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly baseUrl = `${environment.apiBaseUrl}api/alertas`;

  constructor(private http: HttpClient) {}

  // ========================================================================
  // ALERTAS
  // ========================================================================

  /**
   * Lista alertas não vistos do usuário
   */
  listarAlertasNaoVistos(): Observable<AlertaResponse[]> {
    return this.http.get<AlertaResponse[]>(`${this.baseUrl}`);
  }

  /**
   * Lista todos os alertas do usuário (vistos e não vistos)
   */
  listarTodosAlertas(): Observable<AlertaResponse[]> {
    return this.http.get<AlertaResponse[]>(`${this.baseUrl}/todos`);
  }

  /**
   * Marca um alerta como visto
   */
  marcarComoVisto(alertaId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${alertaId}/marcar-visto`, {});
  }

  /**
   * Deleta um alerta
   */
  deletarAlerta(alertaId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${alertaId}`);
  }

  /**
   * Conta alertas não vistos
   */
  contarAlertasNaoVistos(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/contador-nao-vistos`);
  }

  // ========================================================================
  // PREFERÊNCIAS
  // ========================================================================

  /**
   * Lista tipos de alertas disponíveis com preferências do usuário
   */
  listarTiposAlertas(): Observable<TipoAlertaInfo[]> {
    return this.http.get<TipoAlertaInfo[]>(`${this.baseUrl}/preferencias`);
  }

  /**
   * Atualiza preferência de um tipo de alerta
   */
  atualizarPreferencia(
    request: AtualizarPreferenciaAlertaRequest
  ): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/preferencias`, request);
  }

  // ========================================================================
  // VERIFICAÇÃO MANUAL (ADMIN)
  // ========================================================================

  /**
   * Executa verificação manual de alertas para todos os usuários
   */
  verificarAlertasTodosUsuarios(): Observable<VerificacaoAlertasResponse> {
    return this.http.post<VerificacaoAlertasResponse>(
      `${this.baseUrl}/verificar-todos`,
      {}
    );
  }
}
