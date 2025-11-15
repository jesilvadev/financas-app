import { TipoTransacao } from "./tipoTransacao.enum";

export interface TransacaoRecorrente {
  id: string;
  tipo: TipoTransacao;
  valor: number;
  descricao?: string | null;
  diaRecorrencia: number;    // 1-31
  ativa: boolean;
  userId: string;
  categoriaId: string;
  categoriaNome: string;
}

export interface TransacaoRecorrenteRequest {
  tipo: TipoTransacao;
  valor: number;
  descricao?: string | null;
  diaRecorrencia: number;
  ativa?: boolean;
  userId: string;
  categoriaId: string;
}

export interface TransacaoRecorrenteOnboardingRequest {
  tipo: TipoTransacao;
  valor: number;
  descricao?: string | null;
  diaRecorrencia: number;
  categoriaId?: string | null;
}