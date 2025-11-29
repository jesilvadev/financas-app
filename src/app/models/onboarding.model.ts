import { TransacaoRecorrenteOnboardingRequest } from './transacaoRecorrente.model';

export interface OnboardingStatusResponse {
  onboardingConcluido: boolean;
}

export interface OnboardingRequest {
  dataInicioControle: string; // ISO date
  usuarioId?: string;
  saldoAtual?: number;
  transacoesRecorrentes?: TransacaoRecorrenteOnboardingRequest[];
}
