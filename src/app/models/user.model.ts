export interface UsuarioRequest {
  nome?: string;
  email?: string;
  senha?: string;
  faixaSalario?: number | null;
}

export interface UsuarioResponse {
  id: string;
  nome: string;
  email: string;
  faixaSalario: number | null;
  dataCriacao: string;        // ISO date-time
  dataAtualizacao: string;    // ISO date-time
  dataInicioControle: string | null; // ISO date
  primeiroAcesso: boolean;
}