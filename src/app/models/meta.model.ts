export interface MetaRequest {
  nome: string;
  valorAlvo: number;
  dataAlvo: string;  // ISO date (YYYY-MM-DD)
}

export interface AporteRequest {
  idMeta: string;
  valor: number;
  data: string;  // ISO date (YYYY-MM-DD)
}

export interface AporteResponse {
  valor: number;
  data: string;  // ISO date (YYYY-MM-DD)
}

export interface MetaResponse {
  id: string;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  dataAlvo: string;  // ISO date (YYYY-MM-DD)
  progresso: number;
  aportes: AporteResponse[];
  concluida: boolean;
  aporteMensalSugerido: number;
}