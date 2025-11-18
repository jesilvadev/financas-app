import { TipoTransacao } from "./tipoTransacao.enum";

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  valor: number;
  data: string;              // ISO date
  descricao?: string | null;
  userId: string;
  categoriaId: string;
  categoriaNome: string;
}

export interface TransacaoRequest {
  tipo: TipoTransacao;
  valor: number;
  data: string;          // ISO date
  descricao?: string | null;
  userId: string;
  categoriaId: string;
}